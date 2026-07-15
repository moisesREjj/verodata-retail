import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Package, ChevronDown, ChevronUp } from 'lucide-react'
import API from '@/lib/api'

const statusColors = {
  Pagado: 'success',
  Enviado: 'default',
  Cancelado: 'destructive',
  Carrito: 'warning',
}

export default function MyOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    API.get('/pedidos/mis-pedidos')
      .then((res) => setOrders(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const toggleExpand = (id) => {
    setExpanded(expanded === id ? null : id)
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Mis Pedidos</h1>
        <p className="text-sm text-muted-foreground">
          Historial de todas tus transacciones.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Package className="mb-4 h-16 w-16" />
          <p className="text-lg font-medium">No tienes pedidos aún</p>
          <p className="text-sm">Explora el catálogo y realiza tu primera compra.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Card key={order.id} className="border-border/50 transition-all hover:shadow-md">
              <CardHeader className="cursor-pointer pb-3" onClick={() => toggleExpand(order.id)}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Package className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{order.codigo}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.fecha || order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-semibold">S/{Number(order.total).toFixed(2)}</p>
                    </div>
                    <Badge variant={statusColors[order.estado] || 'default'}>{order.estado}</Badge>
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                      {expanded === order.id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {expanded === order.id && (
                <CardContent className="pb-4 pt-0">
                  <div className="space-y-2 border-t pt-3">
                    {(order.pedido_items || []).map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {item.productos?.nombre || `Producto #${item.id_producto}`} <span className="text-xs">x{item.cantidad}</span>
                        </span>
                        <span className="font-medium">S/{(Number(item.precio_unitario) * item.cantidad).toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between border-t pt-2 text-sm font-semibold">
                      <span>Total</span>
                      <span>S/{Number(order.total).toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
