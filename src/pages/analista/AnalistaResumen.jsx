import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ShoppingCart, DollarSign, TrendingUp, CreditCard } from 'lucide-react'
import API from '@/lib/api'
import DateRangeFilter from '@/components/DateRangeFilter'

const formatSol = (n) =>
  `S/${Number(n).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export default function AnalistaResumen() {
  const [kpi, setKpi] = useState(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState(null)

  useEffect(() => {
    if (!dateRange) return
    setLoading(true)
    API.get('/analista/kpi', { params: dateRange })
      .then((r) => setKpi(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [dateRange])

  const cards = kpi ? [
    { title: 'Ticket Promedio', value: formatSol(kpi.ticket_promedio), icon: ShoppingCart, desc: 'Valor promedio por pedido pagado', color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { title: 'Ingresos Totales', value: formatSol(kpi.ingresos_totales), icon: DollarSign, desc: 'Suma de pedidos pagados en el período', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { title: 'Tasa de Conversión', value: `${Number(kpi.tasa_conversion).toFixed(1)}%`, icon: TrendingUp, desc: 'Carritos convertidos en pagos', color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { title: 'Tasa de Rechazo', value: `${Number(kpi.tasa_rechazo).toFixed(1)}%`, icon: CreditCard, desc: 'Pagos rechazados del total', color: 'text-rose-400', bg: 'bg-rose-500/10' },
  ] : []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Resumen de Negocio</h1>
          <p className="text-sm text-muted-foreground">KPIs principales del período seleccionado.</p>
        </div>
        <DateRangeFilter onChange={setDateRange} />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => {
            const Icon = card.icon
            return (
              <Card key={card.title} className="border-border/50 transition-all hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
                  <div className={`rounded-lg p-2 ${card.bg}`}>
                    <Icon className={`h-4 w-4 ${card.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{card.value}</div>
                  <p className="mt-1 text-xs text-muted-foreground">{card.desc}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
