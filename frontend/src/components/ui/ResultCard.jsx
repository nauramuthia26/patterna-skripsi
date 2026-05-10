import { useState } from 'react'
import { CheckCircle2, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import './ResultCard.css'

const CLASS_DISPLAY = {
  katun_baik: 'Katun Baik', katun_buruk: 'Katun Buruk',
  poli_baik: 'Poliester Baik', poli_buruk: 'Poliester Buruk',
  linen_baik: 'Linen Baik', linen_buruk: 'Linen Buruk',
  polikatun_baik: 'Polikatun Baik', polikatun_buruk: 'Polikatun Buruk',
  rayon_baik: 'Rayon Baik', rayon_buruk: 'Rayon Buruk',
}

// Mapping class_label → kategori untuk link ke ensiklopedia
const CLASS_TO_CATEGORY = {
  katun_baik: 'Katun', katun_buruk: 'Katun',
  poli_baik: 'Poliester', poli_buruk: 'Poliester',
  linen_baik: 'Linen', linen_buruk: 'Linen',
  polikatun_baik: 'Polikatun', polikatun_buruk: 'Polikatun',
  rayon_baik: 'Rayon', rayon_buruk: 'Rayon',
}

export default function ResultCard({ result, imageUrl }) {
  const [showDetail, setShowDetail] = useState(false)
  const navigate = useNavigate()

  const displayName = result.fabric_info?.name
    || CLASS_DISPLAY[result.predicted_class]
    || result.predicted_class

  const quality = result.quality
    || (result.predicted_class.includes('_baik') ? 'Baik' : 'Buruk')

  const conf = Math.round(result.confidence * 100)

  const karakteristik = (() => {
    try { return JSON.parse(result.fabric_info?.karakteristik || '[]') } catch { return [] }
  })()

  const kategori = CLASS_TO_CATEGORY[result.predicted_class]

  const goToEnsiklopedia = () => {
    if (kategori) {
      navigate(`/ensiklopedia?kategori=${kategori}`)
    } else {
      navigate('/ensiklopedia')
    }
  }

  return (
    <div className="result-card card">
      {/* Header */}
      <div className="result-header">
        <h2 className="result-label">Hasil Analisis Terakhir</h2>
        {imageUrl && <img src={imageUrl} alt="analyzed" className="result-thumb" />}
      </div>

      {/* Nama & confidence */}
      <div className="result-main">
        <h3 className="result-name">{displayName}</h3>
        <span className={`badge ${quality === 'Baik' ? 'badge-green' : 'badge-orange'}`}>
          {quality === 'Baik' ? 'Premium' : 'Low Quality'}
        </span>
        <p className="conf-text">Confidence: <strong>{conf}%</strong></p>
        <div className="conf-bar">
          <div className="conf-fill" style={{
            width: `${conf}%`,
            background: conf >= 80 ? '#4CAF7D' : conf >= 60 ? '#F08030' : '#EF4444'
          }} />
        </div>
      </div>

      {/* Deskripsi */}
      {result.fabric_info?.deskripsi && (
        <p className="result-desc">{result.fabric_info.deskripsi}</p>
      )}

      {/* Toggle karakteristik */}
      {karakteristik.length > 0 && (
        <>
          <button
            className="toggle-btn btn btn-ghost"
            onClick={() => setShowDetail(p => !p)}
          >
            {showDetail ? 'Sembunyikan Karakteristik' : 'Lihat Karakteristik'}
            {showDetail ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showDetail && (
            <div className="detail-section fade-in">
              <div className="detail-block">
                <h4>Karakteristik</h4>
                <ul>
                  {karakteristik.map((c, i) => (
                    <li key={i}><CheckCircle2 size={12} />{c}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </>
      )}

      {/* Tombol ke Ensiklopedia */}
      <div className="result-ensiklo-link">
        <button className="btn-ensiklo" onClick={goToEnsiklopedia}>
          <span>Lihat info lengkap di Ensiklopedia</span>
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  )
}
