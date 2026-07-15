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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import API from '@/lib/api'
import { Plus, Pencil, Trash2, Search, RefreshCw, Package } from 'lucide-react'

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)

  const emptyForm = { nombre: '', descripcion: '', precio: '', stock: '0', imagen_url: '', id_categoria: '' }
  const [form, setForm] = useState(emptyForm)

  const fetchData = useCallback(async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        API.get('/productos'),
        API.get('/productos/categorias'),
      ])
      setProducts(prodRes.data)
      setCategories(catRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await API.post('/productos', {
        ...form,
        precio: parseFloat(form.precio),
        stock: parseInt(form.stock),
        id_categoria: parseInt(form.id_categoria),
      })
      setCreateOpen(false)
      setForm(emptyForm)
      fetchData()
    } catch (err) {
      console.error(err)
    }
  }

  const handleEdit = async (e) => {
    e.preventDefault()
    if (!selectedProduct) return
    try {
      const body = {}
      if (form.nombre !== undefined) body.nombre = form.nombre
      if (form.descripcion !== undefined) body.descripcion = form.descripcion
      if (form.precio !== '') body.precio = parseFloat(form.precio)
      if (form.stock !== '') body.stock = parseInt(form.stock)
      if (form.imagen_url !== undefined) body.imagen_url = form.imagen_url
      if (form.id_categoria !== '') body.id_categoria = parseInt(form.id_categoria)

      await API.put(`/productos/${selectedProduct.id}`, body)
      setEditOpen(false)
      setSelectedProduct(null)
      fetchData()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async () => {
    if (!selectedProduct) return
    try {
      await API.delete(`/productos/${selectedProduct.id}`)
      setDeleteOpen(false)
      setSelectedProduct(null)
      fetchData()
    } catch (err) {
      console.error(err)
    }
  }

  const openEdit = (product) => {
    setSelectedProduct(product)
    setForm({
      nombre: product.nombre,
      descripcion: product.descripcion || '',
      precio: String(product.precio),
      stock: String(product.stock),
      imagen_url: product.imagen_url || '',
      id_categoria: String(product.id_categoria),
    })
    setEditOpen(true)
  }

  const openDelete = (product) => {
    setSelectedProduct(product)
    setDeleteOpen(true)
  }

  const filtered = products.filter((p) =>
    p.nombre?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gestión de Productos</h1>
          <p className="text-sm text-muted-foreground">
            Administra el catálogo de productos.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4" />
                Crear Producto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Crear Producto</DialogTitle>
                <DialogDescription>Completa los datos del nuevo producto.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre</Label>
                      <Input id="name" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cat">Categoría</Label>
                      <Select value={form.id_categoria} onValueChange={(v) => setForm({ ...form, id_categoria: v })}>
                        <SelectTrigger id="cat"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {categories.map((c) => (
                            <SelectItem key={c.id} value={String(c.id)}>{c.nombre}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="desc">Descripción</Label>
                    <Input id="desc" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Precio (S/)</Label>
                      <Input id="price" type="number" step="0.01" min="0" value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stock">Stock</Label>
                      <Input id="stock" type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="img">URL de Imagen</Label>
                    <Input id="img" value={form.imagen_url} onChange={(e) => setForm({ ...form, imagen_url: e.target.value })} />
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
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar productos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">Cargando productos...</TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">No se encontraron productos.</TableCell>
                </TableRow>
              ) : (
                filtered.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                          <Package className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <span className="font-medium">{p.nombre}</span>
                          {p.descripcion && (
                            <p className="text-xs text-muted-foreground">{p.descripcion}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{p.categorias?.nombre}</Badge>
                    </TableCell>
                    <TableCell className="font-mono">S/ {Number(p.precio).toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={p.stock <= 0 ? 'destructive' : p.stock < 5 ? 'default' : 'secondary'}>
                        {p.stock}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openDelete(p)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Producto</DialogTitle>
            <DialogDescription>Modifica los datos del producto.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Nombre</Label>
                  <Input id="edit-name" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-cat">Categoría</Label>
                  <Select value={form.id_categoria} onValueChange={(v) => setForm({ ...form, id_categoria: v })}>
                    <SelectTrigger id="edit-cat"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>{c.nombre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-desc">Descripción</Label>
                <Input id="edit-desc" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-price">Precio (S/)</Label>
                  <Input id="edit-price" type="number" step="0.01" min="0" value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-stock">Stock</Label>
                  <Input id="edit-stock" type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-img">URL de Imagen</Label>
                <Input id="edit-img" value={form.imagen_url} onChange={(e) => setForm({ ...form, imagen_url: e.target.value })} />
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
            <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente
              <span className="font-medium text-foreground"> {selectedProduct?.nombre}</span>.
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
