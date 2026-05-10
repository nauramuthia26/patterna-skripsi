import { NavLink, useNavigate } from 'react-router-dom'
import { User, LogOut, Clock, Users, Factory } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useAuthStore } from '../../store/authStore'
import './Navbar.css'
import logoImg from '../../assets/logo.png'  // ← fix path, bukan ../assets

export default function Navbar() {
  const { user, token, logout } = useAuthStore()
  const [dropOpen, setDropOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const dropRef = useRef(null)
  const nav = useNavigate()

  useEffect(() => {
    const h = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  useEffect(() => {
    const h = () => { if (window.innerWidth > 640) setMobileOpen(false) }
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])

  const navLinks = [
    { to: '/', label: 'Deteksi', end: true },
    { to: '/panduan', label: 'Panduan' },
    { to: '/ensiklopedia', label: 'Ensiklopedia' },
  ]

  const handleMobileNav = (to) => { setMobileOpen(false); nav(to) }

  const RoleBadge = () => {
    if (!user?.role) return null
    return user.role === 'konveksi'
      ? <span className="role-chip role-chip-konveksi"><Factory size={10} /> Konveksi</span>
      : <span className="role-chip role-chip-umum"><Users size={10} /> Umum</span>
  }

  return (
    <>
      <nav className="navbar">             
        <div className="navbar-inner">     

         {/* Logo */}
         <NavLink to="/" className="navbar-logo" onClick={() => setMobileOpen(false)}>
            <img
              src={logoImg}
              alt="PATTERNA"
              style={{ height: '80px', width: 'auto', objectFit: 'contain' }}
            />
            <span style={{ 
              fontFamily: "'Fredoka', sans-serif",
              fontWeight: 600, 
              fontSize: '1.4rem', 
              letterSpacing: '0.1em',
              color: '#1a3a5c' 
            }}>
              PATTERNA
            </span>
          </NavLink>


          {/* Desktop Links */}
          <div className="navbar-links">
            {navLinks.map(({ to, label, end }) => (
              <NavLink key={to} to={to} end={end}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                {label}
              </NavLink>
            ))}
          </div>

          {/* Auth + Hamburger */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="navbar-auth">
              {token && user ? (
                <div className="user-menu" ref={dropRef}>
                  <button className="user-btn" onClick={() => setDropOpen(p => !p)}>
                    <div className="user-avatar">{user.name?.charAt(0).toUpperCase()}</div>
                    <span className="user-name">{user.name}</span>
                    <RoleBadge />
                  </button>
                  {dropOpen && (
                    <div className="user-dropdown fade-in">
                      <div className="drop-header">
                        <p className="drop-name">{user.name}</p>
                        <p className="drop-email">{user.email}</p>
                        <RoleBadge />
                      </div>
                      <div className="drop-divider" />
                      <button className="drop-item" onClick={() => { setDropOpen(false); nav('/profil') }}>
                        <User size={14} /> Profil Saya
                      </button>
                      <button className="drop-item" onClick={() => { setDropOpen(false); nav('/riwayat') }}>
                        <Clock size={14} /> Riwayat Klasifikasi
                      </button>
                      <div className="drop-divider" />
                      <button className="drop-item danger" onClick={logout}>
                        <LogOut size={14} /> Keluar
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button className="icon-btn" onClick={() => nav('/login')}>
                  <User size={19} />
                </button>
              )}
            </div>

            <button className={`hamburger ${mobileOpen ? 'open' : ''}`}
              onClick={() => setMobileOpen(p => !p)} aria-label="Menu">
              <span /><span /><span />
            </button>
          </div>

        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${mobileOpen ? 'open' : ''}`} onClick={() => setMobileOpen(false)}>
        <div className="mobile-drawer" onClick={e => e.stopPropagation()}>
          {token && user && (
            <>
              <div className="mobile-user-info">
                <div className="mobile-user-avatar">{user.name?.charAt(0).toUpperCase()}</div>
                <div>
                  <p className="mobile-user-name">{user.name}</p>
                  <p className="mobile-user-email">{user.email}</p>
                  <RoleBadge />
                </div>
              </div>
              <div className="mobile-divider" />
            </>
          )}

          {navLinks.map(({ to, label, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}>
              {label}
            </NavLink>
          ))}

          <div className="mobile-divider" />

          {token && user ? (
            <>
              <button className="mobile-action-btn" onClick={() => handleMobileNav('/riwayat')}>
                <Clock size={16} /> Riwayat Klasifikasi
              </button>
              <button className="mobile-action-btn" onClick={() => handleMobileNav('/profil')}>
                <User size={16} /> Profil Saya
              </button>
              <div className="mobile-divider" />
              <button className="mobile-action-btn danger" onClick={logout}>
                <LogOut size={16} /> Keluar dari Akun
              </button>
            </>
          ) : (
            <>
              <button className="mobile-action-btn" onClick={() => handleMobileNav('/login')}>
                <User size={16} /> Masuk
              </button>
              <button className="mobile-action-btn" onClick={() => handleMobileNav('/register')}>
                Daftar Akun
              </button>
            </>
          )}
        </div>
      </div>
    </>
  )
}