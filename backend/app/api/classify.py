import os
import uuid
import aiofiles
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user_optional, get_konveksi_user
from app.core.config import get_settings
from app.models.fabric import ClassificationHistory, FabricType
from app.schemas.schemas import ClassificationResult, BulkClassificationResult
from app.services.model_service import classify_image, classify_images_batch, get_active_model_name

router = APIRouter(prefix="/classify", tags=["Classification"])
settings = get_settings()

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}
CONFIDENCE_THRESHOLD = 0.60


async def save_upload(file: UploadFile) -> tuple:
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

    ext = os.path.splitext(file.filename or "img.jpg")[1] or ".jpg"
    filename = f"{uuid.uuid4().hex}{ext}"
    path = os.path.join(settings.UPLOAD_DIR, filename)

    contents = await file.read()

    if len(contents) > settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024:
        raise HTTPException(
            400,
            f"Ukuran file maksimal {settings.MAX_UPLOAD_SIZE_MB}MB"
        )

    async with aiofiles.open(path, "wb") as f:
        await f.write(contents)

    return filename, path, contents


@router.get("/status")
def model_status():
    model_name = get_active_model_name()

    return {
        "model_active": model_name,
        "is_dummy": model_name == "dummy",
        "ready": model_name != "dummy",
    }


# ──────────────────────────────────────────────────────────
# UMUM — boleh tanpa login
# ──────────────────────────────────────────────────────────

@router.post("/umum", response_model=ClassificationResult)
async def classify_umum(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user_optional),
):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            400,
            "Format gambar harus JPEG, PNG, atau WebP"
        )

    filename, path, contents = await save_upload(file)

    try:
        predicted_class, confidence, model_used = classify_image(contents)

    except ValueError as e:
        # Error validasi dari model_service
        raise HTTPException(422, str(e))

    except Exception as e:
        raise HTTPException(
            500,
            f"Gagal memproses gambar: {str(e)}"
        )

    if model_used == "dummy":
        raise HTTPException(
            503,
            "Model klasifikasi belum tersedia."
        )

    if confidence < CONFIDENCE_THRESHOLD:
        raise HTTPException(
            422,
            f"Gambar tidak dapat dikenali sebagai kain "
            f"(confidence: {round(confidence * 100)}%). "
            f"Pastikan foto merupakan close-up tekstur kain dengan pencahayaan yang cukup."
        )
    
    fabric = (
        db.query(FabricType)
        .filter(FabricType.class_label == predicted_class)
        .first()
    )

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


# ──────────────────────────────────────────────────────────
# KONVEKSI — wajib login + role konveksi
# ──────────────────────────────────────────────────────────

@router.post("/konveksi", response_model=BulkClassificationResult)
async def classify_konveksi(
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_konveksi_user),
):
    if not files:
        raise HTTPException(400, "Minimal 1 gambar harus diupload")

    if len(files) > 10:
        raise HTTPException(400, "Maksimal 10 gambar per batch")

    active = get_active_model_name()

    if active == "dummy":
        raise HTTPException(503, "Model klasifikasi belum tersedia.")

    batch_id = uuid.uuid4().hex

    valid_items = []
    rejected = []

    for i, file in enumerate(files):
        img_label = file.filename or f"Gambar {i + 1}"

        if file.content_type not in ALLOWED_TYPES:
            rejected.append({
                "index": i,
                "filename": img_label,
                "reason": "Format file tidak didukung (harus JPG/PNG/WebP)"
            })
            continue

        try:
            filename, path, contents = await save_upload(file)

            valid_items.append({
                "index": i,
                "filename_original": img_label,
                "filename": filename,
                "path": path,
                "contents": contents
            })

        except HTTPException as e:
            rejected.append({
                "index": i,
                "filename": img_label,
                "reason": str(e.detail)
            })
            continue

        except Exception:
            rejected.append({
                "index": i,
                "filename": img_label,
                "reason": "Gagal membaca atau menyimpan gambar"
            })
            continue

    if not valid_items:
        return BulkClassificationResult(
            batch_id=batch_id,
            total=0,
            results=[],
            rejected=rejected,
            rejected_count=len(rejected),
        )

    try:
        batch_predictions = classify_images_batch(
            [item["contents"] for item in valid_items]
        )

    except ValueError as e:
        raise HTTPException(422, str(e))

    except Exception as e:
        raise HTTPException(500, f"Gagal memproses batch gambar: {str(e)}")

    results = []

    for item, pred in zip(valid_items, batch_predictions):
        predicted_class = pred["predicted_class"]
        confidence = pred["confidence"]
        model_used = pred["model_used"]

        if confidence < CONFIDENCE_THRESHOLD:
            rejected.append({
                "index": item["index"],
                "filename": item["filename_original"],
                "reason": (
                    f"Tidak dikenali sebagai kain "
                    f"(confidence: {round(confidence * 100)}%)"
                )
            })
            continue

        fabric = (
            db.query(FabricType)
            .filter(FabricType.class_label == predicted_class)
            .first()
        )

        h = ClassificationHistory(
            user_id=current_user.id,
            image_filename=item["filename"],
            image_path=item["path"],
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

        results.append(
            ClassificationResult(
                predicted_class=predicted_class,
                confidence=confidence,
                quality="Baik" if "_baik" in predicted_class else "Buruk",
                fabric_info=fabric,
                model_used=model_used,
                history_id=h.id,
            )
        )

    return BulkClassificationResult(
        batch_id=batch_id,
        total=len(results),
        results=results,
        rejected=rejected,
        rejected_count=len(rejected),
    )