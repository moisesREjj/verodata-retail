import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '@/lib/api'

const AuthContext = createContext(null)

function parseToken(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        setUser(JSON.parse(storedUser))
      } else {
        const payload = parseToken(token)
        if (payload) {
          const userData = {
            email: payload.sub || '',
            nombre: payload.nombre || '',
            rol: payload.rol || 'ROLE_CLIENTE',
          }
          localStorage.setItem('user', JSON.stringify(userData))
          setUser(userData)
        }
      }
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const res = await API.post('/auth/login', { email, password })
    const { token } = res.data
    localStorage.setItem('token', token)
    const payload = parseToken(token)
    const userData = {
      email: payload?.sub || email,
      nombre: payload?.nombre || email,
      rol: payload?.rol || 'ROLE_CLIENTE',
    }
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
    return userData
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    navigate('/login')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
