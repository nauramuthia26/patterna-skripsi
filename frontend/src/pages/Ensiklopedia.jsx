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
  Katun:     { bg: '#EBF0FD', text: '#3B6FE8', dot: '#3B6FE8', light: '#F5F8FF' },
  Poliester: { bg: '#FEF3E8', text: '#F08030', dot: '#F08030', light: '#FFFAF5' },
  Linen:     { bg: '#E8F5EE', text: '#4CAF7D', dot: '#4CAF7D', light: '#F4FBF7' },
  Polikatun: { bg: '#F3EEFE', text: '#8B5CF6', dot: '#8B5CF6', light: '#FAF7FF' },
  Rayon:     { bg: '#FEF0F0', text: '#EF4444', dot: '#EF4444', light: '#FFF7F7' },
}

function parseJSON(str, fallback = []) {
  if (!str) return fallback
  try { return JSON.parse(str) } catch { return fallback }
}

function PerawatanCard({ item }) {
  return (
    <div className="perawatan-item">
      <span className="perawatan-icon">{item.icon}</span>
      <div>
        <p className="perawatan-judul">{item.judul}</p>
        <p className="perawatan-tips">{item.tips}</p>
      </div>
    </div>
  )
}

function KualitasBlock({ fabric, imgSrc, altText }) {
  const isGood = fabric.quality === 'Baik'
  const karakteristik = parseJSON(fabric.karakteristik)

  return (
    <div className={`kualitas-block ${isGood ? 'good' : 'bad'}`}>
      {imgSrc && (
        <div className="kualitas-img-wrap">
          <img src={imgSrc} alt={altText} className="kualitas-img" />
          <div className={`kualitas-img-overlay ${isGood ? 'overlay-good' : 'overlay-bad'}`}>
            <span className="kualitas-img-badge">
              {isGood ? '✓ Kualitas Baik' : '✗ Kualitas Rendah'}
            </span>
          </div>
        </div>
      )}
      <div className="kualitas-body">
        {karakteristik.length > 0 && (
          <div className="kualitas-alasan">
            <p className="kualitas-alasan-title">
              {isGood ? '🔬 Ciri kualitas baik' : '⚠️ Ciri kualitas rendah'}
            </p>
            <ul>
              {karakteristik.map((c, i) => (
                <li key={i}>
                  <span className={isGood ? 'mark-good' : 'mark-bad'}>
                    {isGood ? '✓' : '✗'}
                  </span>
                  {c}
                </li>
              ))}
            </ul>
          </div>
        )}
        {fabric.saran_pakai && (
          <div className={`saran-box ${isGood ? 'saran-good' : 'saran-bad'}`}>
            <p className="saran-label">
              {isGood ? '💡 Saran penggunaan' : '⚡ Perlu diketahui'}
            </p>
            <p className="saran-text">{fabric.saran_pakai}</p>
            <span className={`rekomendasi-badge ${isGood ? 'rek-yes' : 'rek-no'}`}>
              {isGood ? '👍 Direkomendasikan' : '👎 Kurang disarankan'}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

function KainCard({ baik, buruk, autoExpand }) {
  const [expanded, setExpanded] = useState(autoExpand || false)
  const color = CATEGORY_COLOR[baik.category] || CATEGORY_COLOR.Katun

  useEffect(() => {
    if (autoExpand) setExpanded(true)
  }, [autoExpand])

  const penggunaan    = parseJSON(baik.penggunaan_umum)
  const kelebihan     = parseJSON(baik.kelebihan)
  const kekurangan    = parseJSON(baik.kekurangan)
  const tipsPerawatan = parseJSON(baik.tips_perawatan)

  const imgBaik  = FABRIC_IMAGES[baik.class_label]
  const imgBuruk = buruk ? FABRIC_IMAGES[buruk.class_label] : null

  return (
    <div className="kain-card" id={`kain-${baik.category.toLowerCase()}`}>
      <div
        className="kain-header"
        onClick={() => setExpanded(p => !p)}
        style={{ borderLeft: `4px solid ${color.dot}` }}
      >
        <div className="kain-header-left">
          <div className="kain-dot" style={{ background: color.dot }} />
          <div>
            <div className="kain-name-row">
              <h2 className="kain-name">{baik.category}</h2>
              {baik.tagline && <span className="kain-tagline">— {baik.tagline}</span>}
            </div>
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

      {!expanded && (
        <div className="kain-preview">
          {baik.cocok_untuk && (
            <p className="kain-cocok-preview">
              <span className="cocok-label" style={{ color: color.text }}>Cocok untuk</span>
              {' '}{baik.cocok_untuk}
            </p>
          )}
          <button className="btn-lihat" style={{ color: color.text }} onClick={() => setExpanded(true)}>
            Lihat Selengkapnya →
          </button>
        </div>
      )}

      {expanded && (
        <div className="kain-detail fade-in">

          {/* ① Ringkasan */}
          <section className="detail-section section-ringkasan" style={{ background: color.light }}>
            <div className="ringkasan-content">
              <div className="ringkasan-left">
                <span className="ringkasan-label" style={{ color: color.text }}>Tentang {baik.category}</span>
                <p className="ringkasan-desc">{baik.deskripsi}</p>
              </div>
              {baik.cocok_untuk && (
                <div className="ringkasan-right" style={{ borderColor: color.dot + '40', background: 'white' }}>
                  <p className="cocok-label-inline" style={{ color: color.text }}>👤 Cocok untuk siapa?</p>
                  <p className="cocok-text">{baik.cocok_untuk}</p>
                </div>
              )}
            </div>
            {penggunaan.length > 0 && (
              <div className="tag-list" style={{ marginTop: 14 }}>
                {penggunaan.map((u, i) => (
                  <span key={i} className="tag" style={{ background: color.bg, color: color.text }}>{u}</span>
                ))}
              </div>
            )}
          </section>

          {/* ② Kelebihan & Kekurangan */}
          {(kelebihan.length > 0 || kekurangan.length > 0) && (
            <section className="detail-section">
              <h3 className="section-title">⚖️ Kelebihan & Kekurangan Kain {baik.category}</h3>
              <p className="section-note">Ini adalah sifat dasar jenis kain ini — terlepas dari kualitas baik atau buruknya.</p>
              <div className="pros-cons">
                <div className="pros">
                  <h4>✅ Kelebihan</h4>
                  <ul>{kelebihan.map((k, i) => <li key={i}>{k}</li>)}</ul>
                </div>
                <div className="cons">
                  <h4>❌ Kekurangan</h4>
                  <ul>{kekurangan.map((k, i) => <li key={i}>{k}</li>)}</ul>
                </div>
              </div>
            </section>
          )}

          {/* ③ Perbandingan Kualitas */}
          {buruk && (
            <section
              id={`perbandingan-${baik.category.toLowerCase()}`}
              className="detail-section"
            >
              <h3 className="section-title">🔄 Perbandingan Kualitas: Baik vs Rendah</h3>
              <p className="section-note">Lihat perbedaan visual dan kenapa satu lebih baik dari yang lain.</p>
              <div className="kualitas-compare">
                <KualitasBlock fabric={baik}  imgSrc={imgBaik}  altText={`${baik.category} baik`} />
                <KualitasBlock fabric={buruk} imgSrc={imgBuruk} altText={`${baik.category} buruk`} />
              </div>
            </section>
          )}

          {/* ④ Cara Perawatan */}
          {tipsPerawatan.length > 0 && (
            <section className="detail-section">
              <h3 className="section-title">🧺 Cara Perawatan Kain {baik.category}</h3>
              <p className="section-note">Tips merawat kain ini agar tetap awet dan nyaman dipakai.</p>
              <div className="perawatan-grid">
                {tipsPerawatan.map((p, i) => <PerawatanCard key={i} item={p} />)}
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

  const targetCategory = searchParams.get('kategori')

  useEffect(() => {
    if (targetCategory && !loading) {
      setActiveCategory(targetCategory)
      setTimeout(() => {
        const target = searchParams.get('target')
        const id = target === 'perbandingan'
          ? `perbandingan-${targetCategory.toLowerCase()}`
          : `kain-${targetCategory.toLowerCase()}`
        const el = document.getElementById(id)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 500)
    }
  }, [targetCategory, loading, searchParams])

  const grouped = CATEGORY_ORDER.reduce((acc, cat) => {
    const baik  = fabrics.find(f => f.category === cat && f.quality === 'Baik')
    const buruk = fabrics.find(f => f.category === cat && f.quality === 'Buruk')
    if (baik) acc[cat] = { baik, buruk }
    return acc
  }, {})

  const filtered = Object.entries(grouped).filter(([cat]) => {
    const matchCat    = activeCategory === 'Semua' || activeCategory === cat
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
              <p className="ensiklo-sub">Panduan lengkap memahami jenis kain, cara membedakan kualitas, dan tips perawatannya</p>
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
                autoExpand={targetCategory === cat}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
