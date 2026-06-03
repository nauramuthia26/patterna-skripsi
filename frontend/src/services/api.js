import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const api = axios.create({ 
  baseURL: `${import.meta.env.VITE_API_URL || ''}/api`, 
  timeout: 120000 
})

// Attach token ke setiap request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle response error
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status
    const url = err.config?.url || ''

    // Jangan intercept 401 dari endpoint login/register
    // karena itu memang error credentials yang harus ditampilkan ke user
    const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/register')

    if (status === 401 && !isAuthEndpoint) {
      // Token expired atau tidak valid — logout otomatis
      useAuthStore.getState().logout()
    }

    return Promise.reject(err)
  }
)

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/me', data),
}

export const classifyAPI = {
  umum: (file) => {
    const form = new FormData()
    form.append('file', file)
    return api.post('/classify/umum', form)
  },
  konveksi: (files) => {
    const form = new FormData()
    files.forEach((f) => form.append('files', f))
    return api.post('/classify/konveksi', form)
  },
}

export const historyAPI = {
  getAll: (params) => api.get('/history/', { params }),
  delete: (id) => api.delete(`/history/${id}`),
}

export const fabricAPI = {
  getAll: (params) => api.get('/fabrics/', { params }),
  getById: (id) => api.get(`/fabrics/${id}`),
  getByLabel: (label) => api.get(`/fabrics/label/${label}`),
}

export default api