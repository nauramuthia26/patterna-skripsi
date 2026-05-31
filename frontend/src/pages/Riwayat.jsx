import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trash2, Loader2, Clock, LogIn } from 'lucide-react'
import { historyAPI } from '../services/api'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'
import './Riwayat.css'

const CLASS_DISPLAY = {
  katun_baik: 'Katun Baik', katun_buruk: 'Katun Buruk',
  poliester_baik: 'Poliester Baik', poliester_buruk: 'Poliester Buruk',
  linen_baik: 'Linen Baik', linen_buruk: 'Linen Buruk',
  polikatun_baik: 'Polikatun Baik', polikatun_buruk: 'Polikatun Buruk',
  rayon_baik: 'Rayon Baik', rayon_buruk: 'Rayon Buruk',
}

function fmt(dt) {
  return new Date(dt).toLocaleString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

export default function Riwayat() {
  const { token } = useAuthStore()
  const navigate = useNavigate()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Kalau belum login, tampilkan halaman "harus login dulu"
    if (!token) {
      setLoading(false)
      return
    }
    historyAPI.getAll()
      .then(res => setHistory(res.data))
      .catch(() => toast.error('Gagal memuat riwayat'))
      .finally(() => setLoading(false))
  }, [token])

  if (loading) {
    return (
      <div className="page-loading">
        <Loader2 size={28} className="spin" />
      </div>
    )
  }

  // Belum login — tampilkan pesan & tombol login
  if (!token) {
    return (
      <div className="riwayat-page">
        <div className="container">
          <div className="riwayat-empty card fade-in">
            <LogIn size={40} style={{ color: 'var(--primary)' }} />
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>Login Diperlukan</h2>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', textAlign: 'center', maxWidth: 320 }}>
              Riwayat klasifikasi hanya tersedia untuk pengguna yang sudah login.
              Silakan login atau daftar terlebih dahulu.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-primary" onClick={() => navigate('/login')}>
                Masuk
              </button>
              <button className="btn btn-outline" onClick={() => navigate('/register')}>
                Daftar
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const handleDelete = async (id) => {
    try {
      await historyAPI.delete(id)
      setHistory(p => p.filter(h => h.id !== id))
      toast.success('Riwayat dihapus')
    } catch {
      toast.error('Gagal menghapus')
    }
  }

  return (
    <div className="riwayat-page">
      <div className="container">
        <div className="riwayat-header fade-in">
          <h1>Riwayat Klasifikasi</h1>
          <p>{history.length} hasil tersimpan</p>
        </div>

        {history.length === 0 ? (
          <div className="riwayat-empty card fade-in">
            <Clock size={40} />
            <p>Belum ada riwayat klasifikasi</p>
            <button className="btn btn-primary" onClick={() => navigate('/')}>
              Mulai Deteksi
            </button>
          </div>
        ) : (
          <div className="riwayat-list card fade-in">
            {history.map(h => {
              const name = h.fabric_type?.name || CLASS_DISPLAY[h.predicted_class] || h.predicted_class
              const quality = h.predicted_class?.includes('_baik') ? 'Baik' : 'Buruk'
              const conf = h.confidence ? Math.round(h.confidence * 100) : '-'
              const imageUrl = h.image_url || (h.image_filename ? `/uploads/${h.image_filename}` : null)
              
              return (
                <div className="riwayat-item" key={h.id}>
                  <div className="riwayat-left">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={name}
                        className="riwayat-thumb"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    ) : (
                      <div className="riwayat-thumb-placeholder">?</div>
                    )}
            
                    <div className="riwayat-info">
                      <p className="riwayat-name">{name}</p>
                      <p className="riwayat-meta">
                        {h.image_filename} &nbsp;·&nbsp; {fmt(h.created_at)}
                        {h.category === 'konveksi' && (
                          <span className="badge badge-blue" style={{ marginLeft: 8, fontSize: 11, padding: '2px 8px' }}>
                            Konveksi
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
            
                  <div className="riwayat-right">
                    <span className={`badge ${quality === 'Baik' ? 'badge-green' : 'badge-orange'}`}>
                      {quality === 'Baik' ? 'Premium' : 'Low Quality'}
                    </span>
                    <span className="conf-pct">{conf}%</span>
                    <button className="btn btn-ghost del-btn" onClick={() => handleDelete(h.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
