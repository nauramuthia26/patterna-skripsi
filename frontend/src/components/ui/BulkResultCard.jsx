import { useState } from 'react'
import { CheckCircle2, ChevronDown, X, AlertTriangle } from 'lucide-react'
import './BulkResultCard.css'

const CLASS_DISPLAY = {
  katun_baik: 'Katun Baik', katun_buruk: 'Katun Buruk',
  poli_baik: 'Poliester Baik', poli_buruk: 'Poliester Buruk',
  linen_baik: 'Linen Baik', linen_buruk: 'Linen Buruk',
  polikatun_baik: 'Polikatun Baik', polikatun_buruk: 'Polikatun Buruk',
  rayon_baik: 'Rayon Baik', rayon_buruk: 'Rayon Buruk',
}

function DetailModal({ item, preview, onClose }) {
  const name = item.fabric_info?.name || CLASS_DISPLAY[item.predicted_class] || item.predicted_class
  const conf = Math.round(item.confidence * 100)
  const chars = (() => { try { return JSON.parse(item.fabric_info?.karakteristik || '[]') } catch { return [] } })()
  const uses = (() => { try { return JSON.parse(item.fabric_info?.penggunaan_umum || '[]') } catch { return [] } })()

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><X size={16} /></button>
        <div className="modal-header">
          {preview && <img src={preview} alt="kain" className="modal-img" />}
          <div>
            <h2 className="modal-name">{name}</h2>
            <span className={`badge ${item.quality === 'Baik' ? 'badge-green' : 'badge-orange'}`}>
              {item.quality === 'Baik' ? 'Premium' : 'Low Quality'}
            </span>
            <p className="modal-conf">Confidence: <strong>{conf}%</strong></p>
            <div className="conf-bar">
              <div className="conf-fill" style={{ width: `${conf}%`, background: conf >= 80 ? '#4CAF7D' : conf >= 60 ? '#F08030' : '#EF4444' }} />
            </div>
          </div>
        </div>
        {item.fabric_info?.deskripsi && <p className="modal-desc">{item.fabric_info.deskripsi}</p>}
        {chars.length > 0 && (
          <div className="modal-section">
            <h4>KARAKTERISTIK</h4>
            <ul>{chars.map((c, i) => <li key={i}><CheckCircle2 size={12} />{c}</li>)}</ul>
          </div>
        )}
        {uses.length > 0 && (
          <div className="modal-section">
            <h4>PENGGUNAAN UMUM</h4>
            <div className="tag-list">{uses.map((u, i) => <span key={i} className="badge badge-blue">{u}</span>)}</div>
          </div>
        )}
        {item.fabric_info?.cara_perawatan && (
          <div className="modal-section">
            <h4>CARA PERAWATAN</h4>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{item.fabric_info.cara_perawatan}</p>
          </div>
        )}
        <p className="modal-model">Model: <strong>{item.model_used}</strong></p>
      </div>
    </div>
  )
}

export default function BulkResultCard({ data, previews }) {
  const [selected, setSelected] = useState(null)
  const [showRejected, setShowRejected] = useState(false)

  const goodCount = data.results.filter(r => r.quality === 'Baik').length
  const badCount = data.results.filter(r => r.quality === 'Buruk').length

  // Fix NaN: hanya hitung avg confidence jika ada hasil
  const avgConf = data.results.length > 0
    ? Math.round(data.results.reduce((s, r) => s + r.confidence, 0) / data.results.length * 100)
    : 0

  const rejected = data.rejected || []
  const rejectedCount = data.rejected_count || 0

  // Buat preview map berdasarkan index asli
  // previews[i] sesuai urutan upload, rejected.index = posisi asli di array upload
  const getPreview = (resultIndex) => {
    // Hitung posisi preview yang sesuai dengan hasil yang diterima
    // Kita mapping ulang: accepted results ada di posisi yang tidak ada di rejected
    const rejectedIndexes = new Set(rejected.map(r => r.index))
    let acceptedCount = 0
    for (let i = 0; i < previews.length; i++) {
      if (!rejectedIndexes.has(i)) {
        if (acceptedCount === resultIndex) return previews[i]
        acceptedCount++
      }
    }
    return previews[resultIndex] // fallback
  }

  return (
    <div className="bulk-card card">
      {/* Summary stats */}
      <div className="bulk-stats">
        {[
          { val: data.total, label: 'Kain Terdeteksi', cls: '' },
          { val: goodCount, label: 'Kualitas Baik', cls: 'green' },
          { val: badCount, label: 'Kualitas Buruk', cls: 'orange' },
          { val: data.total > 0 ? `${avgConf}%` : '-', label: 'Rata-rata Confidence', cls: 'blue' },
        ].map(({ val, label, cls }) => (
          <div className="stat-box" key={label}>
            <p className={`stat-val ${cls}`}>{val}</p>
            <p className="stat-label">{label}</p>
          </div>
        ))}
      </div>

      <div className="bulk-badge-row">
        <span className="badge badge-blue">Selesai</span>
        <span className="conf-avg">
          Confidence: <strong>{data.total > 0 ? `${avgConf}%` : '-'}</strong>
        </span>
        {rejectedCount > 0 && (
          <span className="badge badge-orange">{rejectedCount} gambar ditolak</span>
        )}
      </div>

      {/* Gambar ditolak — dengan alasan */}
      {rejectedCount > 0 && (
        <div className="rejected-section">
          <button
            className="rejected-toggle"
            onClick={() => setShowRejected(p => !p)}
          >
            <AlertTriangle size={14} />
            <span>{rejectedCount} gambar tidak dikenali sebagai kain</span>
            <ChevronDown size={13} style={{ transform: showRejected ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>

          {showRejected && (
            <div className="rejected-list fade-in">
              {rejected.map((r, i) => (
                <div className="rejected-item" key={i}>
                  {previews[r.index] && (
                    <img src={previews[r.index]} alt="" className="rejected-thumb" />
                  )}
                  <div className="rejected-info">
                    <p className="rejected-filename">{r.filename || `Gambar ${r.index + 1}`}</p>
                    <p className="rejected-reason">
                      <AlertTriangle size={11} /> {r.reason}
                    </p>
                  </div>
                </div>
              ))}
              <p className="rejected-tip">
                💡 Pastikan foto berupa close-up tekstur kain dengan pencahayaan cukup
              </p>
            </div>
          )}
        </div>
      )}

      {/* Hasil yang berhasil */}
      {data.total > 0 ? (
        <>
          <div className="bulk-list-header">
            <h3 className="bulk-list-title">Riwayat Pengecekan Sesi Ini ({data.total})</h3>
            <p className="bulk-hint">Klik item untuk lihat detail</p>
          </div>
          <div className="bulk-list">
            {data.results.map((r, i) => {
              const name = r.fabric_info?.name || CLASS_DISPLAY[r.predicted_class] || r.predicted_class
              const conf = Math.round(r.confidence * 100)
              const preview = getPreview(i)
              return (
                <div className="bulk-item clickable" key={i}
                  onClick={() => setSelected({ item: r, preview })}>
                  {preview && <img src={preview} alt="" className="bulk-item-thumb" />}
                  <div className="bulk-item-info">
                    <p className="bulk-item-name">{name}</p>
                    <p className="bulk-item-meta">Gambar {i + 1} &nbsp;·&nbsp; {conf}%</p>
                  </div>
                  <div className="bulk-item-right">
                    <span className={`badge ${r.quality === 'Baik' ? 'badge-green' : 'badge-orange'}`}>
                      {r.quality === 'Baik' ? 'Premium' : 'Low Quality'}
                    </span>
                    <ChevronDown size={13} style={{ color: 'var(--text-muted)' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </>
      ) : (
        /* Semua gambar ditolak */
        <div className="all-rejected">
          <AlertTriangle size={32} style={{ color: '#F08030' }} />
          <p className="all-rejected-title">Semua Gambar Tidak Dikenali</p>
          <p className="all-rejected-sub">
            Tidak ada gambar yang dikenali sebagai kain dari {previews.length} gambar yang diunggah.
            Pastikan foto berupa close-up tekstur kain dengan pencahayaan yang cukup.
          </p>
        </div>
      )}

      {selected && (
        <DetailModal item={selected.item} preview={selected.preview} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}
