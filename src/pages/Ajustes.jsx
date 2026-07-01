import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Bell, Palette } from 'lucide-react'

export default function Ajustes() {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') !== 'light')
  const [stockAlerts, setStockAlerts] = useState(() => localStorage.getItem('notif_stock') !== 'false')
  const [newUsers, setNewUsers] = useState(() => localStorage.getItem('notif_users') === 'true')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  useEffect(() => {
    localStorage.setItem('notif_stock', stockAlerts)
  }, [stockAlerts])

  useEffect(() => {
    localStorage.setItem('notif_users', newUsers)
  }, [newUsers])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Ajustes</h1>
        <p className="text-sm text-muted-foreground">
          Configura las preferencias del sistema.
        </p>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Palette className="h-4 w-4" />
            Apariencia
          </CardTitle>
          <CardDescription>Personaliza la apariencia del dashboard.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="dark-mode" className="text-sm font-medium">Modo Oscuro</Label>
              <p className="text-xs text-muted-foreground">Alterna entre modo claro y oscuro.</p>
            </div>
            <Switch id="dark-mode" checked={darkMode} onCheckedChange={setDarkMode} />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="h-4 w-4" />
            Notificaciones
          </CardTitle>
          <CardDescription>Gestiona las notificaciones del sistema.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notif-stock" className="text-sm font-medium">Alertas de Stock</Label>
              <p className="text-xs text-muted-foreground">Recibe alertas cuando el stock sea crítico.</p>
            </div>
            <Switch id="notif-stock" checked={stockAlerts} onCheckedChange={setStockAlerts} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notif-users" className="text-sm font-medium">Nuevos Usuarios</Label>
              <p className="text-xs text-muted-foreground">Notifica cuando se registre un nuevo usuario.</p>
            </div>
            <Switch id="notif-users" checked={newUsers} onCheckedChange={setNewUsers} />
          </div>
        </CardContent>
      </Card>

    </div>
  )
}
