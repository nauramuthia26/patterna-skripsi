import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { fabricAPI } from '../services/api'
import { ChevronDown, ChevronUp, Search, BookOpen } from 'lucide-react'
import './Ensiklopedia.css'

// Import gambar
import katun_baik from '../assets/kain/katun_baik.jpg'
import katun_buruk from '../assets/kain/katun_buruk.jpg'
import poli_baik from '../assets/kain/poli_baik.jpg'
import poli_buruk from '../assets/kain/poli_buruk.jpg'
import linen_baik from '../assets/kain/linen_baik.jpg'
import linen_buruk from '../assets/kain/linen_buruk.jpg'
import polikatun_baik from '../assets/kain/polikatun_baik.jpg'
import polikatun_buruk from '../assets/kain/polikatun_buruk.jpg'
import rayon_baik from '../assets/kain/rayon_baik.jpg'
import rayon_buruk from '../assets/kain/rayon_buruk.jpg'

const FABRIC_IMAGES = {
  katun_baik, katun_buruk,
  poli_baik, poli_buruk,
  linen_baik, linen_buruk,
  polikatun_baik, polikatun_buruk,
  rayon_baik, rayon_buruk,
}

const CATEGORY_ORDER = ['Katun', 'Poliester', 'Linen', 'Polikatun', 'Rayon']

const CATEGORY_COLOR = {
  Katun:     { bg: '#EBF0FD', text: '#3B6FE8', dot: '#3B6FE8' },
  Poliester: { bg: '#FEF3E8', text: '#F08030', dot: '#F08030' },
  Linen:     { bg: '#E8F5EE', text: '#4CAF7D', dot: '#4CAF7D' },
  Polikatun: { bg: '#F3EEFE', text: '#8B5CF6', dot: '#8B5CF6' },
  Rayon:     { bg: '#FEF0F0', text: '#EF4444', dot: '#EF4444' },
}

const EXTRA_INFO = {
  Katun: {
    kelebihan: ['Nyaman dipakai sepanjang hari', 'Ramah lingkungan', 'Cocok untuk kulit sensitif', 'Mudah dicuci'],
    kekurangan: ['Mudah kusut', 'Mudah menyusut jika dicuci air panas', 'Rentan terhadap jamur jika lembab'],
  },
  Poliester: {
    kelebihan: ['Tahan lama dan kuat', 'Cepat kering', 'Tidak mudah kusut', 'Harga terjangkau'],
    kekurangan: ['Kurang menyerap keringat', 'Terasa panas di cuaca terik', 'Tidak ramah lingkungan'],
  },
  Linen: {
    kelebihan: ['Sangat kuat dan tahan lama', 'Menyerap kelembaban baik', 'Makin halus setelah dicuci', 'Ramah lingkungan'],
    kekurangan: ['Mudah kusut', 'Harga relatif mahal', 'Perlu perawatan khusus'],
  },
  Polikatun: {
    kelebihan: ['Kombinasi kenyamanan katun dan ketahanan poliester', 'Tidak mudah kusut', 'Harga lebih terjangkau dari katun murni'],
    kekurangan: ['Kurang menyerap keringat dibanding katun 100%', 'Kualitas tergantung rasio campuran'],
  },
  Rayon: {
    kelebihan: ['Sangat lembut dan ringan', 'Jatuh mengikuti bentuk tubuh', 'Menyerap keringat baik', 'Tampilan elegan'],
    kekurangan: ['Mudah rusak jika salah cuci', 'Cenderung menyusut', 'Kurang tahan lama dibanding serat alami'],
  },
}

function KainCard({ baik, buruk, extra, autoExpand }) {
  const [expanded, setExpanded] = useState(autoExpand || false)
  const color = CATEGORY_COLOR[baik.category] || CATEGORY_COLOR.Katun

  useEffect(() => {
    if (autoExpand) setExpanded(true)
  }, [autoExpand])

  const karakteristik = (() => { try { return JSON.parse(baik.karakteristik || '[]') } catch { return [] } })()
  const penggunaan = (() => { try { return JSON.parse(baik.penggunaan_umum || '[]') } catch { return [] } })()

  const imgBaik = FABRIC_IMAGES[baik.class_label]
  const imgBuruk = buruk ? FABRIC_IMAGES[buruk.class_label] : null
  const burukKarakter = (() => { try { return JSON.parse(buruk?.karakteristik || '[]') } catch { return [] } })()

  return (
    <div className="kain-card" id={`kain-${baik.category.toLowerCase()}`}>
      {/* Header */}
      <div className="kain-header" onClick={() => setExpanded(p => !p)}>
        <div className="kain-header-left">
          <div className="kain-dot" style={{ background: color.dot }} />
          <div>
            <h2 className="kain-name">{baik.category}</h2>
            <p className="kain-sub">Kain {baik.category}</p>
          </div>
        </div>
        <div className="kain-header-right">
          <span className="kain-badge" style={{ background: color.bg, color: color.text }}>
            {baik.category}
          </span>
          <button className="expand-btn">
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {/* Preview collapsed */}
      {!expanded && (
        <div className="kain-preview">
          <p className="kain-desc-short">{baik.deskripsi}</p>
          <button className="btn-lihat" onClick={() => setExpanded(true)}>
            Lihat Selengkapnya →
          </button>
        </div>
      )}

      {/* Detail expanded */}
      {expanded && (
        <div className="kain-detail fade-in">

          {/* Deskripsi */}
          <section className="detail-section">
            <h3 className="section-title">📋 Deskripsi</h3>
            <p className="section-text">{baik.deskripsi}</p>
          </section>

          {/* Karakteristik */}
          {karakteristik.length > 0 && (
            <section className="detail-section">
              <h3 className="section-title">🔍 Karakteristik Kain Berkualitas Baik</h3>
              <ul className="char-list">
                {karakteristik.map((c, i) => (
                  <li key={i}><span className="char-dot" style={{ background: color.dot }} />{c}</li>
                ))}
              </ul>
            </section>
          )}

          {/* Kelebihan & Kekurangan */}
          <section className="detail-section">
            <h3 className="section-title">⚖️ Kelebihan & Kekurangan</h3>
            <div className="pros-cons">
              <div className="pros">
                <h4>✅ Kelebihan</h4>
                <ul>{(extra?.kelebihan || []).map((k, i) => <li key={i}>{k}</li>)}</ul>
              </div>
              <div className="cons">
                <h4>❌ Kekurangan</h4>
                <ul>{(extra?.kekurangan || []).map((k, i) => <li key={i}>{k}</li>)}</ul>
              </div>
            </div>
          </section>

          {/* Penggunaan */}
          {penggunaan.length > 0 && (
            <section className="detail-section">
              <h3 className="section-title">👗 Penggunaan Umum</h3>
              <div className="tag-list">
                {penggunaan.map((u, i) => (
                  <span key={i} className="tag" style={{ background: color.bg, color: color.text }}>{u}</span>
                ))}
              </div>
            </section>
          )}

          {/* Cara Perawatan */}
          {baik.cara_perawatan && (
            <section className="detail-section">
              <h3 className="section-title">🧺 Cara Perawatan</h3>
              <p className="section-text">{baik.cara_perawatan}</p>
            </section>
          )}

          {/* Perbandingan Baik vs Buruk dengan gambar */}
          {buruk && (
            <section className="detail-section">
              <h3 className="section-title">🔄 Perbandingan Kualitas Baik vs Buruk</h3>
              <div className="compare-table">
                {/* Kolom Baik */}
                <div className="compare-col good">
                  <div className="compare-header">
                    <span className="badge-good">✓ Kualitas Baik</span>
                  </div>
                  {imgBaik && (
                    <div className="compare-img-wrap">
                      <img src={imgBaik} alt={`${baik.category} baik`} className="compare-img" />
                    </div>
                  )}
                  <ul>
                    {karakteristik.map((c, i) => <li key={i}>{c}</li>)}
                  </ul>
                </div>

                {/* Kolom Buruk */}
                <div className="compare-col bad">
                  <div className="compare-header">
                    <span className="badge-bad">✗ Kualitas Buruk</span>
                  </div>
                  {imgBuruk && (
                    <div className="compare-img-wrap">
                      <img src={imgBuruk} alt={`${baik.category} buruk`} className="compare-img" />
                    </div>
                  )}
                  <ul>
                    {burukKarakter.map((c, i) => <li key={i}>{c}</li>)}
                  </ul>
                </div>
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}

export default function Ensiklopedia() {
  const [fabrics, setFabrics] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('Semua')
  const [searchParams] = useSearchParams()

  useEffect(() => {
    fabricAPI.getAll()
      .then(res => setFabrics(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Auto scroll & expand jika ada query ?kategori=Katun
  const targetCategory = searchParams.get('kategori')

  useEffect(() => {
    if (targetCategory && !loading) {
      setActiveCategory(targetCategory)
      setTimeout(() => {
        const el = document.getElementById(`kain-${targetCategory.toLowerCase()}`)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 300)
    }
  }, [targetCategory, loading])

  const grouped = CATEGORY_ORDER.reduce((acc, cat) => {
    const baik = fabrics.find(f => f.category === cat && f.quality === 'Baik')
    const buruk = fabrics.find(f => f.category === cat && f.quality === 'Buruk')
    if (baik) acc[cat] = { baik, buruk }
    return acc
  }, {})

  const filtered = Object.entries(grouped).filter(([cat]) => {
    const matchCat = activeCategory === 'Semua' || activeCategory === cat
    const matchSearch = cat.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div className="ensiklopedia-page">
      <div className="container">
        <div className="ensiklo-header fade-in">
          <div className="ensiklo-title-wrap">
            <BookOpen size={28} style={{ color: 'var(--primary)' }} />
            <div>
              <h1 className="ensiklo-title">Ensiklopedia Kain</h1>
              <p className="ensiklo-sub">Panduan lengkap 5 jenis kain beserta karakteristik, kelebihan, kekurangan, dan cara perawatan</p>
            </div>
          </div>
          <div className="ensiklo-search">
            <Search size={15} />
            <input
              placeholder="Cari jenis kain..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="ensiklo-filter fade-in">
          {['Semua', ...CATEGORY_ORDER].map(cat => (
            <button
              key={cat}
              className={`filter-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="ensiklo-loading">
            <div className="spinner-blue" />
            <p>Memuat data kain...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="ensiklo-empty card"><p>Jenis kain tidak ditemukan</p></div>
        ) : (
          <div className="ensiklo-list">
            {filtered.map(([cat, { baik, buruk }]) => (
              <KainCard
                key={cat}
                baik={baik}
                buruk={buruk}
                extra={EXTRA_INFO[cat]}
                autoExpand={targetCategory === cat}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
