import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'
import Navbar from './components/layout/Navbar'
import Deteksi from './pages/Deteksi'
import { Login, Register, Profil } from './pages/Auth'
import Riwayat from './pages/Riwayat'
import Ensiklopedia from './pages/Ensiklopedia'
import { Panduan } from './pages/Placeholders'
import { useAuthStore } from './store/authStore'

export default function App() {
  const { clearIfExpired } = useAuthStore()

  // Cek token expired saat app pertama dibuka
  useEffect(() => {
    clearIfExpired()
  }, [])

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Deteksi />} />
        <Route path="/panduan" element={<Panduan />} />
        <Route path="/ensiklopedia" element={<Ensiklopedia />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/riwayat" element={<Riwayat />} />
        <Route path="/profil" element={<Profil />} />
      </Routes>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            fontSize: '14px',
            borderRadius: '10px',
          },
        }}
      />
    </BrowserRouter>
  )
}
