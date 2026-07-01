# VeroData Retail

Plataforma de e-commerce retail inteligente con enfoque en el mercado italiano. Interfaz moderna inspirada en el diseño de Nike y Adidas, con dashboard administrativo y experiencia de compra premium.

---

## ✨ Tecnologías

| Frontend | Herramientas | UI |
|----------|-------------|-----|
| React 19 + Vite 8 | Tailwind CSS v4 | shadcn/ui (Radix) |
| React Router v7 | Framer Motion | Lucide React |
| Axios | Recharts | Oswald + Inter |

---

## 🚀 Cómo levantar el proyecto

```bash
# 1. Clonar
git clone https://github.com/TU_USUARIO/verodata-retail.git
cd verodata-retail

# 2. Instalar dependencias
npm install

# 3. Iniciar el mock API + frontend (recomendado)
npm run dev:full

# O por separado:
npm run mock      # Mock API en http://localhost:8081
npm run dev       # Frontend en http://localhost:5173

# 4. Build para producción
npm run build
```

---

## 👤 Credenciales de prueba

| Rol | Email | Contraseña |
|-----|-------|-----------|
| Admin | `admin@verodata.com` | `admin123` |
| Admin | `pedro@admin.com` | `admin123` |
| Cliente | `carlos@cliente.com` | `cliente123` |
| Cliente | `maria@cliente.com` | `cliente123` |

---

## 📁 Estructura del proyecto

```
verodata-retail/
├── mock/                    # Mock API server (json-server)
│   ├── db.json              # Base de datos mock (usuarios)
│   └── server.cjs           # Servidor con JWT falso
├── public/
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui (Card, Button, Badge, Sheet, etc.)
│   │   └── ProtectedRoute.jsx
│   ├── context/
│   │   ├── AuthContext.jsx   # Autenticación + JWT
│   │   └── CartContext.jsx   # Carrito (localStorage)
│   ├── lib/
│   │   ├── api.js            # Axios + mock fallback automático
│   │   └── utils.js          # cn() utility
│   ├── pages/
│   │   ├── client/
│   │   │   ├── ClientLayout.jsx   # Navbar + Outlet
│   │   │   ├── HomeCliente.jsx    # Landing page (Nike-style)
│   │   │   ├── Catalog.jsx        # Catálogo interactivo
│   │   │   ├── Checkout.jsx       # Checkout premium
│   │   │   └── MyOrders.jsx       # Historial de pedidos
│   │   ├── Login.jsx
│   │   ├── DashboardLayout.jsx
│   │   ├── DashboardOverview.jsx  # Gráficos admin
│   │   ├── UserManagement.jsx     # CRUD usuarios
│   │   └── Ajustes.jsx
│   ├── App.jsx              # Router principal
│   ├── index.css            # Tailwind + variables CSS
│   └── main.jsx
├── netlify.toml             # Config Netlify
└── package.json
```

---

## 🧭 Rutas del sistema

### Cliente (`/`)
| Ruta | Página | Descripción |
|------|--------|-------------|
| `/` | HomeCliente | Landing page con hero, bento grid, editorial |
| `/catalogo` | Catalog | Grilla de productos con variantes y hover |
| `/mis-pedidos` | MyOrders | Historial de pedidos |
| `/checkout` | Checkout | Proceso de pago |

### Admin (`/dashboard`)
| Ruta | Página | Descripción |
|------|--------|-------------|
| `/dashboard` | DashboardOverview | KPIs, gráficos de ventas |
| `/dashboard/usuarios` | UserManagement | CRUD de usuarios |
| `/dashboard/ajustes` | Ajustes | Configuración |

---

## 🎨 Funcionalidades destacadas

- **Hero dinámico**: Carrusel de imágenes Unsplash con `AnimatePresence` y transición slide + scale
- **Miniaturas de color**: Selector de variantes por producto (estilo Adidas)
- **Hover inteligente**: La imagen frontal cambia a una perspectiva trasera con fade animado
- **Quick-add overlay**: Botón "Agregar" que aparece al hover (estilo Nike)
- **Vista grid/list**: Toggle de visualización en el catálogo
- **Modo oscuro/claro**: Soporte completo con Tailwind `dark:`
- **Tipografía Oswald**: Headings masivos en uppercase (estilo Nike)
- **Mock API embebido**: La app funciona 100% standalone sin backend gracias al fallback automático en `api.js`

---

## 🌐 Deploy en Netlify

El proyecto incluye `netlify.toml` con la configuración necesaria:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

Pasos:
1. Subir el repo a GitHub
2. Ir a https://app.netlify.com → "Add new site" → "Import existing project"
3. Seleccionar el repo
4. Netlify detecta automáticamente: build `npm run build`, publish `dist`
5. ¡Listo! La app funciona con mocks embebidos, no necesita backend real.

---

## 📄 Licencia

MIT
