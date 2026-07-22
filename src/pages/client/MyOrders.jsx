import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Package, ChevronDown, ChevronUp, Download, FileText, Tag } from 'lucide-react'
import API from '@/lib/api'
import { generarComprobantePDF } from '@/lib/pdfGenerator'

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

  // 📄 Función para volver a descargar el PDF desde el historial
  const handleDownloadPDF = (order) => {
    // Mapeamos los items del pedido al formato que consume el PDF
    const itemsPDF = (order.pedido_items || order.items || order.detalles || []).map((item) => ({
      name: item.productos?.nombre || item.nombre_producto || item.name || `Producto #${item.id_producto || ''}`,
      quantity: item.cantidad || item.quantity || 1,
      price: Number(item.precio_unitario || item.price || 0),
    }))

    // Mapeo y cálculo de totales/descuentos
    const total = Number(order.total || 0)
    let subtotalCalculado = itemsPDF.reduce((acc, i) => acc + i.price * i.quantity, 0)
    const subtotal = Number(order.subtotal || (subtotalCalculado > 0 ? subtotalCalculado : total))
    const descuento = Number(order.descuento || (subtotal > total ? subtotal - total : 0))

    // Estructuramos el objeto del pedido enriquecido para el PDF
    const pedidoData = {
      id: order.id,
      codigo: order.codigo || order.codigo_pedido,
      subtotal: subtotal,
      descuento: descuento,
      total: total,
      nombre_envio: order.nombre_envio,
      direccion_envio: order.direccion_envio,
      ciudad_envio: order.ciudad_envio,
      codigo_postal: order.codigo_postal,
      telefono_envio: order.telefono_envio,
      fecha: order.fecha || order.created_at,
    }

    const emailCliente = order.email_envio || order.email || ''
    const metodoPago = order.metodo_pago || 'Tarjeta'

    generarComprobantePDF(pedidoData, itemsPDF, metodoPago, emailCliente)
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="flex h-64 items-center justify-center">
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
          {orders.map((order) => {
            const items = order.pedido_items || order.items || order.detalles || []

            // Cálculos de montos y descuentos para renderizar en la vista
            const total = Number(order.total || 0)
            let subtotalCalculado = items.reduce((acc, item) => {
              const cant = item.cantidad || item.quantity || 1
              const precio = Number(item.precio_unitario || item.price || 0)
              return acc + cant * precio
            }, 0)

            const subtotal = Number(order.subtotal || (subtotalCalculado > 0 ? subtotalCalculado : total))
            const descuento = Number(order.descuento || (subtotal > total ? subtotal - total : 0))
            const porcentaje = subtotal > 0 && descuento > 0 ? Math.round((descuento / subtotal) * 100) : 0

            return (
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
                        <p className="text-sm font-semibold">S/{total.toFixed(2)}</p>
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
                    <div className="space-y-3 border-t pt-3">
                      
                      {/* 📍 Información de Envío y Pago */}
                      <div className="grid gap-2 rounded-lg bg-zinc-50 p-3 text-xs dark:bg-zinc-900 sm:grid-cols-2">
                        <div>
                          <p className="font-semibold uppercase tracking-wider text-muted-foreground">Dirección de Envío</p>
                          <p className="mt-0.5 font-medium">{order.direccion_envio || 'No especificada'}, {order.ciudad_envio || ''}</p>
                          <p className="text-muted-foreground">Destinatario: {order.nombre_envio || 'Cliente'}</p>
                        </div>
                        <div>
                          <p className="font-semibold uppercase tracking-wider text-muted-foreground">Método de Pago</p>
                          <p className="mt-0.5 font-medium text-emerald-500 dark:text-emerald-400">
                            {order.metodo_pago || 'Tarjeta'}
                          </p>
                          {order.telefono_envio && (
                            <p className="text-muted-foreground">Teléfono: {order.telefono_envio}</p>
                          )}
                        </div>
                      </div>

                      {/* Lista de productos */}
                      <div className="space-y-2 pt-1">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Productos</p>
                        {items.map((item, i) => {
                          const cant = item.cantidad || item.quantity || 1
                          const precio = Number(item.precio_unitario || item.price || 0)
                          return (
                            <div key={i} className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">
                                {item.productos?.nombre || item.nombre_producto || item.name || `Producto #${item.id_producto}`}{' '}
                                <span className="text-xs font-medium">x{cant}</span>
                              </span>
                              <span className="font-medium">S/{(precio * cant).toFixed(2)}</span>
                            </div>
                          )
                        })}
                      </div>

                      {/* Resumen de Desglose de Totales y Descuento */}
                      <div className="space-y-1 border-t pt-2 text-sm">
                        {descuento > 0 && (
                          <>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>Subtotal</span>
                              <span>S/{subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs font-medium text-emerald-500">
                              <span className="flex items-center gap-1">
                                <Tag className="h-3 w-3" /> Descuento por Volumen ({porcentaje}%):
                              </span>
                              <span>-S/{descuento.toFixed(2)}</span>
                            </div>
                            <p className="text-[11px] text-emerald-500 text-right italic">
                              ¡Ahorraste S/{descuento.toFixed(2)} en esta compra!
                            </p>
                          </>
                        )}
                        <div className="flex items-center justify-between font-semibold pt-1 border-t border-border/40">
                          <span>Total</span>
                          <span>S/{total.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* 📄 Botón para Descargar Comprobante PDF */}
                      <div className="flex justify-end pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDownloadPDF(order)
                          }}
                          className="flex items-center gap-2 text-xs font-medium"
                        >
                          <FileText className="h-3.5 w-3.5 text-primary" />
                          <Download className="h-3 w-3" />
                          Descargar Comprobante PDF
                        </Button>
                      </div>

                    </div>
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}