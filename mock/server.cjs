const jsonServer = require('json-server')
const path = require('path')

const server = jsonServer.create()
const dbPath = path.join(__dirname, 'db.json')
const router = jsonServer.router(dbPath)
const middlewares = jsonServer.defaults({ noCors: false })

const PORT = 8081
const JWT_SECRET = 'verodata-mock-secret-2026'

// --- Fake JWT helpers ---
function base64url(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

function generateToken(payload) {
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = base64url(JSON.stringify({ ...payload, iat: Date.now(), exp: Date.now() + 86400000 }))
  const signature = base64url(JSON.stringify({ hash: JWT_SECRET }))
  return `${header}.${body}.${signature}`
}

function readDb() {
  return JSON.parse(require('fs').readFileSync(dbPath, 'utf-8'))
}

function writeDb(data) {
  require('fs').writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8')
}

// --- CORS ---
server.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
  if (req.method === 'OPTIONS') return res.sendStatus(200)
  next()
})

server.use(jsonServer.bodyParser)

// --- Auth middleware ---
server.use((req, res, next) => {
  const publicRoutes = ['/api/auth/login', '/api/auth/registrar']
  if (publicRoutes.includes(req.path) || req.path.startsWith('/api/auth/usuarios')) {
    return next()
  }
  next()
})

// ===================== AUTH ENDPOINTS =====================

// POST /api/auth/login
server.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body
  const db = readDb()
  const user = db.usuarios.find((u) => u.email === email)

  if (!user) {
    return res.status(404).json({ mensaje: 'El usuario con ese correo no está registrado.' })
  }

  if (user.password !== password) {
    return res.status(401).json({ mensaje: 'Contraseña incorrecta.' })
  }

  const token = generateToken({
    sub: user.email,
    nombre: user.nombre,
    rol: user.rol.nombre,
  })

  res.json({ mensaje: 'Inicio de sesión exitoso', token })
})

// POST /api/auth/registrar
server.post('/api/auth/registrar', (req, res) => {
  const { nombre, email, password, rol } = req.body
  const db = readDb()

  if (db.usuarios.find((u) => u.email === email)) {
    return res.status(400).json({ mensaje: 'El email ya está registrado.' })
  }

  const newUser = {
    id: db.usuarios.length > 0 ? Math.max(...db.usuarios.map((u) => u.id)) + 1 : 1,
    nombre,
    email,
    password,
    rol: {
      id: rol === 'ROLE_ADMIN' ? 1 : 2,
      nombre: rol || 'ROLE_CLIENTE',
    },
  }

  db.usuarios.push(newUser)
  writeDb(db)

  res.status(201).json(newUser)
})

// GET /api/auth/usuarios
server.get('/api/auth/usuarios', (req, res) => {
  const db = readDb()
  const users = db.usuarios.map(({ password, ...rest }) => rest)
  res.json(users)
})

// PUT /api/auth/usuarios/:id
server.put('/api/auth/usuarios/:id', (req, res) => {
  const id = parseInt(req.params.id)
  const db = readDb()
  const index = db.usuarios.findIndex((u) => u.id === id)

  if (index === -1) {
    return res.status(404).json({ mensaje: 'Usuario no encontrado.' })
  }

  const { nombre, email } = req.body
  db.usuarios[index].nombre = nombre || db.usuarios[index].nombre
  db.usuarios[index].email = email || db.usuarios[index].email
  writeDb(db)

  const { password, ...userWithoutPassword } = db.usuarios[index]
  res.json(userWithoutPassword)
})

// DELETE /api/auth/usuarios/:id
server.delete('/api/auth/usuarios/:id', (req, res) => {
  const id = parseInt(req.params.id)
  const db = readDb()
  const index = db.usuarios.findIndex((u) => u.id === id)

  if (index === -1) {
    return res.status(404).json({ mensaje: 'Usuario no encontrado.' })
  }

  db.usuarios.splice(index, 1)
  writeDb(db)

  res.status(200).send('Usuario eliminado correctamente')
})

// ===================== JSON-SERVER ROUTER =====================
server.use('/api', router)

// ===================== START =====================
server.listen(PORT, () => {
  console.log(`\n  🚀 Mock API Server corriendo en http://localhost:${PORT}`)
  console.log(`  🔑 Endpoints:`)
  console.log(`     POST   /api/auth/login         → Login`)
  console.log(`     POST   /api/auth/registrar      → Registro`)
  console.log(`     GET    /api/auth/usuarios       → Listar usuarios`)
  console.log(`     PUT    /api/auth/usuarios/:id   → Editar usuario`)
  console.log(`     DELETE /api/auth/usuarios/:id   → Eliminar usuario`)
  console.log(`\n  👤 Credenciales de prueba:`)
  console.log(`     Admin:  admin@verodata.com / admin123`)
  console.log(`     Cliente: carlos@cliente.com / cliente123`)
  console.log(`     Cliente: maria@cliente.com / cliente123`)
  console.log(`     Admin:  pedro@admin.com / admin123`)
  console.log(`\n  📦 Conecta tu frontend a http://localhost:${PORT}\n`)
})
