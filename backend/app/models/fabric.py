from sqlalchemy import Column, Integer, String, Float, Boolean, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class FabricType(Base):
    __tablename__ = "jenis_kain"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    category = Column(String(50), nullable=False)
    quality = Column(String(10), nullable=False)
    class_label = Column(String(100), nullable=False, unique=True)
    deskripsi = Column(Text)
    karakteristik = Column(Text)
    penggunaan_umum = Column(Text)
    cara_perawatan = Column(Text)
    image_url = Column(String(255))

    # Kolom baru
    tagline = Column(Text)
    cocok_untuk = Column(Text)
    kelebihan = Column(Text)        # JSON array string
    kekurangan = Column(Text)       # JSON array string
    saran_pakai = Column(Text)
    tips_perawatan = Column(Text)   # JSON array of {icon, judul, tips}

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    histories = relationship("ClassificationHistory", back_populates="fabric_type")


class ActiveModel(Base):
    __tablename__ = "active_models"

    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String(50), nullable=False)
    model_path = Column(String(255), nullable=False)
    accuracy = Column(Float)
    is_active = Column(Boolean, default=False)
    set_by = Column(Integer, ForeignKey("users.id"))
    set_at = Column(DateTime, server_default=func.now())


class ClassificationHistory(Base):
    __tablename__ = "riwayat_klasifikasi"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    session_id = Column(String(100))
    image_filename = Column(String(255))
    image_path = Column(String(255))
    predicted_class = Column(String(100))
    fabric_type_id = Column(Integer, ForeignKey("jenis_kain.id", ondelete="SET NULL"), nullable=True)
    confidence = Column(Float)
    model_used = Column(String(50))
    category = Column(String(10), default="umum")
    batch_id = Column(String(100))
    created_at = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="histories")
    fabric_type = relationship("FabricType", back_populates="histories")