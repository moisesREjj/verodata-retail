import { useState, useEffect, useCallback } from 'react'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import API from '@/lib/api'
import { Plus, Pencil, Trash2, Search, RefreshCw, UserCircle, Eye, EyeOff, Filter } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')

  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)

  const [showPassword, setShowPassword] = useState(false)
  
  const [createForm, setCreateForm] = useState({ nombre: '', email: '', password: '', rol: 'ROLE_CLIENTE' })
  const [editForm, setEditForm] = useState({ nombre: '', email: '' })

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      const res = await API.get('/auth/usuarios')
      setUsers(res.data)
    } catch (err) {
      console.error("Error al obtener usuarios:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // Helper para interpretar el rol dinámicamente desde cualquier estructura que devuelva el Backend
  const getRoleInfo = (user) => {
    const rawRole = user.id_rol ?? user.rol?.id ?? user.rol?.nombre ?? user.rol
    const roleStr = String(rawRole || '').toUpperCase()

    if (roleStr === '1' || roleStr.includes('ADMIN')) {
      return { code: 'ROLE_ADMIN', label: 'Administrador', badgeVariant: 'default' }
    }
    if (roleStr === '3' || roleStr.includes('ANALISTA')) {
      return { code: 'ROLE_ANALISTA', label: 'Analista', badgeVariant: 'outline' }
    }
    return { code: 'ROLE_CLIENTE', label: 'Cliente', badgeVariant: 'secondary' }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      const rolMapping = {
        'ROLE_ADMIN': 1,
        'ROLE_CLIENTE': 2,
        'ROLE_ANALISTA': 3
      }

      const datosRegistro = {
        nombre: createForm.nombre,
        email: createForm.email,
        password: createForm.password,
        id_rol: rolMapping[createForm.rol] || 2
      }

      await API.post('/auth/registrar', datosRegistro)
      
      setCreateOpen(false)
      setCreateForm({ nombre: '', email: '', password: '', rol: 'ROLE_CLIENTE' })
      fetchUsers()
      alert("¡Usuario creado con éxito!")
    } catch (err) {
      console.error("Error al registrar:", err)
      const mensajeError = err.response?.data?.mensaje || err.response?.data?.error || "Error al registrar usuario."
      alert(`No se pudo crear el usuario: ${mensajeError}`)
    }
  }

  const handleEdit = async (e) => {
    e.preventDefault()
    if (!selectedUser) return
    try {
      await API.put(`/auth/usuarios/${selectedUser.id}`, editForm)
      setEditOpen(false)
      setSelectedUser(null)
      fetchUsers()
    } catch (err) {
      console.error(err)
      alert("Error al editar usuario.")
    }
  }

  const handleDelete = async () => {
    if (!selectedUser) return
    try {
      await API.delete(`/auth/usuarios/${selectedUser.id}`)
      setDeleteOpen(false)
      setSelectedUser(null)
      fetchUsers()
      alert("Usuario eliminado correctamente.")
    } catch (err) {
      console.error("Error al eliminar usuario:", err)
      setDeleteOpen(false)
      
      const status = err.response?.status
      const msg = err.response?.data?.mensaje || err.response?.data?.error

      if (status === 400 || status === 409 || status === 500) {
        alert(`No se puede eliminar a "${selectedUser.nombre}" porque posee registros asociados (pedidos, carritos o historial de pagos) en la base de datos.`)
      } else {
        alert(msg || "Error al eliminar usuario.")
      }
    }
  }

  const openEdit = (user) => {
    setSelectedUser(user)
    setEditForm({ nombre: user.nombre, email: user.email })
    setEditOpen(true)
  }

  const openDelete = (user) => {
    setSelectedUser(user)
    setDeleteOpen(true)
  }

  // Filtrado compuesto por Texto (Nombre/Email) y Filtro de Rol
  const filtered = users.filter((u) => {
    const matchesSearch =
      u.nombre?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())

    const roleInfo = getRoleInfo(u)
    const matchesRole = roleFilter === 'ALL' || roleInfo.code === roleFilter

    return matchesSearch && matchesRole
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gestión de Usuarios</h1>
          <p className="text-sm text-muted-foreground">
            Administra los usuarios registrados en la plataforma.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={fetchUsers} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Crear Usuario
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Usuario</DialogTitle>
                <DialogDescription>
                  Completa los datos para registrar un nuevo usuario.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate}>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="create-nombre">Nombre</Label>
                    <Input
                      id="create-nombre"
                      value={createForm.nombre}
                      onChange={(e) => setCreateForm({ ...createForm, nombre: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="create-email">Email</Label>
                    <Input
                      id="create-email"
                      type="email"
                      value={createForm.email}
                      onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="create-password">Contraseña</Label>
                    <div className="relative">
                      <Input
                        id="create-password"
                        type={showPassword ? 'text' : 'password'}
                        value={createForm.password}
                        onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="create-rol">Rol</Label>
                    <Select
                      value={createForm.rol}
                      onValueChange={(value) => setCreateForm({ ...createForm, rol: value })}
                    >
                      <SelectTrigger id="create-rol">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ROLE_CLIENTE">Cliente</SelectItem>
                        <SelectItem value="ROLE_ADMIN">Administrador</SelectItem>
                        <SelectItem value="ROLE_ANALISTA">Analista</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Crear</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar usuarios por nombre o email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* FILTRO POR ROL */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos los roles</SelectItem>
                  <SelectItem value="ROLE_ADMIN">Administrador</SelectItem>
                  <SelectItem value="ROLE_ANALISTA">Analista</SelectItem>
                  <SelectItem value="ROLE_CLIENTE">Cliente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                    Cargando usuarios...
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                    No se encontraron usuarios.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((user) => {
                  const roleInfo = getRoleInfo(user)
                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                            <UserCircle className="h-4 w-4 text-primary" />
                          </div>
                          <span className="font-medium">{user.nombre}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={roleInfo.badgeVariant}>
                          {roleInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(user)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openDelete(user)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>
              Modifica los datos del usuario seleccionado.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-nombre">Nombre</Label>
                <Input
                  id="edit-nombre"
                  value={editForm.nombre}
                  onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Guardar Cambios</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el usuario
              <span className="font-medium text-foreground"> {selectedUser?.nombre}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}