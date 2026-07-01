import axios from 'axios'

const API = axios.create({
  baseURL: 'http://localhost:8081/api',
  timeout: 3000,
})

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ────────────────────────────────────────────────────────────
//  Mock fallback para cuando el backend no está disponible
//  (funciona en Netlify o cualquier entorno sin el server)
// ────────────────────────────────────────────────────────────

const MOCK_USERS = [
  { id: 1, nombre: 'Admin Principal', email: 'admin@verodata.com', password: 'admin123', rol: { id: 1, nombre: 'ROLE_ADMIN' } },
  { id: 2, nombre: 'Carlos López', email: 'carlos@cliente.com', password: 'cliente123', rol: { id: 2, nombre: 'ROLE_CLIENTE' } },
  { id: 3, nombre: 'María García', email: 'maria@cliente.com', password: 'cliente123', rol: { id: 2, nombre: 'ROLE_CLIENTE' } },
  { id: 4, nombre: 'Pedro Martínez', email: 'pedro@admin.com', password: 'admin123', rol: { id: 1, nombre: 'ROLE_ADMIN' } },
]

function base64url(str) {
  return btoa(str).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

function fakeJWT(payload) {
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = base64url(JSON.stringify({ ...payload, iat: Date.now(), exp: Date.now() + 86400000 }))
  const signature = base64url(JSON.stringify({ hash: 'verodata-mock-secret-2026' }))
  return `${header}.${body}.${signature}`
}

function stripPassword({ password, ...rest }) {
  return rest
}

function mockHandler(config) {
  const { url, method, data, params } = config
  const body = data ? JSON.parse(data) : {}

  // POST /auth/login
  if (url === '/auth/login' && method === 'post') {
    const user = MOCK_USERS.find((u) => u.email === body.email)
    if (!user) return { status: 404, data: { mensaje: 'El usuario con ese correo no está registrado.' } }
    if (user.password !== body.password) return { status: 401, data: { mensaje: 'Contraseña incorrecta.' } }
    const token = fakeJWT({ sub: user.email, nombre: user.nombre, rol: user.rol.nombre })
    return { status: 200, data: { mensaje: 'Inicio de sesión exitoso', token } }
  }

  // POST /auth/registrar
  if (url === '/auth/registrar' && method === 'post') {
    if (MOCK_USERS.find((u) => u.email === body.email)) {
      return { status: 400, data: { mensaje: 'El email ya está registrado.' } }
    }
    return { status: 201, data: { id: MOCK_USERS.length + 1, ...body } }
  }

  // GET /auth/usuarios
  if (url === '/auth/usuarios' && method === 'get') {
    return { status: 200, data: MOCK_USERS.map(stripPassword) }
  }

  // PUT /auth/usuarios/:id
  const putMatch = url?.match(/^\/auth\/usuarios\/(\d+)$/)
  if (putMatch && method === 'put') {
    const id = parseInt(putMatch[1])
    const idx = MOCK_USERS.findIndex((u) => u.id === id)
    if (idx === -1) return { status: 404, data: { mensaje: 'Usuario no encontrado.' } }
    Object.assign(MOCK_USERS[idx], { nombre: body.nombre ?? MOCK_USERS[idx].nombre, email: body.email ?? MOCK_USERS[idx].email })
    return { status: 200, data: stripPassword(MOCK_USERS[idx]) }
  }

  // DELETE /auth/usuarios/:id
  const delMatch = url?.match(/^\/auth\/usuarios\/(\d+)$/)
  if (delMatch && method === 'delete') {
    const id = parseInt(delMatch[1])
    const idx = MOCK_USERS.findIndex((u) => u.id === id)
    if (idx === -1) return { status: 404, data: { mensaje: 'Usuario no encontrado.' } }
    MOCK_USERS.splice(idx, 1)
    return { status: 200, data: 'Usuario eliminado correctamente' }
  }

  return null
}

API.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401 → logout
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
      return Promise.reject(error)
    }

    // Network error o timeout → intentar mock
    if (!error.response || error.code === 'ECONNABORTED') {
      const result = mockHandler(error.config)
      if (result) {
        if (result.status >= 400) {
          return Promise.reject({ response: { status: result.status, data: result.data } })
        }
        return Promise.resolve({ data: result.data })
      }
    }

    return Promise.reject(error)
  }
)

export default API
