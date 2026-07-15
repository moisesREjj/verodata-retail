import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { CartProvider } from '@/context/CartContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'

import Login from '@/pages/Login'
import DashboardLayout from '@/pages/DashboardLayout'
import DashboardOverview from '@/pages/DashboardOverview'
import UserManagement from '@/pages/UserManagement'
import AdminProducts from '@/pages/AdminProducts'
import AdminCategories from '@/pages/AdminCategories'
import AdminOrders from '@/pages/AdminOrders'
import AdminPayments from '@/pages/AdminPayments'
import AdminStock from '@/pages/AdminStock'
import Ajustes from '@/pages/Ajustes'
import AnalystDashboard from '@/pages/AnalystDashboard'
import AnalistaResumen from '@/pages/analista/AnalistaResumen'
import Ventas from '@/pages/analista/Ventas'
import Productos from '@/pages/analista/Productos'
import Pagos from '@/pages/analista/Pagos'
import Clientes from '@/pages/analista/Clientes'
import Auditoria from '@/pages/analista/Auditoria'
import ClientLayout from '@/pages/client/ClientLayout'
import HomeCliente from '@/pages/client/HomeCliente'
import Catalog from '@/pages/client/Catalog'
import Checkout from '@/pages/client/Checkout'
import MyOrders from '@/pages/client/MyOrders'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute role={['ROLE_ADMIN', 'ROLE_ANALISTA']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardOverview />} />
              <Route path="usuarios" element={<UserManagement />} />
              <Route path="productos" element={<AdminProducts />} />
              <Route path="categorias" element={<AdminCategories />} />
              <Route path="ordenes" element={<AdminOrders />} />
              <Route path="pagos" element={<AdminPayments />} />
              <Route path="stock" element={<AdminStock />} />
              <Route path="analista" element={<AnalystDashboard />} />
              <Route path="analista/resumen" element={<AnalistaResumen />} />
              <Route path="analista/ventas" element={<Ventas />} />
              <Route path="analista/productos" element={<Productos />} />
              <Route path="analista/pagos" element={<Pagos />} />
              <Route path="analista/clientes" element={<Clientes />} />
              <Route path="analista/auditoria" element={<Auditoria />} />
              <Route path="ajustes" element={<Ajustes />} />
            </Route>
            <Route
              path="/"
              element={
                <ProtectedRoute role="ROLE_CLIENTE">
                  <ClientLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<HomeCliente />} />
              <Route path="catalogo" element={<Catalog />} />
              <Route path="mis-pedidos" element={<MyOrders />} />
            </Route>
            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
