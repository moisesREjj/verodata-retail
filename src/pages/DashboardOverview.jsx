import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  BarChart, Bar, Legend,
} from 'recharts'
import { TrendingUp, DollarSign, Users, AlertTriangle, ShoppingCart, Download } from 'lucide-react'
import API from '@/lib/api'
import { generarReporteEjecutivoPDF } from '@/lib/reporteEjecutivoPDF'

const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#06b6d4', '#10b981', '#f59e0b', '#ef4444']

const diasSemana = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab']

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-card p-3 shadow-xl">
        <p className="text-sm font-medium">{label}</p>
        {payload.map((entry, i) => (
          <p key={i} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: S/{entry.value?.toLocaleString()}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function DashboardOverview() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [stockAlertsEnabled, setStockAlertsEnabled] = useState(true)

  useEffect(() => {
    setStockAlertsEnabled(localStorage.getItem('notif_stock') !== 'false')
    const handleStorage = () => setStockAlertsEnabled(localStorage.getItem('notif_stock') !== 'false')
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  useEffect(() => {
    API.get('/dashboard/resumen')
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // 📄 Función para gatillar la descarga del Reporte PDF con los datos reales del Overview
  const handleExportPDF = () => {
    if (!data) return

    generarReporteEjecutivoPDF({
      ventasTotales: data.ventas_totales || 0,
      ticketPromedio: data.ticket_promedio || 0,
      clientesNuevos: data.clientes_nuevos || 0,
      pedidos: Array.isArray(data.ventas_diarias)
        ? data.ventas_diarias.map((d) => ({
            codigo: `VENTA-${d.fecha}`,
            nombre_envio: 'Ventas Diarias',
            fecha: d.fecha,
            estado: 'Pagado',
            total: d.total,
          }))
        : [],
      topProductos: Array.isArray(data.categorias_mas_vendidas)
        ? data.categorias_mas_vendidas.map((c) => ({
            nombre: c.nombre,
            ingresos: c.unidades * 100, // Estimación o unidades mapeadas
          }))
        : [],
      rangoFecha: 'Último Mes',
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Error al cargar datos del dashboard
      </div>
    )
  }

  const ventasDiarias = data.ventas_diarias?.map((d) => ({
    day: diasSemana[new Date(d.fecha).getDay()],
    ventas: d.total,
    proyeccion: d.proyeccion,
  })) || []

  return (
    <div className="space-y-6">
      {/* CABECERA CON EL BOTÓN DE EXPORTACIÓN */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Panel de Resumen</h1>
          <p className="text-sm text-muted-foreground">
            Visión general del rendimiento de tu tienda.
          </p>
        </div>

        <Button
          onClick={handleExportPDF}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-2 text-xs shadow-md"
        >
          <Download className="h-4 w-4" />
          Exportar Reporte Ejecutivo
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/50 transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ventas Totales
            </CardTitle>
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">S/{data.ventas_totales?.toLocaleString()}</div>
            <div className={`mt-1 flex items-center gap-1 text-xs ${data.variacion_ventas >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              <TrendingUp className={`h-3 w-3 ${data.variacion_ventas < 0 ? 'rotate-180' : ''}`} />
              <span>{data.variacion_ventas >= 0 ? '+' : ''}{data.variacion_ventas?.toFixed(1)}% vs mes anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ticket Promedio
            </CardTitle>
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <ShoppingCart className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">S/{data.ticket_promedio?.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card className="border-border/50 transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Clientes Nuevos
            </CardTitle>
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">+{data.clientes_nuevos}</div>
            <div className={`mt-1 flex items-center gap-1 text-xs ${data.variacion_clientes >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              <TrendingUp className={`h-3 w-3 ${data.variacion_clientes < 0 ? 'rotate-180' : ''}`} />
              <span>{data.variacion_clientes >= 0 ? '+' : ''}{data.variacion_clientes?.toFixed(1)}% vs mes anterior</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/50 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Ventas Diarias vs Proyección</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={ventasDiarias}>
                  <defs>
                    <linearGradient id="ventasGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="ventas"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#ventasGradient)"
                  />
                  <Area
                    type="monotone"
                    dataKey="proyeccion"
                    stroke="#a855f7"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    fillOpacity={0}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {stockAlertsEnabled && (
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Alertas de Stock Crítico</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-3">
                  {data.alertas_stock?.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No hay alertas de stock</p>
                  ) : (
                    data.alertas_stock?.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3"
                      >
                        <div className="mt-0.5 rounded-full bg-amber-500/20 p-1.5">
                          <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.nombre}</p>
                          <p className="text-xs text-muted-foreground capitalize">{item.nivel?.replace('_', ' ')}</p>
                        </div>
                        <Badge variant="warning" className="shrink-0">
                          {item.stock} restantes
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Categorías Más Vendidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.categorias_mas_vendidas}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="unidades"
                    nameKey="nombre"
                  >
                    {(data.categorias_mas_vendidas || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => (
                      <span className="text-xs text-muted-foreground">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Pedidos por Estado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.pedidos_por_estado}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="estado" stroke="var(--color-muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--color-muted)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '8px',
                      color: 'var(--color-foreground)',
                    }}
                  />
                  <Bar dataKey="cantidad" radius={[6, 6, 0, 0]}>
                    {(data.pedidos_por_estado || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}