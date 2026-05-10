import { useState, useCallback, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import { Users, Factory, Upload, X, AlertCircle, CheckCircle2,
         Loader2, ChevronRight, AlertTriangle, Camera, Lock } from 'lucide-react'
import { classifyAPI } from '../services/api'
import { useAuthStore } from '../store/authStore'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import ResultCard from '../components/ui/ResultCard'
import BulkResultCard from '../components/ui/BulkResultCard'
import './Deteksi.css'

export default function Deteksi() {
  const { token, user } = useAuthStore()
  const navigate = useNavigate()

  // Tentukan kategori otomatis berdasarkan role
  // - Belum login → paksa 'umum'
  // - Login umum  → paksa 'umum'
  // - Login konveksi → paksa 'konveksi'
  const autoCategory = !token ? 'umum' : (user?.role === 'konveksi' ? 'konveksi' : 'umum')

  const [files, setFiles] = useState([])
  const [previews, setPreviews] = useState([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [bulkResult, setBulkResult] = useState(null)
  const [error, setError] = useState(null)

  const [cameraOpen, setCameraOpen] = useState(false)
  const videoRef = useRef(null)
  const streamRef = useRef(null)

  const onDrop = useCallback((accepted) => {
    if (!accepted?.length) return
    setError(null)
    if (autoCategory === 'umum') {
      setFiles([accepted[0]])
      setPreviews([URL.createObjectURL(accepted[0])])
      setResult(null)
    } else {
      setFiles(p => [...p, ...accepted].slice(0, 50))
      setPreviews(p => [...p, ...accepted.map(f => URL.createObjectURL(f))].slice(0, 50))
      setBulkResult(null)
    }
  }, [autoCategory])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [] },
    multiple: autoCategory === 'konveksi',
    maxFiles: autoCategory === 'konveksi' ? 50 : 1,
  })

  const removeFile = (idx) => {
    setFiles(p => p.filter((_, i) => i !== idx))
    setPreviews(p => p.filter((_, i) => i !== idx))
    setError(null)
  }

  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      streamRef.current = stream
      setCameraOpen(true)
      setTimeout(() => { if (videoRef.current) videoRef.current.srcObject = stream }, 100)
    } catch {
      toast.error('Tidak dapat mengakses kamera. Pastikan izin kamera diaktifkan.')
    }
  }

  const closeCamera = () => {
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null }
    setCameraOpen(false)
  }

  const capturePhoto = () => {
    const video = videoRef.current
    if (!video) return
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth; canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0)
    canvas.toBlob((blob) => {
      const file = new File([blob], `foto_kain_${Date.now()}.jpg`, { type: 'image/jpeg' })
      const url = URL.createObjectURL(blob)
      setError(null)
      if (autoCategory === 'umum') {
        setFiles([file]); setPreviews([url]); setResult(null)
      } else {
        setFiles(p => [...p, file].slice(0, 50))
        setPreviews(p => [...p, url].slice(0, 50))
      }
      closeCamera()
      toast.success('Foto berhasil diambil!')
    }, 'image/jpeg', 0.92)
  }

  const handleClassify = async () => {
    if (!files.length) { toast.error('Pilih gambar terlebih dahulu'); return }
    setLoading(true); setError(null); setResult(null); setBulkResult(null)
    try {
      if (autoCategory === 'umum') {
        const res = await classifyAPI.umum(files[0])
        setResult(res.data)
        if (!token) toast('💡 Login untuk menyimpan riwayat', { duration: 3000 })
      } else {
        const res = await classifyAPI.konveksi(files)
        setBulkResult(res.data)
      }
    } catch (err) {
      const status = err.response?.status
      const msg = err.response?.data?.detail || 'Gagal memproses gambar'
      if (status === 422) setError({ type: 'low_confidence', message: msg })
      else if (status === 503) setError({ type: 'no_model', message: msg })
      else if (status === 401 || status === 403) toast.error(msg)
      else toast.error(msg)
    } finally { setLoading(false) }
  }

  const reset = () => {
    closeCamera()
    setFiles([]); setPreviews([])
    setResult(null); setBulkResult(null); setError(null)
  }

  // ── Tampilan khusus: user belum login coba akses konveksi ─────────────────
  // (Tidak mungkin terjadi lewat UI, tapi sebagai fallback keamanan frontend)

  return (
    <div className="deteksi-page">
      <div className="container">

        {/* Header info kategori — tidak ada pilihan, langsung tampil sesuai role */}
        <div className="deteksi-header fade-in">
          <div className="deteksi-badge-wrap">
            <span className="deteksi-badge">
              {autoCategory === 'umum'
                ? <><Users size={13} /> Masyarakat Umum</>
                : <><Factory size={13} /> Skala Konveksi</>}
            </span>
            {/* Tombol login jika belum login (mode umum paksa) */}
            {!token && (
              <button
                className="btn btn-outline btn-sm konveksi-login-hint"
                onClick={() => navigate('/login')}
              >
                <Lock size={13} /> Login untuk akses Konveksi
              </button>
            )}
          </div>
        </div>

        {/* Konten upload */}
        <div className="card upload-card fade-in">
          <div {...getRootProps()} className={`dropzone ${isDragActive ? 'dz-active' : ''} ${files.length && autoCategory === 'umum' ? 'dz-filled' : ''}`}>
            <input {...getInputProps()} />
            {autoCategory === 'umum' && previews[0] ? (
              <div className="preview-single">
                <img src={previews[0]} alt="preview" />
                <button className="remove-btn" onClick={e => { e.stopPropagation(); removeFile(0) }}><X size={15} /></button>
              </div>
            ) : (
              <div className="dz-placeholder">
                <div className="dz-icon"><Upload size={24} /></div>
                <p className="dz-title">{isDragActive ? 'Lepaskan di sini!' : 'Seret & lepas gambar kain'}</p>
                <p className="dz-sub">
                  atau <span className="dz-browse">pilih file</span>
                  &nbsp;·&nbsp; {autoCategory === 'konveksi' ? 'Maks 50 gambar' : '1 gambar'}
                </p>
              </div>
            )}
          </div>

          {autoCategory === 'konveksi' && previews.length > 0 && (
            <div className="bulk-preview">
              {previews.map((src, i) => (
                <div className="bulk-thumb" key={i}>
                  <img src={src} alt="" />
                  <button className="remove-thumb" onClick={() => removeFile(i)}><X size={10} /></button>
                </div>
              ))}
              <div {...getRootProps()} className="bulk-thumb add-more">
                <input {...getInputProps()} />
                <Upload size={16} /><span>Tambah</span>
              </div>
            </div>
          )}

          {!cameraOpen && (
            <div className="camera-row">
              <span className="camera-divider">atau</span>
              <button className="btn-camera" onClick={openCamera}><Camera size={15} /> Gunakan Kamera</button>
            </div>
          )}

          {cameraOpen && (
            <div className="camera-container fade-in">
              <video ref={videoRef} className="camera-video" autoPlay playsInline muted />
              <button className="btn-stop-camera" onClick={closeCamera}><X size={15} /></button>
              <div className="camera-controls">
                <button className="btn-capture" onClick={capturePhoto}><Camera size={22} color="var(--primary)" /></button>
              </div>
            </div>
          )}

          <div className="upload-actions">
            {!token && (
              <p className="guest-notice"><AlertCircle size={13} /> Login untuk menyimpan riwayat</p>
            )}
            <button className="btn btn-primary classify-btn" onClick={handleClassify} disabled={loading || !files.length}>
              {loading
                ? <><Loader2 size={15} className="spin" /> Memproses…</>
                : <><CheckCircle2 size={15} /> Klasifikasikan</>}
            </button>
          </div>
        </div>

        {error && (
          <div className={`error-box fade-in ${error.type}`}>
            <div className="error-icon"><AlertTriangle size={20} /></div>
            <div className="error-content">
              <p className="error-title">
                {error.type === 'low_confidence' ? 'Gambar Tidak Dikenali sebagai Kain' : 'Model Belum Tersedia'}
              </p>
              <p className="error-msg">{error.message}</p>
              {error.type === 'low_confidence' && (
                <ul className="error-tips">
                  <li>Pastikan foto adalah close-up tekstur kain</li>
                  <li>Gunakan pencahayaan yang cukup</li>
                  <li>Ambil foto dari jarak 5–15 cm dari kain</li>
                </ul>
              )}
            </div>
          </div>
        )}

        {result && !error && <div className="fade-in"><ResultCard result={result} imageUrl={previews[0]} /></div>}
        {bulkResult && !error && <div className="fade-in"><BulkResultCard data={bulkResult} previews={previews} /></div>}
      </div>
    </div>
  )
}