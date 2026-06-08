import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,

      isAuthenticated: () => !!get().token,

      setAuth: (token, user) => set({ token, user }),

      logout: () => {
        set({ token: null, user: null })
        // Hapus dari localStorage juga
        localStorage.removeItem('patterna-auth')
        sessionStorage.removeItem('deteksi_result')
        window.location.href = '/'
      },

      updateUser: (user) => set({ user }),

      // Dipanggil saat app load — validasi token masih valid
      clearIfExpired: () => {
        const token = get().token
        if (!token) return

        try {
          // Decode JWT tanpa library (cek expiry saja)
          const payload = JSON.parse(atob(token.split('.')[1]))
          const now = Math.floor(Date.now() / 1000)
          if (payload.exp && payload.exp < now) {
            // Token expired — logout otomatis
            set({ token: null, user: null })
            localStorage.removeItem('patterna-auth')
          }
        } catch {
          // Token malformed — hapus
          set({ token: null, user: null })
          localStorage.removeItem('patterna-auth')
        }
      },
    }),
    {
      name: 'patterna-auth',
      partialize: (s) => ({ token: s.token, user: s.user }),
    }
  )
)