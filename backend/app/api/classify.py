import os
import uuid
import aiofiles
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user_optional, get_konveksi_user  # ← tambah import
from app.core.config import get_settings
from app.models.fabric import ClassificationHistory, FabricType
from app.schemas.schemas import ClassificationResult, BulkClassificationResult
from app.services.model_service import classify_image, get_active_model_name

router = APIRouter(prefix="/classify", tags=["Classification"])
settings = get_settings()
ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}
CONFIDENCE_THRESHOLD = 0.70


async def save_upload(file: UploadFile) -> tuple:
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    ext = os.path.splitext(file.filename or "img.jpg")[1] or ".jpg"
    filename = f"{uuid.uuid4().hex}{ext}"
    path = os.path.join(settings.UPLOAD_DIR, filename)
    contents = await file.read()
    if len(contents) > settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024:
        raise HTTPException(400, f"Ukuran file maksimal {settings.MAX_UPLOAD_SIZE_MB}MB")
    async with aiofiles.open(path, "wb") as f:
        await f.write(contents)
    return filename, path, contents


@router.get("/status")
def model_status():
    model_name = get_active_model_name()
    return {"model_active": model_name, "is_dummy": model_name == "dummy", "ready": model_name != "dummy"}


# ─── Umum: boleh tanpa login ──────────────────────────────────────────────────
@router.post("/umum", response_model=ClassificationResult)
async def classify_umum(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user_optional),  # ← opsional, tidak wajib login
):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(400, "Format gambar harus JPEG, PNG, atau WebP")

    filename, path, contents = await save_upload(file)

    try:
        predicted_class, confidence, model_used = classify_image(contents)
    except Exception as e:
        raise HTTPException(500, f"Gagal memproses gambar: {str(e)}")

    if model_used == "dummy":
        raise HTTPException(503, "Model klasifikasi belum tersedia.")

    if confidence < CONFIDENCE_THRESHOLD:
        raise HTTPException(422,
            f"Gambar tidak dapat dikenali sebagai kain "
            f"(confidence: {round(confidence * 100)}%). "
            f"Pastikan foto merupakan close-up tekstur kain dengan pencahayaan yang cukup."
        )

    fabric = db.query(FabricType).filter(FabricType.class_label == predicted_class).first()

    history_id = None
    if current_user:
        h = ClassificationHistory(
            user_id=current_user.id,
            image_filename=filename,
            image_path=path,
            predicted_class=predicted_class,
            fabric_type_id=fabric.id if fabric else None,
            confidence=confidence,
            model_used=model_used,
            category="umum",
        )
        db.add(h)
        db.commit()
        db.refresh(h)
        history_id = h.id

    return ClassificationResult(
        predicted_class=predicted_class,
        confidence=confidence,
        quality="Baik" if "_baik" in predicted_class else "Buruk",
        fabric_info=fabric,
        model_used=model_used,
        history_id=history_id,
    )


# ─── Konveksi: WAJIB login + role konveksi ───────────────────────────────────
@router.post("/konveksi", response_model=BulkClassificationResult)
async def classify_konveksi(
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_konveksi_user),  # ← wajib login & role konveksi
):
    if not files:
        raise HTTPException(400, "Minimal 1 gambar harus diupload")
    if len(files) > 50:
        raise HTTPException(400, "Maksimal 50 gambar per batch")

    active = get_active_model_name()
    if active == "dummy":
        raise HTTPException(503, "Model klasifikasi belum tersedia.")

    batch_id = uuid.uuid4().hex
    results = []
    rejected = []

    for i, file in enumerate(files):
        img_label = file.filename or f"Gambar {i + 1}"

        if file.content_type not in ALLOWED_TYPES:
            rejected.append({"index": i, "filename": img_label, "reason": "Format file tidak didukung (harus JPG/PNG/WebP)"})
            continue

        try:
            filename, path, contents = await save_upload(file)
            predicted_class, confidence, model_used = classify_image(contents)
        except Exception:
            rejected.append({"index": i, "filename": img_label, "reason": "Gagal memproses gambar"})
            continue

        if confidence < CONFIDENCE_THRESHOLD:
            rejected.append({"index": i, "filename": img_label, "reason": f"Tidak dikenali sebagai kain (confidence: {round(confidence * 100)}%)"})
            continue

        fabric = db.query(FabricType).filter(FabricType.class_label == predicted_class).first()

        h = ClassificationHistory(
            user_id=current_user.id,   # ← pasti ada karena wajib login
            image_filename=filename,
            image_path=path,
            predicted_class=predicted_class,
            fabric_type_id=fabric.id if fabric else None,
            confidence=confidence,
            model_used=model_used,
            category="konveksi",
            batch_id=batch_id,
        )
        db.add(h)
        db.commit()
        db.refresh(h)

        results.append(ClassificationResult(
            predicted_class=predicted_class,
            confidence=confidence,
            quality="Baik" if "_baik" in predicted_class else "Buruk",
            fabric_info=fabric,
            model_used=model_used,
            history_id=h.id,
        ))

    return BulkClassificationResult(
        batch_id=batch_id,
        total=len(results),
        results=results,
        rejected=rejected,
        rejected_count=len(rejected),
    )