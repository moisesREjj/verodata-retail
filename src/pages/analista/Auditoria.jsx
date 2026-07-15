import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import API from '@/lib/api'
import DateRangeFilter from '@/components/DateRangeFilter'

export default function Auditoria() {
  const [auditoria, setAuditoria] = useState({ data: [], pagination: { page: 1, totalPages: 1, total: 0 } })
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState(null)
  const [page, setPage] = useState(1)

  useEffect(() => {
    if (!dateRange) return
    setLoading(true)
    API.get('/analista/auditoria-stock', { params: { ...dateRange, page, limit: 15 } })
      .then((r) => setAuditoria(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [dateRange, page])

  const getCambioColor = (cambio) => {
    if (cambio > 0) return 'text-emerald-400'
    if (cambio < 0) return 'text-rose-400'
    return 'text-muted-foreground'
  }

  const { data, pagination } = auditoria

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-bold tracking-tight">Auditoría de Stock</h1><p className="text-sm text-muted-foreground">Movimientos de inventario registrados.</p></div>
          <DateRangeFilter onChange={(r) => { setDateRange(r); setPage(1) }} />
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Auditoría de Stock</h1>
          <p className="text-sm text-muted-foreground">Movimientos de inventario registrados.</p>
        </div>
        <DateRangeFilter onChange={(r) => { setDateRange(r); setPage(1) }} />
      </div>

      <Card className="border-border/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-medium">Movimientos de Inventario</CardTitle>
            <CardDescription>Últimos cambios de stock registrados</CardDescription>
          </div>
          <Badge variant="outline" className="text-xs">{pagination.total} registros</Badge>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <th className="pb-3 pr-4">Producto</th>
                  <th className="pb-3 pr-4">Stock Anterior</th>
                  <th className="pb-3 pr-4">Stock Nuevo</th>
                  <th className="pb-3 pr-4">Cambio</th>
                  <th className="pb-3 pr-4">Motivo</th>
                  <th className="pb-3 text-right">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item) => (
                  <tr key={item.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="py-3 pr-4 font-medium">{item.productos?.nombre || `ID: ${item.id_producto}`}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{item.cantidad_anterior}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{item.cantidad_nueva}</td>
                    <td className={`py-3 pr-4 font-semibold ${getCambioColor(item.cantidad_cambio)}`}>
                      {item.cantidad_cambio > 0 ? '+' : ''}{item.cantidad_cambio}
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground max-w-[200px] truncate" title={item.motivo}>
                      {item.motivo}
                    </td>
                    <td className="py-3 text-right text-muted-foreground whitespace-nowrap">
                      {new Date(item.created_at).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
                {data.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                      No hay movimientos en el período seleccionado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-xs text-muted-foreground">
                Página {pagination.page} de {pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" disabled={page >= pagination.totalPages} onClick={() => setPage(page + 1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
