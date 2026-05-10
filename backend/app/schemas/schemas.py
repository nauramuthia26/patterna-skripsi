from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "umum"  # ← tambah: "umum" atau "konveksi"

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str          # ← sudah ada, pastikan terkirim ke frontend
    created_at: datetime
    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

class FabricTypeOut(BaseModel):
    id: int
    name: str
    category: str
    quality: str
    class_label: str
    deskripsi: Optional[str] = None
    karakteristik: Optional[str] = None
    penggunaan_umum: Optional[str] = None
    cara_perawatan: Optional[str] = None
    image_url: Optional[str] = None
    class Config:
        from_attributes = True

class ClassificationResult(BaseModel):
    predicted_class: str
    confidence: float
    quality: str
    fabric_info: Optional[FabricTypeOut] = None
    model_used: str
    history_id: Optional[int] = None

class RejectedItem(BaseModel):
    index: int
    filename: str
    reason: str

class BulkClassificationResult(BaseModel):
    batch_id: str
    total: int
    results: List[ClassificationResult]
    rejected: List[RejectedItem] = []
    rejected_count: int = 0

class HistoryOut(BaseModel):
    id: int
    image_filename: Optional[str] = None
    predicted_class: Optional[str] = None
    confidence: Optional[float] = None
    category: Optional[str] = None
    batch_id: Optional[str] = None
    model_used: Optional[str] = None
    created_at: datetime
    fabric_type: Optional[FabricTypeOut] = None
    class Config:
        from_attributes = True

class UpdateProfileRequest(BaseModel):
    name: Optional[str] = None
    password: Optional[str] = None