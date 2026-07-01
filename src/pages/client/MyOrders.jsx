import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Package, ChevronDown, ChevronUp } from 'lucide-react'

const initialOrders = [
  {
    id: 'ORD-001',
    date: '2026-06-28',
    status: 'Pagado',
    total: 4230.00,
    items: [
      { name: 'iPhone 15 Pro', quantity: 1, price: 3746 },
      { name: 'Auriculares Bose', quantity: 1, price: 484 },
    ],
  },
  {
    id: 'ORD-002',
    date: '2026-06-25',
    status: 'Enviado',
    total: 334.00,
    items: [
      { name: 'Zapatillas Adidas', quantity: 1, price: 334 },
    ],
  },
  {
    id: 'ORD-003',
    date: '2026-06-20',
    status: 'Cancelado',
    total: 746.00,
    items: [
      { name: 'Chaqueta de Cuero', quantity: 1, price: 746 },
    ],
  },
  {
    id: 'ORD-004',
    date: '2026-06-15',
    status: 'Pagado',
    total: 480.00,
    items: [
      { name: 'Set de Sartenes', quantity: 1, price: 334 },
      { name: 'Lámpara LED', quantity: 1, price: 146 },
    ],
  },
  {
    id: 'ORD-005',
    date: '2026-06-10',
    status: 'Carrito',
    total: 244.00,
    items: [
      { name: 'Harry Potter Box Set', quantity: 1, price: 244 },
    ],
  },
]

const statusColors = {
  Pagado: 'success',
  Enviado: 'default',
  Cancelado: 'destructive',
  Carrito: 'warning',
}

export default function MyOrders() {
  const [expanded, setExpanded] = useState(null)

  const toggleExpand = (id) => {
    setExpanded(expanded === id ? null : id)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Mis Pedidos</h1>
        <p className="text-sm text-muted-foreground">
          Historial de todas tus transacciones.
        </p>
      </div>

      {initialOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Package className="mb-4 h-16 w-16" />
          <p className="text-lg font-medium">No tienes pedidos aún</p>
          <p className="text-sm">Explora el catálogo y realiza tu primera compra.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {initialOrders.map((order) => (
            <Card key={order.id} className="border-border/50 transition-all hover:shadow-md">
              <CardHeader className="cursor-pointer pb-3" onClick={() => toggleExpand(order.id)}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Package className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{order.id}</p>
                      <p className="text-xs text-muted-foreground">{order.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-semibold">S/{order.total.toFixed(2)}</p>
                    </div>
                    <Badge variant={statusColors[order.status]}>{order.status}</Badge>
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
                    {order.items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {item.name} <span className="text-xs">x{item.quantity}</span>
                        </span>
                        <span className="font-medium">S/{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between border-t pt-2 text-sm font-semibold">
                      <span>Total</span>
                      <span>S/{order.total.toFixed(2)}</span>
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
