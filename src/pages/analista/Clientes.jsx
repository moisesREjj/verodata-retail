import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Users } from 'lucide-react'
import API from '@/lib/api'
import DateRangeFilter from '@/components/DateRangeFilter'

export default function Clientes() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState(null)

  useEffect(() => {
    if (!dateRange) return
    setLoading(true)
    API.get('/analista/tendencia-clientes', { params: dateRange })
      .then((r) => setData(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [dateRange])

  const total = data.reduce((s, d) => s + d.nuevos, 0)
  const promedio = data.length > 0 ? (total / data.length).toFixed(1) : 0

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-bold tracking-tight">Clientes</h1><p className="text-sm text-muted-foreground">Crecimiento y registros de nuevos usuarios.</p></div>
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
          <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
          <p className="text-sm text-muted-foreground">Crecimiento y registros de nuevos usuarios.</p>
        </div>
        <DateRangeFilter onChange={setDateRange} />
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Users className="h-4 w-4 text-emerald-400" />
            Crecimiento de Clientes
          </CardTitle>
          <CardDescription>
            <span className="font-semibold text-foreground">+{total}</span> nuevos en el período &middot; ~{promedio}/día
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="clientesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="fecha" stroke="var(--color-muted-foreground)" fontSize={10} tickFormatter={(v) => { const d = new Date(v); return `${d.getDate()}/${d.getMonth() + 1}` }} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} allowDecimals={false} />
                <Tooltip contentStyle={{ background: 'var(--color-muted)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-foreground)' }} formatter={(value) => [`${value} nuevos`, 'Registros']} labelFormatter={(label) => new Date(label).toLocaleDateString('es-PE')} />
                <Area type="monotone" dataKey="nuevos" stroke="#10b981" strokeWidth={2} fill="url(#clientesGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
