import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  AreaChart, Area, PieChart, Pie, Legend,
} from 'recharts'
import {
  TrendingUp, DollarSign, ShoppingCart, CreditCard, Package,
  AlertTriangle, ArrowUpDown, ChevronLeft, ChevronRight,
  Users, BarChart3, PieChart as PieChartIcon, Activity, Download,
} from 'lucide-react'
import API from '@/lib/api'
import DateRangeFilter from '@/components/DateRangeFilter'
import { generarReporteEjecutivoPDF } from '@/lib/reporteEjecutivoPDF'

const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6', '#f97316']

const formatSol = (n) =>
  `S/${Number(n || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export default function AnalystDashboard() {
  const [tab, setTab] = useState('resumen')
  const [kpi, setKpi] = useState(null)
  const [erroresPago, setErroresPago] = useState([])
  const [rotacionStock, setRotacionStock] = useState([])
  const [auditoria, setAuditoria] = useState({ data: [], pagination: { page: 1, totalPages: 1 } })
  const [tendencia, setTendencia] = useState([])
  const [ventasCat, setVentasCat] = useState([])
  const [tendenciaClientes, setTendenciaClientes] = useState([])
  const [metodosPago, setMetodosPago] = useState([])
  const [productosTop, setProductosTop] = useState({ top: [], bottom: [] })
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState(null)

  const fetchData = async (page = 1) => {
    if (!dateRange) return
    setLoading(true)
    const params = { ...dateRange }
    try {
      const [
        kpiRes, errRes, rotRes, audRes,
        tendRes, catRes, cliRes, metRes, topRes,
      ] = await Promise.all([
        API.get('/analista/kpi', { params }),
        API.get('/analista/errores-pago', { params }),
        API.get('/analista/rotacion-stock', { params }),
        API.get('/analista/auditoria-stock', { params: { ...params, page, limit: 15 } }),
        API.get('/analista/tendencia-ventas', { params }),
        API.get('/analista/ventas-por-categoria', { params }),
        API.get('/analista/tendencia-clientes', { params }),
        API.get('/analista/metodos-pago', { params }),
        API.get('/analista/productos-top', { params }),
      ])
      setKpi(kpiRes.data)
      setErroresPago(errRes.data || [])
      setRotacionStock(rotRes.data || [])
      setAuditoria(audRes.data)
      setTendencia(tendRes.data || [])
      setVentasCat(catRes.data || [])
      setTendenciaClientes(cliRes.data || [])
      setMetodosPago(metRes.data || [])
      setProductosTop(topRes.data || { top: [], bottom: [] })
    } catch (err) {
      console.error('Error al cargar datos del analista:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (dateRange) fetchData()
  }, [dateRange]) // eslint-disable-line

  // 📄 Función para gatillar la descarga del Reporte PDF
  const handleExportPDF = () => {
    const totalClientesNuevos = tendenciaClientes.reduce((acc, c) => acc + (c.nuevos || 0), 0)

    generarReporteEjecutivoPDF({
      ventasTotales: kpi?.ingresos_totales || 0,
      ticketPromedio: kpi?.ticket_promedio || 0,
      clientesNuevos: totalClientesNuevos,
      pedidos: tendencia.map((t) => ({
        codigo: `VENTA-${t.fecha}`,
        nombre_envio: 'Ventas Consolidadas',
        fecha: t.fecha,
        estado: 'Pagado',
        total: t.total,
      })),
      topProductos: productosTop.top || [],
      rangoFecha: dateRange?.desde ? `${dateRange.desde} al ${dateRange.hasta}` : 'Mes Actual',
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* CABECERA CON BOTÓN DE EXPORTACIÓN */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Panel de Analista de Negocio</h1>
          <p className="text-sm text-muted-foreground">
            KPIs, tendencias, rotación de stock y análisis de pagos.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <DateRangeFilter onChange={setDateRange} />
          <Button
            onClick={handleExportPDF}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-2 text-xs shadow-md"
          >
            <Download className="h-4 w-4" />
            Exportar Reporte Ejecutivo
          </Button>
        </div>
      </div>

      <KpiCards kpi={kpi} />

      <Tabs value={tab} onValueChange={setTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="resumen">
            <Activity className="mr-1.5 h-4 w-4" />Resumen
          </TabsTrigger>
          <TabsTrigger value="ventas">
            <TrendingUp className="mr-1.5 h-4 w-4" />Ventas
          </TabsTrigger>
          <TabsTrigger value="productos">
            <Package className="mr-1.5 h-4 w-4" />Productos
          </TabsTrigger>
          <TabsTrigger value="pagos">
            <CreditCard className="mr-1.5 h-4 w-4" />Pagos
          </TabsTrigger>
          <TabsTrigger value="clientes">
            <Users className="mr-1.5 h-4 w-4" />Clientes
          </TabsTrigger>
          <TabsTrigger value="auditoria">
            <BarChart3 className="mr-1.5 h-4 w-4" />Auditoría
          </TabsTrigger>
        </TabsList>

        <TabsContent value="resumen" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <SalesTrendChart data={tendencia} />
            <CategorySalesChart data={ventasCat} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <PaymentMethodsChart data={metodosPago} />
            <CustomerGrowthChart data={tendenciaClientes} />
          </div>
        </TabsContent>

        <TabsContent value="ventas" className="space-y-4">
          <SalesTrendChart data={tendencia} />
          <div className="grid gap-4 md:grid-cols-2">
            <CategorySalesChart data={ventasCat} />
            <ChartsSection erroresPago={erroresPago} rotacionStock={rotacionStock} />
          </div>
        </TabsContent>

        <TabsContent value="productos" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <TopProductsChart data={productosTop.top} title="Top 10 Productos por Ingresos" />
            <TopProductsChart data={productosTop.bottom} title="Bottom 10 Productos por Ingresos" reverse />
          </div>
          <StockRotationChart data={rotacionStock} />
        </TabsContent>

        <TabsContent value="pagos" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <PaymentMethodsChart data={metodosPago} />
            <PaymentErrorsChart data={erroresPago} />
          </div>
        </TabsContent>

        <TabsContent value="clientes" className="space-y-4">
          <CustomerGrowthChart data={tendenciaClientes} />
        </TabsContent>

        <TabsContent value="auditoria" className="space-y-4">
          <AuditTable
            data={auditoria.data}
            pagination={auditoria.pagination}
            onPageChange={(p) => fetchData(p)}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function KpiCards({ kpi }) {
  if (!kpi) return null

  const cards = [
    {
      title: 'Ticket Promedio',
      value: formatSol(kpi.ticket_promedio),
      icon: ShoppingCart,
      desc: 'Valor promedio por pedido pagado',
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10',
    },
    {
      title: 'Ingresos Totales (mes)',
      value: formatSol(kpi.ingresos_totales),
      icon: DollarSign,
      desc: 'Suma de pedidos pagados del mes',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
    {
      title: 'Tasa de Conversión',
      value: `${Number(kpi.tasa_conversion || 0).toFixed(1)}%`,
      icon: TrendingUp,
      desc: 'Carritos convertidos en pagos',
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      title: 'Tasa de Rechazo',
      value: `${Number(kpi.tasa_rechazo || 0).toFixed(1)}%`,
      icon: CreditCard,
      desc: 'Pagos rechazados del total',
      color: 'text-rose-400',
      bg: 'bg-rose-500/10',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <Card key={card.title} className="border-border/50 transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
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
  )
}

function SalesTrendChart({ data }) {
  return (
    <Card className="border-border/50 md:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <TrendingUp className="h-4 w-4 text-emerald-400" />
          Tendencia de Ventas (30 días)
        </CardTitle>
        <CardDescription>Ingresos diarios de pedidos pagados</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="tendenciaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis
                dataKey="fecha"
                stroke="var(--color-muted-foreground)"
                fontSize={11}
                tickFormatter={(v) => {
                  const d = new Date(v)
                  return `${d.getDate()}/${d.getMonth() + 1}`
                }}
              />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickFormatter={(v) => `S/${v}`} />
              <Tooltip
                contentStyle={{ background: 'var(--color-muted)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-foreground)' }}
                formatter={(value) => [formatSol(value), 'Ingresos']}
                labelFormatter={(label) => new Date(label).toLocaleDateString('es-PE')}
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke="#6366f1"
                strokeWidth={2}
                fill="url(#tendenciaGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

function CategorySalesChart({ data }) {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <PieChartIcon className="h-4 w-4 text-indigo-400" />
          Ventas por Categoría
        </CardTitle>
        <CardDescription>Distribución de ingresos</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="ingresos"
                nameKey="categoria"
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [formatSol(value), 'Ingresos']} />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(v) => <span className="text-xs text-muted-foreground">{v}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        {data.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">Sin datos de ventas por categoría.</p>
        )}
      </CardContent>
    </Card>
  )
}

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
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="total"
                nameKey="metodo"
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
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
                <span className="text-muted-foreground w-10 text-right">
                  {totalMonto > 0 ? ((m.total / totalMonto) * 100).toFixed(0) : 0}%
                </span>
              </div>
            </div>
          ))}
        </div>
        {data.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">Sin datos de pagos.</p>
        )}
      </CardContent>
    </Card>
  )
}

function CustomerGrowthChart({ data }) {
  const total = data.reduce((s, d) => s + d.nuevos, 0)
  const promedio = data.length > 0 ? (total / data.length).toFixed(1) : 0

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Users className="h-4 w-4 text-emerald-400" />
          Crecimiento de Clientes
        </CardTitle>
        <CardDescription>
          <span className="font-semibold text-foreground">+{total}</span> nuevos este mes &middot; ~{promedio}/día
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="clientesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis
                dataKey="fecha"
                stroke="var(--color-muted-foreground)"
                fontSize={10}
                tickFormatter={(v) => {
                  const d = new Date(v)
                  return `${d.getDate()}/${d.getMonth() + 1}`
                }}
              />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={12} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: 'var(--color-muted)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-foreground)' }}
                formatter={(value) => [`${value} nuevos`, 'Registros']}
                labelFormatter={(label) => new Date(label).toLocaleDateString('es-PE')}
              />
              <Area
                type="monotone"
                dataKey="nuevos"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#clientesGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

function TopProductsChart({ data, title, reverse }) {
  const sorted = [...data].sort((a, b) => reverse ? a.ingresos - b.ingresos : b.ingresos - a.ingresos)

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Package className={`h-4 w-4 ${reverse ? 'text-rose-400' : 'text-emerald-400'}`} />
          {title}
        </CardTitle>
        <CardDescription>Por ingresos generados</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sorted}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
              <XAxis type="number" stroke="var(--color-muted-foreground)" fontSize={11} tickFormatter={(v) => `S/${v}`} />
              <YAxis
                type="category"
                dataKey="nombre"
                stroke="var(--color-muted-foreground)"
                fontSize={10}
                width={120}
                tickFormatter={(val) => val.length > 15 ? val.slice(0, 15) + '...' : val}
              />
              <Tooltip
                contentStyle={{ background: 'var(--color-muted)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-foreground)' }}
                formatter={(value) => [formatSol(value), 'Ingresos']}
              />
              <Bar dataKey="ingresos" radius={[0, 6, 6, 0]} fill={reverse ? '#f43f5e' : '#10b981'}>
                {sorted.map((_, i) => (
                  <Cell key={i} fill={reverse ? '#f43f5e' : COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        {data.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">Sin datos de productos.</p>
        )}
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
              <YAxis
                type="category"
                dataKey="mensaje_error"
                stroke="var(--color-muted-foreground)"
                fontSize={11}
                width={140}
                tickFormatter={(val) => val.length > 20 ? val.slice(0, 20) + '...' : val}
              />
              <Tooltip
                contentStyle={{ background: 'var(--color-muted)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-foreground)' }}
                formatter={(value) => [`${value} fallos`, 'Total']}
              />
              <Bar dataKey="total_fallidos" radius={[0, 6, 6, 0]}>
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        {data.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">No hay errores de pago registrados.</p>
        )}
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
              <XAxis
                dataKey="producto"
                stroke="var(--color-muted-foreground)"
                fontSize={10}
                angle={-35}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
              <Tooltip
                contentStyle={{ background: 'var(--color-muted)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-foreground)' }}
              />
              <Bar dataKey="unidades_vendidas" name="Vendidas" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="unidades_repuestas" name="Repuestas" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {data.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">Sin datos de rotación de stock.</p>
        )}
      </CardContent>
    </Card>
  )
}

function ChartsSection({ erroresPago, rotacionStock }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <PaymentErrorsChart data={erroresPago} />
      <StockRotationChart data={rotacionStock} />
    </div>
  )
}

function AuditTable({ data, pagination, onPageChange }) {
  const getCambioColor = (cambio) => {
    if (cambio > 0) return 'text-emerald-400'
    if (cambio < 0) return 'text-rose-400'
    return 'text-muted-foreground'
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-sm font-medium">Auditoría de Inventario</CardTitle>
          <CardDescription>Últimos movimientos de stock registrados</CardDescription>
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
                    No hay movimientos de stock registrados.
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
              <Button variant="outline" size="sm" disabled={pagination.page <= 1} onClick={() => onPageChange(pagination.page - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" disabled={pagination.page >= pagination.totalPages} onClick={() => onPageChange(pagination.page + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}