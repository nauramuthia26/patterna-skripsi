import { BookOpen, Library } from 'lucide-react'
import './Riwayat.css'

export function Panduan() {
  return (
    <div className="placeholder-page">
      <div className="container">
        <div className="card fade-in" style={{ textAlign: 'center', padding: '80px 40px' }}>
          <BookOpen size={48} style={{ color: 'var(--primary)', marginBottom: 16 }} />
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>Panduan Penggunaan</h1>
          <p style={{ color: 'var(--text-muted)', maxWidth: 480, margin: '0 auto', lineHeight: 1.8 }}>
            Halaman panduan sedang dalam pengembangan. Panduan akan mencakup cara pengambilan foto kain yang benar,
            cara membaca hasil klasifikasi, dan tips mendapatkan akurasi terbaik.
          </p>
        </div>
      </div>
    </div>
  )
}

export function Ensiklopedia() {
  return (
    <div className="placeholder-page">
      <div className="container">
        <div className="card fade-in" style={{ textAlign: 'center', padding: '80px 40px' }}>
          <Library size={48} style={{ color: 'var(--primary)', marginBottom: 16 }} />
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>Ensiklopedia Kain</h1>
          <p style={{ color: 'var(--text-muted)', maxWidth: 480, margin: '0 auto', lineHeight: 1.8 }}>
            Halaman ensiklopedia sedang dalam pengembangan. Akan berisi daftar lengkap 10 jenis kain
            beserta karakteristik, kegunaan, dan cara perawatannya.
          </p>
        </div>
      </div>
    </div>
  )
}
