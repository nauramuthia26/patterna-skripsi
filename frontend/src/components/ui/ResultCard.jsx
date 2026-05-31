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

const CLASS_TO_CATEGORY = {
  katun_baik: 'Katun', katun_buruk: 'Katun',
  poli_baik: 'Poliester', poli_buruk: 'Poliester',
  linen_baik: 'Linen', linen_buruk: 'Linen',
  polikatun_baik: 'Polikatun', polikatun_buruk: 'Polikatun',
  rayon_baik: 'Rayon', rayon_buruk: 'Rayon',
}

function getConfidenceLevel(conf) {
  if (conf >= 85) return 'tinggi'
  if (conf >= 70) return 'cukup'
  return 'batas minimum'
}

function getInterpretation(name, quality, conf) {
  const level = getConfidenceLevel(conf)

  if (quality === 'Baik') {
    return `Sistem mengindikasikan gambar ini sebagai ${name} dengan tingkat keyakinan ${level}. Kain ini terindikasi memiliki kualitas baik sehingga cenderung lebih layak digunakan untuk kebutuhan sehari-hari. Namun, keputusan akhir tetap perlu mempertimbangkan pemeriksaan langsung seperti ketebalan, elastisitas, kenyamanan, dan kondisi fisik kain.`
  }

  return `Sistem mengindikasikan gambar ini sebagai ${name} dengan tingkat keyakinan ${level}. Kain ini terindikasi memiliki kualitas rendah, sehingga perlu diperiksa kembali sebelum digunakan, terutama untuk kebutuhan jangka panjang atau produk yang membutuhkan kenyamanan tinggi. Perhatikan kondisi serat, ketebalan, kenyamanan, dan kondisi fisik kain secara langsung.`
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
  const interpretation = getInterpretation(displayName, quality, conf)

  const karakteristik = (() => {
    try { return JSON.parse(result.fabric_info?.karakteristik || '[]') } catch { return [] }
  })()

  const kategori = CLASS_TO_CATEGORY[result.predicted_class]

  const goToEnsiklopedia = () => {
    if (kategori) {
      navigate(`/ensiklopedia?kategori=${encodeURIComponent(kategori)}&target=perbandingan`)
    } else {
      navigate('/ensiklopedia')
    }
  }

  return (
    <div className="result-card card">
      <div className="result-header">
        <h2 className="result-label">Hasil Analisis Terakhir</h2>
        {imageUrl && <img src={imageUrl} alt="analyzed" className="result-thumb" />}
      </div>

      <div className="result-main">
        <h3 className="result-name">{displayName}</h3>

        <span className={`badge ${quality === 'Baik' ? 'badge-green' : 'badge-orange'}`}>
          {quality === 'Baik' ? 'Premium' : 'Low Quality'}
        </span>

        <p className="conf-text">Confidence: <strong>{conf}%</strong></p>

        <div className="conf-bar">
          <div
            className="conf-fill"
            style={{
              width: `${conf}%`,
              background: conf >= 80 ? '#4CAF7D' : conf >= 60 ? '#F08030' : '#EF4444',
            }}
          />
        </div>
      </div>

      <div className="result-interpretation">
        <h4>Interpretasi Hasil</h4>
        <p>{interpretation}</p>
      </div>

      {result.fabric_info?.deskripsi && (
        <p className="result-desc">{result.fabric_info.deskripsi}</p>
      )}

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

      <div className="result-ensiklo-link">
        <button className="btn-ensiklo" onClick={goToEnsiklopedia}>
          <span>Lihat penjelasan lengkap di Ensiklopedia</span>
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  )
}