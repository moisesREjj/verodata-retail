# Arquitectura de VeroData Retail

Documentación técnica detallada del sistema, flujo de datos, componentes y conexiones internas.

---

## Índice

1. [Visión General](#1-visión-general)
2. [Router y Sistema de Rutas](#2-router-y-sistema-de-rutas)
3. [Autenticación y Roles](#3-autenticación-y-roles)
4. [Flujo de Datos](#4-flujo-de-datos)
5. [Sistema de Mock](#5-sistema-de-mock)
6. [Árbol de Componentes](#6-árbol-de-componentes)
7. [Estados de cada Página](#7-estados-de-cada-página)
8. [Sistema de Animaciones](#8-sistema-de-animaciones)
9. [Estilos y Temas](#9-estilos-y-temas)
10. [Dependencias y Librerías](#10-dependencias-y-librerías)

---

## 1. Visión General

```
┌─────────────────────────────────────────────────────┐
│                    Cliente (Browser)                  │
│  ┌───────────────────────────────────────────────┐   │
│  │  React 19 + Vite 8                            │   │
│  │  ┌──────────┐  ┌──────────┐  ┌────────────┐  │   │
│  │  │  Router   │  │ Context  │  │  Axios API  │  │   │
│  │  │ (react-   │→│ (Auth +  │→│  (con mock  │  │   │
│  │  │ router-dom│  │  Cart)   │  │  fallback)  │  │   │
│  │  └──────────┘  └──────────┘  └────────────┘  │   │
│  │         ↓            ↓              ↓         │   │
│  │  ┌────────────────────────────────────────┐   │   │
│  │  │  Componentes (shadcn/ui + framer-motion) │   │   │
│  │  └────────────────────────────────────────┘   │   │
│  └───────────────────────────────────────────────┘   │
│                        │                              │
│                        ▼                              │
│  ┌──────────────────────────────────────────────┐    │
│  │  Mock API fallback (api.js + MOCK_USERS[])   │    │
│  │  (usado en Netlify cuando no hay backend)     │    │
│  └──────────────────────────────────────────────┘    │
│                        │                              │
│                        ▼                              │
│  ┌──────────────────────────────────────────────┐    │
│  │  localhost:8081 (json-server para desarrollo)  │    │
│  │  mock/server.cjs + mock/db.json                │    │
│  └──────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

### Principios de diseño

- **Sin backend real**: Todo el sistema funciona con datos mock (hardcodeados o generados). Ideal para demostración y desarrollo frontend sin dependencias externas.
- **Context API para estado global**: Auth y Cart usan React Context con persistencia en `localStorage`.
- **Mock resiliente**: `src/lib/api.js` intenta conectar al backend real y, si falla, responde con datos mock desde el navegador. Esto permite que el deploy en Netlify funcione sin ningún servidor.
- **Estilo premium**: Toda la interfaz sigue una línea de diseño inspirada en Nike/Adidas: tipografía Oswald masiva, hover transitions, grid interactivo, hero con carrusel.

---

## 2. Router y Sistema de Rutas

### 2.1 Configuración (`src/App.jsx`)

El router está definido con `react-router-dom` v7 y utiliza un layout anidado:

```jsx
<Routes>
  <Route path="/login" element={<Login />} />

  {/* ── ADMIN ── */}
  <Route path="/dashboard" element={<ProtectedRoute role="ROLE_ADMIN"><DashboardLayout /></ProtectedRoute>}>
    <Route index element={<DashboardOverview />} />
    <Route path="usuarios" element={<UserManagement />} />
    <Route path="ajustes" element={<Ajustes />} />
  </Route>

  {/* ── CLIENTE ── */}
  <Route path="/" element={<ProtectedRoute role="ROLE_CLIENTE"><ClientLayout /></ProtectedRoute>}>
    <Route index element={<HomeCliente />} />
    <Route path="catalogo" element={<Catalog />} />
    <Route path="mis-pedidos" element={<MyOrders />} />
  </Route>

  <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
</Routes>
```

### 2.2 Layouts y Outlet

**ClientLayout** es el layout principal del cliente. Renderiza:
- **Header/Navbar** (sticky): logo, enlaces (Inicio, Catálogo, Mis Pedidos), carrito (Sheet), avatar + logout.
- **Mobile nav**: barra inferior fija con iconos + texto.
- **`<Outlet context={{ products, addItem }} />`**: renderiza la página hija (HomeCliente, Catalog, MyOrders) y le pasa los productos y la función `addItem` del CartContext.

**DashboardLayout** es el layout del admin con sidebar colapsable.

### 2.3 Guardias de ruta (`src/components/ProtectedRoute.jsx`)

```jsx
export function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth()

  if (loading) return <Spinner />
  if (!user) return <Navigate to="/login" replace />
  if (role && user.rol !== role) return <Navigate to={...} replace />
  return children
}
```

Flujo:
1. Mientras `loading` es `true`, muestra un spinner.
2. Si no hay usuario autenticado → redirige a `/login`.
3. Si se requiere un rol específico y no coincide → redirige al dashboard correspondiente.

---

## 3. Autenticación y Roles

### 3.1 AuthContext (`src/context/AuthContext.jsx`)

**Estado inicial**: Lee `user` y `token` de `localStorage`.

**login(email, password)**:
1. Hace `POST /api/auth/login` vía Axios.
2. Recibe `{ token }` (JWT falso).
3. Decodifica el payload del JWT con `parseToken`: extrae `sub` (email), `nombre`, `rol`.
4. Guarda `user` y `token` en `localStorage`.

**logout()**:
- Limpia `localStorage` y redirige a `/login`.

**parseToken(token)**:
```js
function parseToken(token) {
  return JSON.parse(atob(token.split('.')[1]))
}
```
Toma la segunda parte del JWT (payload) y la decodifica de base64.

### 3.2 Roles del sistema

| Rol | Acceso |
|-----|--------|
| `ROLE_ADMIN` | Dashboard (gestión de usuarios, gráficos, ajustes) |
| `ROLE_CLIENTE` | Home, Catálogo, Checkout, Mis Pedidos |
| `ROLE_SUPERADMIN` | Tratado como Admin |

### 3.3 Flujo de inicio de sesión

```
1. Usuario ingresa email + password en Login.jsx
2. → POST /api/auth/login (vía api.js)
3.   ├─ Éxito: { token: "eyJ..." }
4.   │   └─ AuthContext decodifica → { email, nombre, rol }
5.   │       └─ Redirige según rol:
6.   │           ├─ ROLE_ADMIN → /dashboard
7.   │           └─ ROLE_CLIENTE → /
8.   └─ Error: 401 (contraseña) o 404 (email) → muestra mensaje
```

---

## 4. Flujo de Datos

### 4.1 Productos

**Origen**: Array hardcodeado en `src/pages/client/ClientLayout.jsx` (12 productos mock).

```js
const products = [
  { id, name, category, price, stock, image },
  // ...
]
export { products }
```

**Flujo**:
```
ClientLayout.products
  → Outlet context ( products, addItem )
    → HomeCliente: products.slice(0,4) para featured
    → Catalog: enrichment + filtering + render
```

### 4.2 Carrito de Compras

**CartContext** (`src/context/CartContext.jsx`):
- Persistencia en `localStorage` bajo la clave `verodata_cart`.
- `addItem(product)`: Si ya existe, incrementa cantidad; si no, agrega con `quantity: 1`.
- `removeItem(id)`: Elimina del array.
- `updateQuantity(id, qty)`: Si `qty <= 0`, elimina.
- `clearCart()`: Vacía el carrito.
- Derivados: `totalItems`, `totalPrice`.

**Flujo**:
```
Catalog / HomeCliente
  → addItem(product) vía CartContext
    → localStorage.setItem('verodata_cart', JSON.stringify(items))
      → Checkout lee items de CartContext
        → Pago exitoso → clearCart()
```

### 4.3 API y Mock

Todas las llamadas HTTP pasan por `src/lib/api.js`:

```
Componente → api.js (Axios) → ¿Backend disponible?
  ├─ Sí → localhost:8081 → respuesta real
  └─ No → mockHandler() → respuesta falsa desde el frontend
```

### 4.4 Enriquecimiento de productos (Catalog.jsx)

Los productos básicos se enriquecen en `Catalog.jsx` mediante `enrichProduct()`:

```
Producto base → enrichProduct()
  ├─ isNew: stock > 4
  ├─ discount: % si stock <= 3 (15, 20, 25, 30 o 40 según id)
  ├─ originalPrice: precio antes del descuento
  ├─ description: según categoría
  └─ variants: [ 2 o 3 variantes de color ]
       ├─ color, hex
       ├─ frontImage (picsum)
       ├─ backImage (picsum, seed distinto)
       └─ thumbnail (picsum 60x60)
```

---

## 5. Sistema de Mock

### 5.1 Capas del sistema mock

| Capa | Archivo | Ámbito | Activa cuando... |
|------|---------|--------|-----------------|
| Mock server | `mock/server.cjs` + `mock/db.json` | Local | `npm run mock` |
| Mock frontend | `src/lib/api.js` → `mockHandler()` | Producción (Netlify) | Backend no responde |

### 5.2 Mock server local (`mock/server.cjs`)

Servidor Express con `json-server`:
- **Puerto**: 8081
- **Autenticación custom**: `POST /api/auth/login`, `POST /api/auth/registrar`
- **CRUD usuarios**: `GET/PUT/DELETE /api/auth/usuarios`
- **JWT falso**: Header + Payload + Signature en base64url (simula JWT real)
- **CORS**: Habilitado para desarrollo local

### 5.3 Mock frontend (`api.js`)

Interceptor de Axios que captura errores de red/timeout:

```js
API.interceptors.response.use(
  (response) => response,                     // Éxito → pasa
  (error) => {
    if (401) → logout()
    if (network error) → mockHandler(config)  // Falla → mock
  }
)
```

`mockHandler()` implementa los mismos endpoints que el server real y devuelve respuestas compatibles (mismo formato).

### 5.4 Endpoints mock

| Método | Ruta | Comportamiento |
|--------|------|---------------|
| POST | `/auth/login` | Busca email en MOCK_USERS[], valida password, genera JWT |
| POST | `/auth/registrar` | Valida email único, retorna usuario creado |
| GET | `/auth/usuarios` | Retorna todos los usuarios sin password |
| PUT | `/auth/usuarios/:id` | Actualiza nombre/email |
| DELETE | `/auth/usuarios/:id` | Elimina usuario del array |

---

## 6. Árbol de Componentes

### 6.1 Página principal del Cliente (`/`)

```
<ClientLayout>
  ├── Header
  │   ├── Logo + NavLink("/")
  │   ├── Nav (Inicio, Catálogo, Mis Pedidos)
  │   ├── CartSheet
  │   │   ├── SheetTrigger (icono carrito + badge)
  │   │   └── SheetContent
  │   │       ├── Lista de items con controles (+/-/delete)
  │   │       ├── Total
  │   │       └── Botón "Proceder al Pago"
  │   ├── Avatar + Logout
  │   └── MobileNav bar
  │
  └── <Outlet context={{ products, addItem }}>
       ├── [HomeCliente] ← index
       │   ├── HERO
       │   │   ├── AnimatePresence (carrusel de imágenes)
       │   │   ├── Texto superpuesto (Oswald)
       │   │   ├── CTA buttons
       │   │   └── Indicadores de imagen
       │   ├── BENTO GRID (3 columnas con stagger)
       │   │   └── Card × 3 (categorías con hover zoom)
       │   ├── COPY + FEATURED PRODUCTS
       │   │   ├── Titulo "MAKE IT HERE..."
       │   │   └── Card × 4 (con overlay quick-add)
       │   ├── EDITORIAL BANNER
       │   │   ├── Imagen full-bleed
       │   │   ├── Texto "EL RETAIL INTELIGENTE..."
       │   │   └── CTA "Descubrir Colección"
       │   └── TRUST BANNER
       │       └── 3 columnas (Envío, Pago, Soporte)
       │
       ├── [Catalog]
       │   ├── Header (título + buscador + toggle grid/list)
       │   ├── Filtro de categorías (pill buttons)
       │   └── Grilla de ProductCard
       │       ├── Imagen con AnimatePresence (frontal ↔ trasera)
       │       ├── Heart button (favoritos)
       │       ├── Variantes de color (thumbnails)
       │       ├── Badge (JUST IN / -X% / STOCK)
       │       ├── Nombre + descripción + precio
       │       └── Botón "Agregar"
       │
       └── [MyOrders]
           └── Lista de órdenes expandibles
               ├── CardHeader (ID, fecha, total, badge estado)
               └── CardContent (items, total)
</ClientLayout>
```

### 6.2 Checkout (`/checkout`)

```
<Checkout> ← standalone (sin ClientLayout)
  ├── Header (logo + Volver)
  ├── Formulario de envío (Card)
  │   ├── Nombre, Dirección, Ciudad, Código Postal
  │   └── Método de pago (3 opciones con layoutId animation)
  ├── Botón "Pagar S/X.XX"
  ├── Order Summary (Card sticky)
  │   ├── Items del carrito
  │   ├── Subtotal + Envío gratis
  │   └── Total
  └── Estados: empty / form / processing / success
```

### 6.3 Admin Dashboard (`/dashboard`)

```
<DashboardLayout>
  ├── Sidebar colapsable
  │   ├── Logo
  │   ├── Resumen, Usuarios, Ajustes
  │   └── Logout
  ├── Header (título, avatar, notificaciones)
  └── <Outlet>
       ├── [DashboardOverview]
       │   ├── KPIs (ventas, usuarios, alertas)
       │   ├── Gráfico de ventas (Recharts)
       │   └── Tabla de pedidos recientes
       ├── [UserManagement]
       │   ├── Tabla de usuarios
       │   ├── Modal de edición
       │   └── AlertDialog de eliminación
       └── [Ajustes]
           └── Formulario de configuración
```

---

## 7. Estados de cada Página

### HomeCliente
| Estado | Trigger | UI |
|--------|---------|-----|
| Carga inicial | Primer render | Animación fade-in del hero |
| Hero rotando | setInterval 4s | AnimatePresence slide + scale |
| Sin productos | `products.length === 0` | No aplica (products siempre tiene datos) |
| Scroll | User scroll | whileInView triggers en staggered sections |

### Catalog
| Estado | Trigger | UI |
|--------|---------|-----|
| Cargando | - | Siempre sincrónico (datos hardcodeados) |
| Vacío (búsqueda) | `filtered.length === 0` | Icono Package + mensaje + sugerencia |
| Grid | `viewMode === 'grid'` | Grid responsive 1-4 columnas |
| List | `viewMode === 'list'` | Lista horizontal con imágenes |
| Filtro activo | `category !== 'Todas'` | Pill resaltado |
| Hover en card | mouseEnter/mouseLeave | Imagen cambia, overlay quick-add aparece |
| Variante seleccionada | Click en thumbnail | Imágenes cambian a la variante |
| Favorito | Click heart | Heart fill rojo |

### Checkout
| Estado | Trigger | UI |
|--------|---------|-----|
| Vacío | `items.length === 0` | Mensaje + botón "Ir al Catálogo" |
| Formulario | items > 0 | Formulario de envío + pago + resumen |
| Procesando | Submit form | Spinner + "Procesando pago..." |
| Confirmado | setTimeout 2s | CheckCircle animado + botones acción |

### MyOrders
| Estado | Trigger | UI |
|--------|---------|-----|
| Sin pedidos | `initialOrders.length === 0` | Icono + mensaje |
| Lista | Pedidos existen | Cards expandibles |
| Expandido | Click en card | Muestra items y total |
| Colapsado | Click otra vez | Oculta detalles |

### Login
| Estado | Trigger | UI |
|--------|---------|-----|
| Login | Default | Formulario email + password |
| Registro | Toggle | Formulario con nombre extra |
| Error 401 | Password incorrecto | Alerta roja |
| Error 404 | Email no registrado | Alerta roja |
| Cargando | Submit | Spinner + "Procesando..." |

---

## 8. Sistema de Animaciones

### Librería: Framer Motion

| Componente | Animación | Técnica |
|-----------|-----------|---------|
| Hero carrusel | Slide lateral + scale 1.1→1 | `AnimatePresence` con variantes `enter/center/exit` |
| Hero texto | Fade-up secuencial | `staggerChildren: 0.18` con `y: 40 → 0` |
| Bento Grid cards | Stagger desde abajo | `staggerChildren: 0.15`, `y: 50 → 0` |
| Editorial banner | Fade-up al hacer scroll | `whileInView` con `fadeUp` variants |
| Featured products | Stagger + hover lift | `-translate-y-1` en hover |
| Trust banner | Stagger con borde hover | `hover:-translate-y-0.5` + `shadow-lg` |
| Quick-add overlay | Slide-up del botón | `translate-y-4 → 0` + opacidad |
| Hover imagen producto | Cross-fade front→back | `AnimatePresence mode="wait"` con opacidad |
| Checkout confirmación | Scale spring | `initial: scale(0) → scale(1)` spring |
| Payment indicator | Layout animation | `layoutId="payment-indicator"` |

### Variantes reutilizables

```js
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
}

const staggerItem = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } }
}
```

---

## 9. Estilos y Temas

### Tailwind CSS v4

Configuración nativa vía CSS (`src/index.css`) con `@theme`:

```css
@import "tailwindcss";
@custom-variant dark (&:is(.dark *));

@theme {
  --color-primary: hsl(240 5.9% 10%);
  --color-background: hsl(0 0% 100%);
  /* ... variables para modo claro y oscuro */
}
```

### Modo oscuro

- Controlado por clase `.dark` en `<html>`.
- Toggle al iniciar sesión: `localStorage.getItem('theme') !== 'light'`.
- Componentes usan `dark:` para variantes oscuras.

### Tipografía

| Uso | Fuente | Clase Tailwind |
|-----|--------|---------------|
| Headings hero | Oswald | `font-['Oswald',sans-serif] font-black uppercase leading-none tracking-tighter` |
| Títulos sección | Oswald | `font-['Oswald',sans-serif] text-5xl font-black uppercase tracking-tighter` |
| Cuerpo | Inter (sistema) | `font-light text-muted-foreground` |
| Labels | Sistema | `text-[10px] font-medium uppercase tracking-[0.2em]` |

Oswald se importa desde Google Fonts en `index.html`:
```html
<link href="https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

### shadcn/ui components

| Componente | Archivo | Uso principal |
|-----------|---------|--------------|
| Card | `src/components/ui/card.jsx` | Productos, formularios, secciones |
| Button | `src/components/ui/button.jsx` | CTAs, acciones, formularios |
| Badge | `src/components/ui/badge.jsx` | Labels de producto, estados |
| Input | `src/components/ui/input.jsx` | Búsqueda, formularios |
| Sheet | `src/components/ui/sheet.jsx` | Carrito de compras lateral |
| Avatar | `src/components/ui/avatar.jsx` | Foto de perfil del usuario |
| Separator | `src/components/ui/separator.jsx` | Divisores en layouts |
| ScrollArea | `src/components/ui/scroll-area.jsx` | Scroll del carrito |

---

## 10. Dependencias y Librerías

### Producción

| Paquete | Versión | Propósito |
|---------|---------|-----------|
| react | ^19.2.7 | UI framework |
| react-dom | ^19.2.7 | Renderizado DOM |
| react-router-dom | ^7.18.1 | Routing SPA |
| framer-motion | ^12.42.2 | Animaciones |
| axios | ^1.18.1 | HTTP client |
| tailwindcss | ^4.3.2 | CSS utility framework |
| @tailwindcss/vite | ^4.3.2 | Vite plugin para Tailwind v4 |
| class-variance-authority | ^0.7.1 | Variantes de componentes |
| clsx | ^2.1.1 | Clases condicionales |
| tailwind-merge | ^3.6.0 | Merge de clases |
| lucide-react | ^1.23.0 | Iconos |
| recharts | ^3.9.1 | Gráficos admin |
| vaul | ^1.1.2 | Drawer (shadcn/ui) |
| json-server | ^0.17.4 | Mock API server (dev) |
| cors | ^2.8.6 | CORS para mock server |
| @radix-ui/* | varios | Primitivas de accesibilidad |

### Desarrollo

| Paquete | Propósito |
|---------|-----------|
| vite | Bundler + dev server |
| @vitejs/plugin-react | React Fast Refresh |
| oxlint | Linter |
| concurrently | Ejecutar mock + dev paralelo |

---

## Convenciones de código

- **Archivos**: PascalCase para componentes (`HomeCliente.jsx`), camelCase para utilidades (`utils.js`).
- **Importaciones**: alias `@/` mapea a `src/`.
- **Estado**: Hooks de React (useState, useEffect) + Context API. Sin Redux.
- **Animaciones**: framer-motion `motion.div`, `AnimatePresence`, variantes `whileInView`.
- **Estilos**: Tailwind utility classes + `cn()` para merge condicional.
- **Responsive**: Mobile-first con `sm:`, `md:`, `lg:`, `xl:`.
- **Fallback de imágenes**: Función `imgFallback(e, label)` que cambia a placehold.co.
