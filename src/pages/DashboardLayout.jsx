import { useState } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Store,
  Bell,
  AlertTriangle,
  UserPlus,
  ShoppingBag,
  X,
} from 'lucide-react'

const notifications = [
  { id: 1, icon: AlertTriangle, text: 'iPhone 15 Pro con stock crítico (3 restantes)', time: 'Hace 5 min', bg: 'bg-amber-500/20', iconColor: 'text-amber-400' },
  { id: 2, icon: UserPlus, text: 'Nuevo usuario registrado: María García', time: 'Hace 1 hora', bg: 'bg-emerald-500/20', iconColor: 'text-emerald-400' },
  { id: 3, icon: ShoppingBag, text: 'Pedido ORD-004 pagado - S/480.00', time: 'Hace 2 horas', bg: 'bg-blue-500/20', iconColor: 'text-blue-400' },
  { id: 4, icon: AlertTriangle, text: 'Samsung TV 55" sin stock', time: 'Hace 3 horas', bg: 'bg-amber-500/20', iconColor: 'text-amber-400' },
  { id: 5, icon: UserPlus, text: 'Nuevo usuario registrado: Pedro Martínez', time: 'Hace 1 día', bg: 'bg-emerald-500/20', iconColor: 'text-emerald-400' },
]

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Resumen', end: true },
  { to: '/dashboard/usuarios', icon: Users, label: 'Usuarios' },
  { to: '/dashboard/ajustes', icon: Settings, label: 'Ajustes' },
]

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const { user, logout } = useAuth()

  const initials = user?.nombre
    ? user.nombre.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'AD'

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside
        className={`relative flex flex-col border-r bg-card transition-all duration-300 ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        <div className="flex h-14 items-center gap-3 border-b px-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary shadow-sm">
            <Store className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="text-sm font-semibold tracking-tight">VeroData Retail</span>
          )}
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                } ${collapsed ? 'justify-center px-2' : ''}`
              }
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <Separator />

        <div className="p-3">
          <Button
            variant="ghost"
            className={`w-full justify-start gap-3 text-muted-foreground hover:text-destructive ${
              collapsed ? 'justify-center px-2' : ''
            }`}
            onClick={logout}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Cerrar Sesión</span>}
          </Button>
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border bg-card shadow-sm hover:bg-accent"
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center justify-between border-b bg-card px-6">
          <div />
          <div className="flex items-center gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <button className="relative rounded-full p-2 text-muted-foreground hover:bg-accent hover:text-foreground">
                  <Bell className="h-5 w-5" />
                  <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between border-b px-4 py-3">
                  <span className="text-sm font-semibold">Notificaciones</span>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    {notifications.length}
                  </span>
                </div>
                <ScrollArea className="max-h-72">
                  {notifications.map((n) => (
                    <div key={n.id} className="flex gap-3 border-b px-4 py-3 last:border-0 hover:bg-muted/50 transition-colors">
                      <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${n.bg}`}>
                        <n.icon className={`h-3.5 w-3.5 ${n.iconColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-foreground">{n.text}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{n.time}</p>
                      </div>
                    </div>
                  ))}
                </ScrollArea>
              </PopoverContent>
            </Popover>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium leading-none">{user?.nombre || 'Admin'}</p>
                <p className="text-xs text-muted-foreground">
                  {user?.rol === 'ROLE_ADMIN' ? 'Administrador' : user?.rol}
                </p>
              </div>
              <Avatar className="h-8 w-8 border">
                <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
