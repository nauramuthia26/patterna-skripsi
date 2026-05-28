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
Base.metadata.create_all(bind=engine)
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

app = FastAPI(
    title="PATTERNA API",
    description="Klasifikasi Kain dengan Deep Learning",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

app.include_router(auth_router, prefix="/api")
app.include_router(classify_router, prefix="/api")
app.include_router(history_router, prefix="/api")
app.include_router(fabric_router, prefix="/api")


@app.on_event("startup")
async def startup_event():
    """Load model ke memori saat server start agar request pertama tidak lambat."""
    from app.services.model_service import get_active_model_name, load_model, preprocess_for_efficientnet
    import numpy as np

    model_name = get_active_model_name()
    if model_name != "dummy":
        print(f"[Startup] Memuat model '{model_name}'...")
        model = load_model(model_name)
        if model:
            # Warm up — jalankan prediksi dummy sekali
            # agar TensorFlow siap dan request pertama tidak kena cold start
            dummy = np.zeros((1, 224, 224, 3), dtype=np.float32)
            model.predict(dummy, verbose=0)
            print("[Startup] ✅ Model siap, warm-up selesai")
    else:
        print("[Startup] ⚠️ Mode dummy aktif, tidak ada model yang dimuat")


@app.get("/")
def root():
    return {"message": "PATTERNA API v1.0", "docs": "/docs"}


@app.get("/api/health")
def health():
    return {"status": "ok"}