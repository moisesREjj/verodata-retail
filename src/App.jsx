import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { CartProvider } from '@/context/CartContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'

import Login from '@/pages/Login'
import DashboardLayout from '@/pages/DashboardLayout'
import DashboardOverview from '@/pages/DashboardOverview'
import UserManagement from '@/pages/UserManagement'
import Ajustes from '@/pages/Ajustes'
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
                <ProtectedRoute role="ROLE_ADMIN">
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardOverview />} />
              <Route path="usuarios" element={<UserManagement />} />
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
