import { useState, useEffect, useCallback } from 'react'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import API from '@/lib/api'
import { Search, RefreshCw, Eye, ClipboardList } from 'lucide-react'
import { ESTADOS_PEDIDO } from '@/types'

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)

  const fetchOrders = useCallback(async () => {
    try {
      const res = await API.get('/pedidos')
      setOrders(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await API.put(`/pedidos/${orderId}/estado`, { estado: newStatus })
      fetchOrders()
    } catch (err) {
      console.error(err)
    }
  }

  const openDetail = (order) => {
    setSelectedOrder(order)
    setDetailOpen(true)
  }

  const filtered = orders.filter((o) => {
    const matchSearch =
      o.codigo?.toLowerCase().includes(search.toLowerCase()) ||
      o.usuarios?.nombre?.toLowerCase().includes(search.toLowerCase()) ||
      o.usuarios?.email?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || o.estado === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gestión de Órdenes</h1>
          <p className="text-sm text-muted-foreground">
            Visualiza y actualiza el estado de las órdenes.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchOrders} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por código, cliente o email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 max-w-sm"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=" ">Todos</SelectItem>
                {Object.entries(ESTADOS_PEDIDO).map(([key, val]) => (
                  <SelectItem key={key} value={key}>{val.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Items</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">Cargando órdenes...</TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">No se encontraron órdenes.</TableCell>
                </TableRow>
              ) : (
                filtered.map((o) => {
                  const estadoStyle = ESTADOS_PEDIDO[o.estado] || { label: o.estado, color: 'bg-zinc-500/20 text-zinc-400' }
                  return (
                    <TableRow key={o.id}>
                      <TableCell className="font-mono text-xs font-medium">{o.codigo}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{o.usuarios?.nombre}</p>
                          <p className="text-xs text-muted-foreground">{o.usuarios?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(o.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-mono">S/ {Number(o.total).toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge className={estadoStyle.color}>{estadoStyle.label}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {o.pedido_items?.length || 0}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openDetail(o)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Select
                            value={o.estado}
                            onValueChange={(v) => handleStatusChange(o.id, v)}
                          >
                            <SelectTrigger className="w-32 h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.keys(ESTADOS_PEDIDO).map((est) => (
                                <SelectItem key={est} value={est}>{ESTADOS_PEDIDO[est].label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Orden {selectedOrder?.codigo}
              {selectedOrder && (
                <Badge className={`ml-2 ${ESTADOS_PEDIDO[selectedOrder.estado]?.color}`}>
                  {ESTADOS_PEDIDO[selectedOrder.estado]?.label}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Cliente</p>
                  <p className="font-medium">{selectedOrder.usuarios?.nombre}</p>
                  <p className="text-muted-foreground">{selectedOrder.usuarios?.email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Envío</p>
                  <p className="font-medium">{selectedOrder.nombre_envio || '-'}</p>
                  <p className="text-muted-foreground">{selectedOrder.direccion_envio || '-'}</p>
                  {selectedOrder.ciudad_envio && <p>{selectedOrder.ciudad_envio}</p>}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Productos</p>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead>Cant.</TableHead>
                      <TableHead>P. Unit.</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedOrder.pedido_items?.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.productos?.nombre}</TableCell>
                        <TableCell>{item.cantidad}</TableCell>
                        <TableCell className="font-mono">S/ {Number(item.precio_unitario).toFixed(2)}</TableCell>
                        <TableCell className="font-mono text-right">
                          S/ {(item.cantidad * item.precio_unitario).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="text-right text-lg font-bold">
                Total: S/ {Number(selectedOrder.total).toFixed(2)}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
