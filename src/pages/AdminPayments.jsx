import { useState, useEffect, useCallback } from 'react'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import API from '@/lib/api'
import { RefreshCw, Wallet, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

const ESTADOS_PAGO = {
  Aprobado: { label: 'Aprobado', color: 'bg-emerald-500/20 text-emerald-400' },
  Fallido: { label: 'Fallido', color: 'bg-red-500/20 text-red-400' },
  Pendiente: { label: 'Pendiente', color: 'bg-amber-500/20 text-amber-400' },
  Reembolsado: { label: 'Reembolsado', color: 'bg-blue-500/20 text-blue-400' },
}

const METODOS = ['Tarjeta', 'Yape', 'Plin', 'PagoEfectivo', 'Transferencia']

export default function AdminPayments() {
  const [payments, setPayments] = useState([])
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 })
  const [loading, setLoading] = useState(true)
  const [estadoFilter, setEstadoFilter] = useState('')
  const [metodoFilter, setMetodoFilter] = useState('')
  const [search, setSearch] = useState('')

  const fetchPayments = useCallback(async (page = 1) => {
    try {
      const params = { page, limit: 20 }
      if (estadoFilter) params.estado = estadoFilter
      if (metodoFilter) params.metodo_pago = metodoFilter
      const res = await API.get('/pagos', { params })
      setPayments(res.data.data)
      setPagination(res.data.pagination)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [estadoFilter, metodoFilter])

  useEffect(() => { fetchPayments() }, [fetchPayments])

  const filtered = payments.filter((p) => {
    const busqueda = search.toLowerCase()
    return (
      !busqueda ||
      p.transaccion_id?.toLowerCase().includes(busqueda) ||
      p.pedidos?.codigo?.toLowerCase().includes(busqueda) ||
      p.pedidos?.usuarios?.nombre?.toLowerCase().includes(busqueda) ||
      p.pedidos?.usuarios?.email?.toLowerCase().includes(busqueda)
    )
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Historial de Pagos</h1>
          <p className="text-sm text-muted-foreground">
            Visualiza todos los pagos procesados en la plataforma.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => fetchPayments()} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por transacción, orden o cliente..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 max-w-sm"
              />
            </div>
            <Select value={estadoFilter} onValueChange={setEstadoFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=" ">Todos</SelectItem>
                {Object.entries(ESTADOS_PAGO).map(([key, val]) => (
                  <SelectItem key={key} value={key}>{val.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={metodoFilter} onValueChange={setMetodoFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Método" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=" ">Todos</SelectItem>
                {METODOS.map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transacción</TableHead>
                <TableHead>Orden</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Método</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">Cargando pagos...</TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">No se encontraron pagos.</TableCell>
                </TableRow>
              ) : (
                filtered.map((p) => {
                  const estadoStyle = ESTADOS_PAGO[p.estado] || { label: p.estado, color: 'bg-zinc-500/20 text-zinc-400' }
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono text-xs">{p.transaccion_id || '-'}</TableCell>
                      <TableCell className="font-mono text-xs">{p.pedidos?.codigo}</TableCell>
                      <TableCell>
                        <p className="text-sm font-medium">{p.pedidos?.usuarios?.nombre}</p>
                        <p className="text-xs text-muted-foreground">{p.pedidos?.usuarios?.email}</p>
                      </TableCell>
                      <TableCell className="font-mono">S/ {Number(p.monto).toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{p.metodo_pago}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={estadoStyle.color}>{estadoStyle.label}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(p.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                Mostrando página {pagination.page} de {pagination.totalPages} ({pagination.total} registros)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() => fetchPayments(pagination.page - 1)}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => fetchPayments(pagination.page + 1)}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
