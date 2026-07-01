import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  BarChart, Bar, Legend,
} from 'recharts'
import { TrendingUp, DollarSign, Users, AlertTriangle, ShoppingCart, Package } from 'lucide-react'

const TIPO_CAMBIO = 3.75

const salesData = [
  { day: 'Lun', ventas: 15750, proyeccion: 15000 },
  { day: 'Mar', ventas: 14250, proyeccion: 14625 },
  { day: 'Mie', ventas: 19125, proyeccion: 18000 },
  { day: 'Jue', ventas: 17250, proyeccion: 16875 },
  { day: 'Vie', ventas: 22125, proyeccion: 19500 },
  { day: 'Sab', ventas: 23625, proyeccion: 20625 },
  { day: 'Dom', ventas: 18000, proyeccion: 18750 },
]

const categoryData = [
  { name: 'Electrónicos', value: 35 },
  { name: 'Ropa', value: 25 },
  { name: 'Hogar', value: 20 },
  { name: 'Deportes', value: 12 },
  { name: 'Libros', value: 8 },
]

const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#06b6d4', '#10b981']

const orderStatusData = [
  { name: 'Carrito', value: 45 },
  { name: 'Pagado', value: 120 },
  { name: 'Cancelado', value: 15 },
]

const stockAlerts = [
  { product: 'iPhone 15 Pro', stock: 3, category: 'Electrónicos' },
  { product: 'Nike Air Max', stock: 2, category: 'Ropa' },
  { product: 'Samsung TV 55"', stock: 1, category: 'Electrónicos' },
  { product: 'Libro Clean Code', stock: 4, category: 'Libros' },
  { product: 'Set de Sartenes', stock: 2, category: 'Hogar' },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-card p-3 shadow-xl">
        <p className="text-sm font-medium">{label}</p>
        {payload.map((entry, i) => (
          <p key={i} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: S/{entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function DashboardOverview() {
  const [stockAlertsEnabled, setStockAlertsEnabled] = useState(true)

  useEffect(() => {
    setStockAlertsEnabled(localStorage.getItem('notif_stock') !== 'false')
    const handleStorage = () => setStockAlertsEnabled(localStorage.getItem('notif_stock') !== 'false')
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Panel de Resumen</h1>
        <p className="text-sm text-muted-foreground">
          Visión general del rendimiento de tu tienda.
        </p>
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
            <div className="text-3xl font-bold">S/130,125</div>
            <div className="mt-1 flex items-center gap-1 text-xs text-emerald-400">
              <TrendingUp className="h-3 w-3" />
              <span>+12.5% vs semana anterior</span>
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
            <div className="text-3xl font-bold">S/481.88</div>
            <div className="mt-1 flex items-center gap-1 text-xs text-emerald-400">
              <TrendingUp className="h-3 w-3" />
              <span>+5.2% vs mes anterior</span>
            </div>
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
            <div className="text-3xl font-bold">+248</div>
            <div className="mt-1 flex items-center gap-1 text-xs text-emerald-400">
              <TrendingUp className="h-3 w-3" />
              <span>+18.3% este mes</span>
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
                <AreaChart data={salesData}>
                  <defs>
                    <linearGradient id="ventasGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 3.7% 15.9%)" />
                  <XAxis dataKey="day" stroke="hsl(240 5% 64.9%)" fontSize={12} />
                  <YAxis stroke="hsl(240 5% 64.9%)" fontSize={12} />
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
                  {stockAlerts.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3"
                    >
                      <div className="mt-0.5 rounded-full bg-amber-500/20 p-1.5">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.product}</p>
                        <p className="text-xs text-muted-foreground">{item.category}</p>
                      </div>
                      <Badge variant="warning" className="shrink-0">
                        {item.stock} restantes
                      </Badge>
                    </div>
                  ))}
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
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
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
                <BarChart data={orderStatusData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 3.7% 15.9%)" />
                  <XAxis dataKey="name" stroke="hsl(240 5% 64.9%)" fontSize={12} />
                  <YAxis stroke="hsl(240 5% 64.9%)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(240 10% 3.9%)',
                      border: '1px solid hsl(240 3.7% 15.9%)',
                      borderRadius: '8px',
                      color: '#f8fafc',
                    }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {orderStatusData.map((entry, index) => (
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
