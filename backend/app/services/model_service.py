"""
Model Service — load & jalankan model TensorFlow/Keras.

Preprocessing pipeline (SAMA dengan training):
  1. Center crop 50%
  2. Resize 224x224
  3. CLAHE
  4. Brightness normalization
  5. efficientnet_preprocess (untuk EfficientNetB0)
     atau /255.0 (untuk CNN)
"""

import os
import random
import numpy as np
import cv2
from PIL import Image
import io
from typing import Tuple, Optional

CLASS_LABELS = [
    "katun_baik",
    "katun_buruk",
    "linen_baik",
    "linen_buruk",
    "poli_baik",
    "poli_buruk",
    "polikatun_baik",
    "polikatun_buruk",
    "rayon_baik",
    "rayon_buruk",
]

IMG_SIZE = (224, 224)
_loaded_models: dict = {}
_active_model_name: Optional[str] = None


# ─── Preprocessing Pipeline ──────────────────────────────

def crop_center_texture(img_bgr, scale=0.5):
    h, w = img_bgr.shape[:2]
    new_h, new_w = int(h * scale), int(w * scale)
    sy, sx = h // 2 - new_h // 2, w // 2 - new_w // 2
    return img_bgr[sy:sy + new_h, sx:sx + new_w]


def step2_clahe(img_bgr, clip_limit=2.0, tile_grid=(8, 8)):
    lab = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=clip_limit, tileGridSize=tile_grid)
    lab_clahe = cv2.merge([clahe.apply(l), a, b])
    return cv2.cvtColor(lab_clahe, cv2.COLOR_LAB2BGR)


def step3_brightness_norm(img_bgr):
    hsv = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2HSV).astype(np.float32)
    h, s, v = cv2.split(hsv)
    mean_v = v.mean()
    if mean_v < 60:
        v = np.clip(v * (120.0 / (mean_v + 1e-7)), 0, 255)
    elif mean_v > 200:
        v = np.clip(v * (180.0 / mean_v), 0, 255)
    return cv2.cvtColor(cv2.merge([h, s, v]).astype(np.uint8), cv2.COLOR_HSV2BGR)


def read_image(image_bytes: bytes) -> np.ndarray:
    """Baca bytes gambar → BGR numpy array."""
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        pil = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        img = cv2.cvtColor(np.array(pil), cv2.COLOR_RGB2BGR)
    return img


def preprocess_for_efficientnet(image_bytes: bytes) -> np.ndarray:
    """
    Preprocessing untuk EfficientNetB0 — sesuai training:
    crop → resize → CLAHE → brightness → efficientnet_preprocess
    """
    from tensorflow.keras.applications.efficientnet import preprocess_input

    img_bgr = read_image(image_bytes)
    img = crop_center_texture(img_bgr, 0.5)
    img = cv2.resize(img, IMG_SIZE, interpolation=cv2.INTER_AREA)
    img = step2_clahe(img)
    img = step3_brightness_norm(img)
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    arr = np.array(img_rgb, dtype=np.float32)
    arr = preprocess_input(arr)           # ← sama persis dengan training
    return np.expand_dims(arr, axis=0)


def preprocess_for_mobilenet(image_bytes: bytes) -> np.ndarray:
    from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
    img_bgr = read_image(image_bytes)
    img = crop_center_texture(img_bgr, 0.5)
    img = cv2.resize(img, IMG_SIZE, interpolation=cv2.INTER_AREA)
    img = step2_clahe(img)
    img = step3_brightness_norm(img)
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    arr = preprocess_input(np.array(img_rgb, dtype=np.float32))
    return np.expand_dims(arr, axis=0)


def preprocess_for_resnet(image_bytes: bytes) -> np.ndarray:
    from tensorflow.keras.applications.resnet50 import preprocess_input
    img_bgr = read_image(image_bytes)
    img = crop_center_texture(img_bgr, 0.5)
    img = cv2.resize(img, IMG_SIZE, interpolation=cv2.INTER_AREA)
    img = step2_clahe(img)
    img = step3_brightness_norm(img)
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    arr = preprocess_input(np.array(img_rgb, dtype=np.float32))
    return np.expand_dims(arr, axis=0)


PREPROCESS_FN = {
    "efficientnetb0": preprocess_for_efficientnet,
    "mobilenetv2":    preprocess_for_mobilenet,
    "resnet50":       preprocess_for_resnet,
}

def is_fabric_image(image_bytes: bytes) -> tuple[bool, str]:
    """
    Filter sederhana untuk mendeteksi apakah gambar kemungkinan kain.
    Cek berdasarkan: variance tekstur, saturasi warna, dan keseragaman.
    Return: (is_fabric, reason)
    """
    img_bgr = read_image(image_bytes)
    img = crop_center_texture(img_bgr, 0.5)
    img = cv2.resize(img, (224, 224))

    # Cek 1: Variance tekstur via Laplacian
    # Gambar kain punya tekstur berulang → variance sedang (tidak terlalu tinggi/rendah)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    lap_var = cv2.Laplacian(gray, cv2.CV_64F).var()

    # Gambar terlalu blur (foto bukan close-up) atau terlalu tajam (screenshot/grafik)
    if lap_var < 30:
        return False, f"Gambar terlalu blur (skor tekstur: {lap_var:.1f})"
    if lap_var > 8000:
        return False, f"Gambar terdeteksi sebagai grafik/screenshot (skor: {lap_var:.1f})"

    # Cek 2: Saturasi — gambar kain umumnya tidak terlalu jenuh warnanya
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    mean_sat = hsv[:, :, 1].mean()
    if mean_sat > 180:
        return False, f"Warna terlalu jenuh untuk kain (saturasi: {mean_sat:.1f})"

    # Cek 3: Keseragaman warna — kain punya distribusi warna yang relatif merata
    # Gambar dengan area solid besar (logo, teks, background polos) ditolak
    std_gray = gray.std()
    if std_gray < 8:
        return False, f"Gambar terlalu seragam/polos (std: {std_gray:.1f})"

    return True, "OK"

# ─── Model Loading ───────────────────────────────────────

def get_model_dir() -> str:
    return os.path.join(os.path.dirname(__file__), "..", "..", "models")


def _find_model_file(label: str) -> Optional[str]:
    """Cari file model berdasarkan label."""
    base = get_model_dir()
    name_map = {
        "efficientnetb0": ["EfficientNetB0_best", "efficientnetb0"],
        "mobilenetv2":    ["MobileNetV2_best",    "mobilenetv2"],
        "resnet50":       ["ResNet50_best",        "resnet50"],
    }
    names = name_map.get(label, [label])
    for name in names:
        for ext in [".keras", ".h5"]:
            path = os.path.join(base, name + ext)
            if os.path.exists(path):
                return path
    return None


def _find_any_model() -> Tuple[Optional[str], Optional[str]]:
    """Cari model apapun yang tersedia, return (path, label)."""
    for label in ["efficientnetb0", "mobilenetv2", "resnet50"]:
        path = _find_model_file(label)
        if path:
            return path, label
    return None, None


def get_active_model_name() -> str:
    global _active_model_name
    if _active_model_name:
        return _active_model_name
    _, label = _find_any_model()
    if label:
        _active_model_name = label
        return label
    return "dummy"


def set_active_model(model_name: str):
    global _active_model_name
    _active_model_name = model_name


def load_model(model_name: str):
    if model_name in _loaded_models:
        return _loaded_models[model_name]

    path = _find_model_file(model_name)
    if not path:
        print(f"[ModelService] ❌ File model '{model_name}' tidak ditemukan")
        return None

    try:
        import tensorflow as tf
        print(f"[ModelService] TF={tf.__version__}, Keras={tf.keras.__version__}")
        print(f"[ModelService] Memuat: {path}")

        model = tf.keras.models.load_model(path, compile=False)
        _loaded_models[model_name] = model
        print(f"[ModelService] ✅ Model '{model_name}' berhasil dimuat!")
        print(f"[ModelService] Input shape: {model.input_shape}")
        print(f"[ModelService] Output shape: {model.output_shape}")
        return model

    except Exception as e:
        print(f"[ModelService] ❌ Gagal load model: {e}")
        print(f"[ModelService] → Coba jalankan: pip install --upgrade tensorflow keras")
        return None


# ─── Klasifikasi ─────────────────────────────────────────

def classify_image(image_bytes: bytes) -> Tuple[str, float, str]:
    """Return: (predicted_class, confidence, model_used)"""
    model_name = get_active_model_name()

    if model_name == "dummy":
        raise ValueError("Tidak ada model yang tersedia di folder models/")

    model = load_model(model_name)
    if model is None:
        raise ValueError(f"Model '{model_name}' gagal dimuat. Cek file .keras")

    # ── Filter tekstur sebelum prediksi ──────────────────
    is_fabric, reason = is_fabric_image(image_bytes)
    if not is_fabric:
        raise ValueError(f"Bukan gambar kain: {reason}")
    # ─────────────────────────────────────────────────────

    try:
        preprocess_fn = PREPROCESS_FN.get(model_name, preprocess_for_efficientnet)
        img_array = preprocess_fn(image_bytes)
        predictions = model.predict(img_array, verbose=0)[0]
        idx = int(np.argmax(predictions))
        return CLASS_LABELS[idx], float(predictions[idx]), model_name
    except ValueError:
        raise   # ← biarkan ValueError dari is_fabric_image naik ke classify.py
    except Exception as e:
        print(f"[ModelService] ❌ Error prediksi: {e}")
        raise