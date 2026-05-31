from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.fabric import ClassificationHistory, FabricType
from app.schemas.schemas import HistoryOut, FabricTypeOut

# Histori
history_router = APIRouter(prefix="/history", tags=["History"])


@history_router.get("/", response_model=List[HistoryOut])
def get_my_history(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    records = (
        db.query(ClassificationHistory)
        .filter(ClassificationHistory.user_id == current_user.id)
        .order_by(ClassificationHistory.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    return [
        {
            "id": h.id,
            "image_filename": h.image_filename,
            "image_url": f"/uploads/{h.image_filename}" if h.image_filename else None,
            "predicted_class": h.predicted_class,
            "confidence": h.confidence,
            "category": h.category,
            "batch_id": h.batch_id,
            "model_used": h.model_used,
            "created_at": h.created_at,
            "fabric_type": h.fabric_type,
        }
        for h in records
    ]


@history_router.delete("/{history_id}")
def delete_history(
    history_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    record = db.query(ClassificationHistory).filter(
        ClassificationHistory.id == history_id,
        ClassificationHistory.user_id == current_user.id,
    ).first()
    if not record:
        raise HTTPException(404, "Riwayat tidak ditemukan")
    db.delete(record)
    db.commit()
    return {"message": "Riwayat dihapus"}


# Kain
fabric_router = APIRouter(prefix="/fabrics", tags=["Fabrics"])


@fabric_router.get("/", response_model=List[FabricTypeOut])
def get_all_fabrics(
    category: Optional[str] = None,
    quality: Optional[str] = None,
    db: Session = Depends(get_db),
):
    q = db.query(FabricType)
    if category:
        q = q.filter(FabricType.category == category)
    if quality:
        q = q.filter(FabricType.quality == quality)
    return q.all()


@fabric_router.get("/{fabric_id}", response_model=FabricTypeOut)
def get_fabric_detail(fabric_id: int, db: Session = Depends(get_db)):
    fabric = db.query(FabricType).filter(FabricType.id == fabric_id).first()
    if not fabric:
        raise HTTPException(404, "Data kain tidak ditemukan")
    return fabric


@fabric_router.get("/label/{class_label}", response_model=FabricTypeOut)
def get_fabric_by_label(class_label: str, db: Session = Depends(get_db)):
    fabric = db.query(FabricType).filter(FabricType.class_label == class_label).first()
    if not fabric:
        raise HTTPException(404, "Data kain tidak ditemukan")
    return fabric