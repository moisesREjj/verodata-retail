import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { TrendingUp, PieChart as PieChartIcon } from 'lucide-react'
import API from '@/lib/api'
import DateRangeFilter from '@/components/DateRangeFilter'

const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6', '#f97316']

const formatSol = (n) =>
  `S/${Number(n).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export default function Ventas() {
  const [tendencia, setTendencia] = useState([])
  const [ventasCat, setVentasCat] = useState([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState(null)

  useEffect(() => {
    if (!dateRange) return
    setLoading(true)
    Promise.all([
      API.get('/analista/tendencia-ventas', { params: dateRange }),
      API.get('/analista/ventas-por-categoria', { params: dateRange }),
    ])
      .then(([t, c]) => { setTendencia(t.data || []); setVentasCat(c.data || []) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [dateRange])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-bold tracking-tight">Ventas</h1><p className="text-sm text-muted-foreground">Tendencia y distribución de ingresos.</p></div>
          <DateRangeFilter onChange={setDateRange} />
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
          <h1 className="text-2xl font-bold tracking-tight">Ventas</h1>
          <p className="text-sm text-muted-foreground">Tendencia y distribución de ingresos.</p>
        </div>
        <DateRangeFilter onChange={setDateRange} />
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            Tendencia de Ventas
          </CardTitle>
          <CardDescription>Ingresos diarios de pedidos pagados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={tendencia}>
                <defs>
                  <linearGradient id="ventasGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="fecha" stroke="var(--color-muted-foreground)" fontSize={11} tickFormatter={(v) => { const d = new Date(v); return `${d.getDate()}/${d.getMonth() + 1}` }} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickFormatter={(v) => `S/${v}`} />
                <Tooltip contentStyle={{ background: 'var(--color-muted)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-foreground)' }} formatter={(value) => [formatSol(value), 'Ingresos']} labelFormatter={(label) => new Date(label).toLocaleDateString('es-PE')} />
                <Area type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={2} fill="url(#ventasGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <PieChartIcon className="h-4 w-4 text-indigo-400" />
            Ventas por Categoría
          </CardTitle>
          <CardDescription>Distribución de ingresos por categoría</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={ventasCat} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="ingresos" nameKey="categoria">
                  {ventasCat.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(value) => [formatSol(value), 'Ingresos']} />
                <Legend verticalAlign="bottom" height={36} formatter={(v) => <span className="text-xs text-muted-foreground">{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {ventasCat.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Sin datos en el período seleccionado.</p>}
        </CardContent>
      </Card>
    </div>
  )
}
