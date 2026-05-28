# PATTERNA — Website Klasifikasi Kualitas Kain

PATTERNA merupakan sistem klasifikasi kain berbasis website yang dikembangkan sebagai proyek skripsi. Sistem ini menggunakan teknologi Deep Learning dengan model EfficientNetB0 untuk mengklasifikasikan tekstur kain berdasarkan gambar close-up serta menentukan kualitas kain.

Aplikasi menyediakan dua mode deteksi:

* **Mode Umum** — klasifikasi satu gambar untuk pengguna umum.
* **Mode Konveksi** — klasifikasi massal hingga 50 gambar untuk kebutuhan skala konveksi.

Teknologi yang digunakan:

* **Frontend:** React.js
* **Backend:** FastAPI
* **Database:** SQLite dengan SQLAlchemy ORM
* **Deep Learning:** TensorFlow & EfficientNetB0

Fitur utama:

* Autentikasi JWT dan role-based access
* Ensiklopedia kain
* Pipeline preprocessing gambar (crop, resize, CLAHE, normalisasi kecerahan)
* Klasifikasi massal
* Riwayat klasifikasi
* Visualisasi confidence score
* Tampilan website responsif

Proyek ini dikembangkan untuk penelitian klasifikasi tekstur kain menggunakan computer vision dan deep learning.
