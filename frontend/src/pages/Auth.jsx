import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, Loader2, Save, AlertCircle, Users, Factory } from 'lucide-react'
import { authAPI } from '../services/api'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'
import './Auth.css'
import logoImg from '../assets/logo.png'   

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)
}

function FieldError({ msg }) {
  if (!msg) return null
  return (
    <div className="field-error">
      <AlertCircle size={13} />
      <span>{msg}</span>
    </div>
  )
}

// ─── Logo komponen reusable ───────────────────────────
function AuthLogo() {
  return (
    <div className="auth-logo">
      <img src={logoImg} alt="PATTERNA" style={{ height: '56px', width: 'auto' }} />
    </div>
  )
}

// ─── Login ────────────────────────────────────────────
export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const { setAuth, token } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (token) navigate('/', { replace: true })
  }, [token])

  const validate = () => {
    const errs = {}
    if (!email) errs.email = 'Email tidak boleh kosong'
    else if (!isValidEmail(email)) errs.email = 'Format email tidak valid (contoh: nama@gmail.com)'
    if (!password) errs.password = 'Password tidak boleh kosong'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    setLoading(true)
    try {
      const res = await authAPI.login({ email, password })
      setAuth(res.data.access_token, res.data.user)
      toast.success(`Selamat datang, ${res.data.user.name}!`)
      navigate('/', { replace: true })
    } catch (err) {
      const status = err.response?.status
      const detail = err.response?.data?.detail
      if (status === 401) toast.error('Email atau password salah')
      else if (status === 422) toast.error('Format data tidak valid, periksa kembali isian Anda')
      else toast.error(detail || 'Terjadi kesalahan, coba lagi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card card fade-in">
        <AuthLogo />   
        <h1 className="auth-title">Masuk ke Akun</h1>
        <p className="auth-sub">Selamat datang kembali</p>
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email" placeholder="nama@gmail.com" value={email}
              onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })) }}
              className={errors.email ? 'input-error' : ''} autoComplete="email"
            />
            <FieldError msg={errors.email} />
          </div>
          <div className="form-group">
            <label>Password</label>
            <div className="input-pw">
              <input
                type={showPw ? 'text' : 'password'} placeholder="Password Anda" value={password}
                onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })) }}
                className={errors.password ? 'input-error' : ''} autoComplete="current-password"
              />
              <button type="button" className="pw-toggle" onClick={() => setShowPw(p => !p)}>
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <FieldError msg={errors.password} />
          </div>
          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? <><Loader2 size={15} className="spin" /> Masuk…</> : 'Masuk'}
          </button>
        </form>
        <p className="auth-switch">
          Belum punya akun? <Link to="/register">Daftar di sini</Link>
        </p>
      </div>
    </div>
  )
}

// ─── Register ─────────────────────────────────────────
export function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('umum')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const { setAuth, token } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (token) navigate('/', { replace: true })
  }, [token])

  const validate = () => {
    const errs = {}
    if (!name.trim()) errs.name = 'Nama tidak boleh kosong'
    else if (name.trim().length < 2) errs.name = 'Nama minimal 2 karakter'
    if (!email) errs.email = 'Email tidak boleh kosong'
    else if (!isValidEmail(email)) errs.email = 'Format email tidak valid (contoh: nama@gmail.com)'
    if (!password) errs.password = 'Password tidak boleh kosong'
    else if (password.length < 6) errs.password = 'Password minimal 6 karakter'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    setLoading(true)
    try {
      const res = await authAPI.register({ name, email, password, role })
      setAuth(res.data.access_token, res.data.user)
      toast.success('Akun berhasil dibuat!')
      navigate('/', { replace: true })
    } catch (err) {
      const status = err.response?.status
      const detail = err.response?.data?.detail
      if (status === 400) toast.error('Email sudah terdaftar, silakan login')
      else if (status === 422) toast.error('Format data tidak valid, periksa kembali isian Anda')
      else toast.error(detail || 'Terjadi kesalahan, coba lagi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card card fade-in">
        <AuthLogo /> 
        <h1 className="auth-title">Buat Akun Baru</h1>
        <p className="auth-sub">Daftar untuk menyimpan riwayat klasifikasi</p>
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label>Daftar sebagai</label>
            <div className="role-selector">
              <button
                type="button"
                className={`role-option ${role === 'umum' ? 'active' : ''}`}
                onClick={() => setRole('umum')}
              >
                <Users size={18} />
                <div>
                  <span className="role-name">Masyarakat Umum</span>
                  <span className="role-desc">Deteksi satu gambar, gratis</span>
                </div>
              </button>
              <button
                type="button"
                className={`role-option ${role === 'konveksi' ? 'active' : ''}`}
                onClick={() => setRole('konveksi')}
              >
                <Factory size={18} />
                <div>
                  <span className="role-name">Skala Konveksi</span>
                  <span className="role-desc">Bulk upload hingga 50 gambar</span>
                </div>
              </button>
            </div>
          </div>
          <div className="form-group">
            <label>Nama Lengkap</label>
            <input
              type="text" placeholder="Nama Anda" value={name}
              onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: '' })) }}
              className={errors.name ? 'input-error' : ''} autoComplete="name"
            />
            <FieldError msg={errors.name} />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email" placeholder="nama@gmail.com" value={email}
              onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })) }}
              className={errors.email ? 'input-error' : ''} autoComplete="email"
            />
            <FieldError msg={errors.email} />
          </div>
          <div className="form-group">
            <label>Password</label>
            <div className="input-pw">
              <input
                type={showPw ? 'text' : 'password'} placeholder="Minimal 6 karakter" value={password}
                onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })) }}
                className={errors.password ? 'input-error' : ''} autoComplete="new-password"
              />
              <button type="button" className="pw-toggle" onClick={() => setShowPw(p => !p)}>
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <FieldError msg={errors.password} />
          </div>
          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? <><Loader2 size={15} className="spin" /> Mendaftar…</> : 'Daftar'}
          </button>
        </form>
        <p className="auth-switch">
          Sudah punya akun? <Link to="/login">Masuk di sini</Link>
        </p>
      </div>
    </div>
  )
}

// ─── Profil ───────────────────────────────────────────
export function Profil() {
  const { user, token, updateUser, logout } = useAuthStore()
  const navigate = useNavigate()
  const [name, setName] = useState(user?.name || '')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (!token) navigate('/login', { replace: true })
  }, [token])

  if (!token) return null

  const validate = () => {
    const errs = {}
    if (!name.trim()) errs.name = 'Nama tidak boleh kosong'
    if (password && password.length < 6) errs.password = 'Password baru minimal 6 karakter'
    return errs
  }

  const handleSave = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    setLoading(true)
    try {
      const res = await authAPI.updateProfile({ name, password: password || undefined })
      updateUser(res.data)
      toast.success('Profil berhasil diperbarui')
      setPassword('')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Gagal memperbarui profil')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card card fade-in">
        <h1 className="auth-title">Profil Saya</h1>
        <div style={{ marginBottom: 8 }}>
          <span className={`role-badge role-badge-${user?.role}`}>
            {user?.role === 'konveksi' ? <><Factory size={12} /> Konveksi</> : <><Users size={12} /> Umum</>}
          </span>
        </div>
        <p className="auth-sub">{user?.email}</p>
        <form className="auth-form" onSubmit={handleSave} noValidate>
          <div className="form-group">
            <label>Nama Lengkap</label>
            <input
              type="text" value={name}
              onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: '' })) }}
              className={errors.name ? 'input-error' : ''}
            />
            <FieldError msg={errors.name} />
          </div>
          <div className="form-group">
            <label>Password Baru{' '}
              <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(opsional)</span>
            </label>
            <input
              type="password" placeholder="Kosongkan jika tidak ingin mengubah" value={password}
              onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })) }}
              className={errors.password ? 'input-error' : ''}
            />
            <FieldError msg={errors.password} />
          </div>
          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading
              ? <><Loader2 size={15} className="spin" /> Menyimpan…</>
              : <><Save size={14} /> Simpan Perubahan</>}
          </button>
        </form>
        <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border-light)' }}>
          <button
            className="btn btn-outline"
            style={{ width: '100%', color: '#EF4444', borderColor: '#EF4444' }}
            onClick={logout}
          >
            Keluar dari Akun
          </button>
        </div>
      </div>
    </div>
  )
}