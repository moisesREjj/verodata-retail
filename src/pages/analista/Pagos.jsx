import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts'
import { CreditCard, AlertTriangle } from 'lucide-react'
import API from '@/lib/api'
import DateRangeFilter from '@/components/DateRangeFilter'

const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899']

const formatSol = (n) =>
  `S/${Number(n).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

function PaymentMethodsChart({ data }) {
  const totalMonto = data.reduce((s, m) => s + m.total, 0)
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <CreditCard className="h-4 w-4 text-blue-400" />
          Métodos de Pago
        </CardTitle>
        <CardDescription>Distribución por método</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" outerRadius={80} dataKey="total" nameKey="metodo">
                {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(value) => [formatSol(value), 'Total']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-1.5">
          {data.map((m, i) => (
            <div key={m.metodo} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-muted-foreground">{m.metodo}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-medium">{formatSol(m.total)}</span>
                <span className="text-muted-foreground w-10 text-right">{totalMonto > 0 ? ((m.total / totalMonto) * 100).toFixed(0) : 0}%</span>
                <span className="text-muted-foreground">({m.cantidad} ops)</span>
              </div>
            </div>
          ))}
        </div>
        {data.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Sin pagos en el período.</p>}
      </CardContent>
    </Card>
  )
}

function PaymentErrorsChart({ data }) {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <AlertTriangle className="h-4 w-4 text-rose-400" />
          Errores de Pago
        </CardTitle>
        <CardDescription>Fallos registrados en la pasarela</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
              <XAxis type="number" stroke="var(--color-muted-foreground)" fontSize={12} />
              <YAxis type="category" dataKey="mensaje_error" stroke="var(--color-muted-foreground)" fontSize={11} width={140} tickFormatter={(val) => val.length > 20 ? val.slice(0, 20) + '...' : val} />
              <Tooltip contentStyle={{ background: 'var(--color-muted)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-foreground)' }} formatter={(value) => [`${value} fallos`, 'Total']} />
              <Bar dataKey="total_fallidos" radius={[0, 6, 6, 0]}>
                {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        {data.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Sin errores en el período.</p>}
      </CardContent>
    </Card>
  )
}

export default function Pagos() {
  const [metodosPago, setMetodosPago] = useState([])
  const [erroresPago, setErroresPago] = useState([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState(null)

  useEffect(() => {
    if (!dateRange) return
    setLoading(true)
    Promise.all([
      API.get('/analista/metodos-pago', { params: dateRange }),
      API.get('/analista/errores-pago', { params: dateRange }),
    ])
      .then(([m, e]) => { setMetodosPago(m.data || []); setErroresPago(e.data || []) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [dateRange])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-bold tracking-tight">Pagos</h1><p className="text-sm text-muted-foreground">Métodos de pago y errores.</p></div>
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
          <h1 className="text-2xl font-bold tracking-tight">Pagos</h1>
          <p className="text-sm text-muted-foreground">Métodos de pago y errores.</p>
        </div>
        <DateRangeFilter onChange={setDateRange} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <PaymentMethodsChart data={metodosPago} />
        <PaymentErrorsChart data={erroresPago} />
      </div>
    </div>
  )
}
