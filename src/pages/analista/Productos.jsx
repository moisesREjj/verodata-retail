import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Package, ArrowUpDown } from 'lucide-react'
import API from '@/lib/api'
import DateRangeFilter from '@/components/DateRangeFilter'

const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6', '#f97316']

const formatSol = (n) =>
  `S/${Number(n).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

function TopProductsChart({ data, title, iconColor }) {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Package className={`h-4 w-4 ${iconColor}`} />
          {title}
        </CardTitle>
        <CardDescription>Por ingresos generados</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
              <XAxis type="number" stroke="var(--color-muted-foreground)" fontSize={11} tickFormatter={(v) => `S/${v}`} />
              <YAxis type="category" dataKey="nombre" stroke="var(--color-muted-foreground)" fontSize={10} width={120} tickFormatter={(val) => val.length > 15 ? val.slice(0, 15) + '...' : val} />
              <Tooltip contentStyle={{ background: 'var(--color-muted)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-foreground)' }} formatter={(value) => [formatSol(value), 'Ingresos']} />
              <Bar dataKey="ingresos" radius={[0, 6, 6, 0]}>
                {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        {data.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Sin datos en el período.</p>}
      </CardContent>
    </Card>
  )
}

function StockRotationChart({ data }) {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <ArrowUpDown className="h-4 w-4 text-indigo-400" />
          Rotación de Stock
        </CardTitle>
        <CardDescription>Velocidad de ventas por producto</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.slice(0, 10)} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="producto" stroke="var(--color-muted-foreground)" fontSize={10} angle={-35} textAnchor="end" height={80} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
              <Tooltip contentStyle={{ background: 'var(--color-muted)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-foreground)' }} />
              <Bar dataKey="unidades_vendidas" name="Vendidas" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="unidades_repuestas" name="Repuestas" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {data.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Sin datos en el período.</p>}
      </CardContent>
    </Card>
  )
}

export default function Productos() {
  const [productosTop, setProductosTop] = useState({ top: [], bottom: [] })
  const [rotacionStock, setRotacionStock] = useState([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState(null)

  useEffect(() => {
    if (!dateRange) return
    setLoading(true)
    Promise.all([
      API.get('/analista/productos-top', { params: dateRange }),
      API.get('/analista/rotacion-stock', { params: dateRange }),
    ])
      .then(([t, r]) => { setProductosTop(t.data || { top: [], bottom: [] }); setRotacionStock(r.data || []) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [dateRange])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-bold tracking-tight">Productos</h1><p className="text-sm text-muted-foreground">Rendimiento y rotación de productos.</p></div>
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
          <h1 className="text-2xl font-bold tracking-tight">Productos</h1>
          <p className="text-sm text-muted-foreground">Rendimiento y rotación de productos.</p>
        </div>
        <DateRangeFilter onChange={setDateRange} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <TopProductsChart data={productosTop.top} title="Top 10 Productos" iconColor="text-emerald-400" />
        <TopProductsChart data={productosTop.bottom} title="Bottom 10 Productos" iconColor="text-rose-400" />
      </div>

      <StockRotationChart data={rotacionStock} />
    </div>
  )
}
