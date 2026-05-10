import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import get_settings
from app.core.database import Base, engine
from app.api.auth import router as auth_router
from app.api.classify import router as classify_router
from app.api.data import history_router, fabric_router

settings = get_settings()

# Buat semua tabel otomatis
Base.metadata.create_all(bind=engine)

# Buat folder upload
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

app = FastAPI(
    title="PATTERNA API",
    description="Klasifikasi Kain dengan Deep Learning",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

app.include_router(auth_router, prefix="/api")
app.include_router(classify_router, prefix="/api")
app.include_router(history_router, prefix="/api")
app.include_router(fabric_router, prefix="/api")


@app.get("/")
def root():
    return {"message": "PATTERNA API v1.0 — SQLite", "docs": "/docs"}


@app.get("/api/health")
def health():
    return {"status": "ok"}
