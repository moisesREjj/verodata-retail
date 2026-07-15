import axios from 'axios'

// 🟢 Definimos la URL base correcta usando variables de entorno o producción
const BASE_URL = import.meta.env.VITE_API_URL || 'https://verodata-backend.onrender.com/api'

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  withCredentials: true // Clave para mantener las cookies/sesiones activas
})

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default {
  get: (url, config) => client.get(url, config),
  post: (url, data, config) => client.post(url, data, config),
  put: (url, data, config) => client.put(url, data, config),
  delete: (url, config) => client.delete(url, config),
}