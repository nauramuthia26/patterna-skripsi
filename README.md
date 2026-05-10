# PATTERNA — Klasifikasi Kain (SQLite Version)

Aplikasi web klasifikasi jenis & kualitas kain via foto close-up tekstur menggunakan Deep Learning.

---

## LANGKAH PENGERJAAN DI VSCODE

### ═══════════════════════════════════════
### TAHAP 1 — Persiapan
### ═══════════════════════════════════════

**1.1 Pastikan sudah terinstall:**
- Python 3.9+ → https://www.python.org/downloads/
  ⚠️ Saat install centang "Add Python to PATH"
- Node.js 18+ → https://nodejs.org/
- VSCode → https://code.visualstudio.com/

**1.2 Buka project di VSCode:**
```
File → Open Folder → pilih folder "patterna"
```

**1.3 Install ekstensi VSCode yang disarankan:**
- Python (Microsoft)
- ES7+ React/Redux/React-Native snippets


---

### ═══════════════════════════════════════
### TAHAP 2 — Setup Backend (FastAPI)
### ═══════════════════════════════════════

Buka Terminal di VSCode: `Ctrl + `` ` (backtick)

**2.1 Masuk ke folder backend:**
```bash
cd backend
```

**2.2 Buat virtual environment Python:**
```bash
python -m venv venv
```

**2.3 Aktifkan virtual environment:**
```bash
# Windows (Command Prompt / PowerShell):
venv\Scripts\activate

# Kalau muncul error di PowerShell, jalankan dulu:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
# lalu aktifkan lagi: venv\Scripts\activate
```
✅ Berhasil jika terminal menampilkan `(venv)` di awal baris

**2.4 Install semua library Python:**
```bash
pip install -r requirements.txt
```
⏳ Proses ini butuh 2-5 menit tergantung koneksi internet.

> Catatan: Jika ingin install TensorFlow untuk model ML nyata:
> pip install tensorflow==2.16.1
> (Ukuran ~500MB, bisa dilewati dulu untuk testing UI)

**2.5 Buat database + isi data awal (jalankan SEKALI saja):**
```bash
python seed.py
```
✅ Akan muncul:
```
✅ Tabel berhasil dibuat
✅ 10 data kain berhasil ditambahkan
✅ Akun admin berhasil dibuat
   Email   : admin@patterna.id
   Password: admin123
🎉 Database siap!
```
File `patterna.db` akan otomatis terbuat di folder `backend/`.

**2.6 Jalankan server backend:**
```bash
uvicorn main:app --reload --port 8000
```
✅ Berhasil jika muncul:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

🔗 Buka di browser: **http://localhost:8000/docs**
→ Ini halaman Swagger UI untuk testing API secara langsung.


---

### ═══════════════════════════════════════
### TAHAP 3 — Setup Frontend (React + Vite)
### ═══════════════════════════════════════

Buka **Terminal BARU** di VSCode:
Klik tombol `+` di panel terminal (jangan tutup terminal backend!)

**3.1 Masuk ke folder frontend:**
```bash
cd frontend
```

**3.2 Install semua package JavaScript:**
```bash
npm install
```
⏳ Proses ini butuh 1-3 menit.

**3.3 Jalankan development server:**
```bash
npm run dev
```
✅ Berhasil jika muncul:
```
  VITE v5.x  ready in xxx ms
  ➜  Local:   http://localhost:5173/
```

🔗 Buka di browser: **http://localhost:5173**
→ Aplikasi PATTERNA siap digunakan!


---

### ═══════════════════════════════════════
### TAHAP 4 — Menambahkan Model ML
### ═══════════════════════════════════════

Setelah model `.h5` selesai di-training:

**4.1 Letakkan file model di:**
```
backend/
└── models/
    ├── efficientnetb0.h5   ← taruh di sini
    ├── resnet50.h5
    └── mobilenetv2.h5
```

**4.2 Urutan kelas saat training HARUS sama:**
```python
CLASS_LABELS = [
    "katun_baik",       # index 0
    "katun_buruk",      # index 1
    "poliester_baik",   # index 2
    "poliester_buruk",  # index 3
    "linen_baik",       # index 4
    "linen_buruk",      # index 5
    "polikatun_baik",   # index 6
    "polikatun_buruk",  # index 7
    "rayon_baik",       # index 8
    "rayon_buruk",      # index 9
]
```

**4.3 Restart backend setelah menambah model:**
```bash
# Di terminal backend, tekan Ctrl+C, lalu jalankan lagi:
uvicorn main:app --reload --port 8000
```
Model akan otomatis terdeteksi (EfficientNetB0 diprioritaskan).


---

## STRUKTUR FILE PROJECT

```
patterna/
│
├── backend/                    ← FastAPI Server
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth.py         ← Login, Register, Profil
│   │   │   ├── classify.py     ← Klasifikasi gambar
│   │   │   └── data.py         ← Riwayat & data kain
│   │   ├── core/
│   │   │   ├── config.py       ← Konfigurasi app
│   │   │   ├── database.py     ← Koneksi SQLite
│   │   │   └── security.py     ← JWT & password
│   │   ├── models/
│   │   │   ├── user.py         ← Tabel users
│   │   │   └── fabric.py       ← Tabel kain & riwayat
│   │   ├── schemas/
│   │   │   └── schemas.py      ← Format request/response
│   │   └── services/
│   │       └── model_service.py ← Load & jalankan model ML
│   ├── models/                 ← Taruh file .h5 di sini
│   ├── uploads/                ← Gambar yang diupload (auto)
│   ├── main.py                 ← Entry point FastAPI
│   ├── seed.py                 ← Isi data awal (jalankan sekali)
│   ├── requirements.txt        ← Daftar library Python
│   ├── .env                    ← Konfigurasi (sudah ada)
│   └── patterna.db             ← Database SQLite (auto terbuat)
│
└── frontend/                   ← React + Vite
    ├── src/
    │   ├── components/
    │   │   ├── layout/
    │   │   │   └── Navbar.jsx  ← Navigasi atas
    │   │   └── ui/
    │   │       ├── ResultCard.jsx     ← Tampilan hasil deteksi
    │   │       └── BulkResultCard.jsx ← Tampilan hasil bulk
    │   ├── pages/
    │   │   ├── Deteksi.jsx     ← Halaman utama deteksi
    │   │   ├── Auth.jsx        ← Login, Register, Profil
    │   │   ├── Riwayat.jsx     ← Riwayat klasifikasi
    │   │   └── Placeholders.jsx ← Panduan & Ensiklopedia
    │   ├── services/
    │   │   └── api.js          ← Semua request ke backend
    │   ├── store/
    │   │   └── authStore.js    ← State login (Zustand)
    │   ├── App.jsx             ← Router utama
    │   └── index.css           ← Style global
    ├── package.json
    └── vite.config.js          ← Proxy ke backend
```


---

## API ENDPOINTS

| Method | URL | Keterangan | Auth |
|--------|-----|------------|------|
| POST | `/api/auth/register` | Daftar akun baru | - |
| POST | `/api/auth/login` | Login | - |
| GET | `/api/auth/me` | Info user login | ✅ |
| PUT | `/api/auth/me` | Update profil | ✅ |
| POST | `/api/classify/umum` | Klasifikasi 1 gambar | Opsional |
| POST | `/api/classify/konveksi` | Bulk (maks 50 gambar) | Opsional |
| GET | `/api/history/` | Riwayat saya | ✅ |
| DELETE | `/api/history/{id}` | Hapus riwayat | ✅ |
| GET | `/api/fabrics/` | Semua data kain | - |
| GET | `/api/fabrics/{id}` | Detail kain by ID | - |
| GET | `/api/fabrics/label/{label}` | Detail kain by label | - |


---

## TROUBLESHOOTING

| Masalah | Solusi |
|---------|--------|
| `(venv) tidak muncul` | Pastikan jalankan `venv\Scripts\activate` dari folder `backend` |
| `ModuleNotFoundError` | Pastikan venv aktif, lalu `pip install -r requirements.txt` |
| `python seed.py` error | Pastikan sudah di folder `backend` dan venv aktif |
| Port 8000 sudah dipakai | Ganti ke `uvicorn main:app --reload --port 8001` |
| `npm: command not found` | Install Node.js dari nodejs.org, restart VSCode |
| CORS error di browser | Pastikan backend jalan di port 8000 |
| Gambar tidak terklasifikasi | Normal jika model belum ada — sistem pakai mode dummy |
