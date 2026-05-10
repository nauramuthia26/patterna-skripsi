"""
Jalankan SEKALI untuk mengisi data awal database.
Perintah: python seed.py
"""
import json, sys, os
sys.path.insert(0, os.path.dirname(__file__))

from app.core.database import Base, engine, SessionLocal
from app.models.user import User
from app.models.fabric import FabricType, ActiveModel, ClassificationHistory
from app.core.security import hash_password

print("⏳ Membuat tabel database...")
Base.metadata.create_all(bind=engine)
print("✅ Tabel berhasil dibuat")

db = SessionLocal()

if db.query(FabricType).count() == 0:
    fabrics = [
        # ID 1: Katun Baik 
        FabricType(
            name="Katun Baik",
            category="Katun",
            quality="Baik",
            class_label="katun_baik",
            deskripsi="Katun 100% atau yang sering disebut dengan Cotton Combed, merupakan bahan yang terbuat dari 100% serat kapas.",
            karakteristik=json.dumps([
                "Permukaan tekstur halus dan lembut",
                "Serat rapat dan seragam",
                "Menyerap keringat dengan baik",
                "Terasa adem digunakan",
                "Tidak mudah sobek"
            ]),
            penggunaan_umum=json.dumps([
                "Pakaian Kasual", "Pakaian Bayi", "Dress/Gamis",
                "Tunik", "Kemeja", "Sprei"
            ]),
            cara_perawatan="Cuci dengan air dingin, jangan diperas terlalu kuat, keringkan di tempat teduh. Hindari penyimpanan tempat lembab.",
        ),

        # ID 2: Katun Buruk
        FabricType(
            name="Katun Buruk",
            category="Katun",
            quality="Buruk",
            class_label="katun_buruk",
            deskripsi="Kain katun dengan kualitas rendah, serat tidak merata, dan mudah rusak setelah beberapa kali cuci.",
            karakteristik=json.dumps([
                "Tekstur kasar tidak merata",
                "Serat longgar atau bolong",
                "Warna pudar atau belang",
                "Mudah berbulu (pilling)",
                "Mudah menyusut"
            ]),
            penggunaan_umum=json.dumps(["Kain Lap", "Produk Murah"]),
            cara_perawatan="Cuci dengan tangan, hindari mesin cuci.",
        ),

        # ID 3: Poliester Baik
        FabricType(
            name="Poliester Baik",
            category="Poliester",
            quality="Baik",
            class_label="poli_baik",
            deskripsi="Poliester adalah serat sintetis berbahan PET dari turunan minyak bumi yang dibuat melalui proses kimia.",
            karakteristik=json.dumps([
                "Kilap merata dan konsisten",
                "Berbahan licin",
                "Tekstur ringan dan halus",
                "Tidak mudah kusut",
                "Cepat kering"
            ]),
            penggunaan_umum=json.dumps([
                "Pakaian Olahraga", "Kaos Harian", "Jaket",
                "Seragam", "Tunik", "Blouse", "Kain Pelapis"
            ]),
            cara_perawatan="Cuci dengan suhu normal, jangan terlalu panas atau dingin. Jangan disetrika terlalu panas.",
        ),

        # ID 4: Poliester Buruk
        FabricType(
            name="Poliester Buruk",
            category="Poliester",
            quality="Buruk",
            class_label="poli_buruk",
            deskripsi="Poliester kualitas rendah dengan kilap tidak merata dan mudah rusak.",
            karakteristik=json.dumps([
                "Kilap tidak merata",
                "Serat terlihat renggang",
                "Mudah berbulu (pilling)",
                "Terasa panas dipakai",
                "Mudah sobek"
            ]),
            penggunaan_umum=json.dumps(["Produk Murah Sekali Pakai"]),
            cara_perawatan="Cuci dengan tangan, air dingin.",
        ),

        # ID 5: Linen Baik 
        FabricType(
            name="Linen Baik",
            category="Linen",
            quality="Baik",
            class_label="linen_baik",
            deskripsi="Linen adalah kain dari serat alami tanaman flax yang kuat, tahan gesekan, dan semakin kuat saat basah.",
            karakteristik=json.dumps([
                "Menyerap keringat dan kelembaban dengan baik",
                "Tekstur halus dan lembut karena serat alami",
                "Kuat dan tahan lama",
                "Anti bakteri"
            ]),
            penggunaan_umum=json.dumps([
                "Kemeja", "Celana Kasual", "Rok",
                "Blouse", "Taplak Meja"
            ]),
            cara_perawatan="Cuci dengan air dingin, jangan diperas terlalu kuat, setrika dari bagian dalam, hindari penyimpanan tempat lembab.",
        ),

        # ID 6: Linen Buruk
        FabricType(
            name="Linen Buruk",
            category="Linen",
            quality="Buruk",
            class_label="linen_buruk",
            deskripsi="Linen kualitas rendah dengan serat tidak merata dan mudah robek.",
            karakteristik=json.dumps([
                "Serat tidak seragam",
                "Mudah robek",
                "Tekstur terlalu kasar",
                "Menyusut drastis saat dicuci",
                "Warna tidak merata"
            ]),
            penggunaan_umum=json.dumps(["Tidak direkomendasikan untuk pakaian"]),
            cara_perawatan="Cuci dengan tangan, air dingin.",
        ),

        # ID 7: Polikatun Baik 
        FabricType(
            name="Polikatun Baik",
            category="Polikatun",
            quality="Baik",
            class_label="polikatun_baik",
            deskripsi="Polikatun adalah kain campuran kapas dan poliester dengan berbagai rasio yang menghasilkan bahan kuat dan tahan lama.",
            karakteristik=json.dumps([
                "Tekstur halus, lembut, ringan, dan fleksibel",
                "Tidak terlalu mudah kusut",
                "Menyerap keringat cukup baik",
                "Warna tahan lama",
                "Tahan lama dan kuat"
            ]),
            penggunaan_umum=json.dumps([
                "Kemeja Sekolah/Kantor", "Pakaian Kasual",
                "Pakaian Anak", "Tunik", "Celana"
            ]),
            cara_perawatan="Cuci dengan suhu normal, jangan terlalu panas atau dingin. Jangan disetrika terlalu panas. Hindari deterjen yang terlalu kuat.",
        ),

        # ID 8: Polikatun Buruk
        FabricType(
            name="Polikatun Buruk",
            category="Polikatun",
            quality="Buruk",
            class_label="polikatun_buruk",
            deskripsi="Campuran poliester-katun kualitas rendah dengan proporsi tidak ideal.",
            karakteristik=json.dumps([
                "Tekstur tidak nyaman",
                "Cepat berbulu",
                "Warna cepat pudar",
                "Kurang menyerap keringat",
                "Terasa kaku"
            ]),
            penggunaan_umum=json.dumps(["Produk Promosi Murah"]),
            cara_perawatan="Cuci dengan tangan.",
        ),

        # ID 9: Rayon Baik 
        FabricType(
            name="Rayon Baik",
            category="Rayon",
            quality="Baik",
            class_label="rayon_baik",
            deskripsi="Rayon adalah serat semi-sintetis dari selulosa tumbuhan yang diproses kimia sehingga bertekstur lembut.",
            karakteristik=json.dumps([
                "Menyerap keringat dengan baik",
                "Ringan, jatuh, lembut dan terasa adem",
                "Cenderung tidak memiliki kilauan",
                "Tampilan lebih alami"
            ]),
            penggunaan_umum=json.dumps([
                "Pakaian Tidur", "Blouse", "Dress/Gamis",
                "Outer", "Sprei"
            ]),
            cara_perawatan="Cuci dengan suhu normal, jangan diperas. Deterjen yang lembut. Keringkan di tempat teduh.",
        ),

        # ID 10: Rayon Buruk
        FabricType(
            name="Rayon Buruk",
            category="Rayon",
            quality="Buruk",
            class_label="rayon_buruk",
            deskripsi="Rayon kualitas rendah yang mudah rusak, melar, dan tidak tahan lama.",
            karakteristik=json.dumps([
                "Mudah melar",
                "Menyusut saat dicuci",
                "Terasa kasar",
                "Mudah robek",
                "Warna cepat pudar"
            ]),
            penggunaan_umum=json.dumps(["Tidak direkomendasikan untuk pakaian premium"]),
            cara_perawatan="Cuci dengan tangan, sangat hati-hati.",
        ),
    ]
    db.add_all(fabrics)
    db.commit()
    print(f"✅ {len(fabrics)} data kain berhasil ditambahkan")
else:
    print("ℹ️  Data kain sudah ada, dilewati")

if db.query(User).count() == 0:
    admin = User(
        name="Administrator",
        email="admin@patterna.id",
        password_hash=hash_password("admin123"),
        role="admin",
    )
    db.add(admin)
    db.commit()
    print("✅ Akun admin berhasil dibuat")
    print("   Email   : admin@patterna.id")
    print("   Password: admin123")
else:
    print("ℹ️  User sudah ada, dilewati")

db.close()
print("\n🎉 Database siap!")
