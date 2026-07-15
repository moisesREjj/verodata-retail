import { useState, useEffect, useCallback } from 'react'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import API from '@/lib/api'
import { RefreshCw, Boxes, Search, AlertTriangle, Package } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

export default function AdminStock() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterLevel, setFilterLevel] = useState('')

  const [adjustOpen, setAdjustOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [adjustForm, setAdjustForm] = useState({ stock: '', motivo: '' })

  const fetchProducts = useCallback(async () => {
    try {
      const res = await API.get('/productos')
      setProducts(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const handleAdjust = async (e) => {
    e.preventDefault()
    if (!selectedProduct) return
    try {
      await API.put(`/productos/${selectedProduct.id}/stock`, {
        stock: parseInt(adjustForm.stock),
        motivo: adjustForm.motivo,
      })
      setAdjustOpen(false)
      setSelectedProduct(null)
      setAdjustForm({ stock: '', motivo: '' })
      fetchProducts()
    } catch (err) {
      console.error(err)
    }
  }

  const openAdjust = (product) => {
    setSelectedProduct(product)
    setAdjustForm({ stock: String(product.stock), motivo: '' })
    setAdjustOpen(true)
  }

  const getStockLevel = (stock) => {
    if (stock <= 0) return { label: 'Sin stock', color: 'bg-red-500/20 text-red-400' }
    if (stock <= 2) return { label: 'Crítico', color: 'bg-orange-500/20 text-orange-400' }
    if (stock <= 5) return { label: 'Bajo', color: 'bg-amber-500/20 text-amber-400' }
    return { label: 'Normal', color: 'bg-emerald-500/20 text-emerald-400' }
  }

  const filtered = products.filter((p) => {
    const matchSearch = p.nombre?.toLowerCase().includes(search.toLowerCase())
    if (!filterLevel || filterLevel === 'todos') return matchSearch
    if (filterLevel === 'sin_stock') return matchSearch && p.stock <= 0
    if (filterLevel === 'critico') return matchSearch && p.stock > 0 && p.stock <= 2
    if (filterLevel === 'bajo') return matchSearch && p.stock > 2 && p.stock <= 5
    if (filterLevel === 'normal') return matchSearch && p.stock > 5
    return matchSearch
  })

  const alertCount = products.filter((p) => p.stock <= 5).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Panel de Stock</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona y ajusta el inventario de productos.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={fetchProducts} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Productos', value: products.length, icon: Package, color: 'text-blue-400' },
          { label: 'Stock Normal', value: products.filter((p) => p.stock > 5).length, icon: Boxes, color: 'text-emerald-400' },
          { label: 'Stock Bajo (≤5)', value: alertCount, icon: AlertTriangle, color: 'text-amber-400' },
          { label: 'Sin Stock', value: products.filter((p) => p.stock <= 0).length, icon: AlertTriangle, color: 'text-red-400' },
        ].map((item) => (
          <Card key={item.label} className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-2xl font-bold">{item.value}</p>
                </div>
                <item.icon className={`h-8 w-8 opacity-30 ${item.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar productos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 max-w-sm"
              />
            </div>
            <Select value={filterLevel} onValueChange={setFilterLevel}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Nivel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="bajo">Bajo (3-5)</SelectItem>
                <SelectItem value="critico">Crítico (1-2)</SelectItem>
                <SelectItem value="sin_stock">Sin stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Stock Actual</TableHead>
                <TableHead>Nivel</TableHead>
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
                filtered.map((p) => {
                  const level = getStockLevel(p.stock)
                  return (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                            <Package className="h-4 w-4 text-primary" />
                          </div>
                          <span className="font-medium">{p.nombre}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{p.categorias?.nombre}</TableCell>
                      <TableCell className="font-mono text-lg font-bold">{p.stock}</TableCell>
                      <TableCell>
                        <Badge className={level.color}>{level.label}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => openAdjust(p)}>
                          Ajustar Stock
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={adjustOpen} onOpenChange={setAdjustOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajustar Stock</DialogTitle>
            <DialogDescription>
              {selectedProduct && (
                <span>Modifica el stock de <strong>{selectedProduct.nombre}</strong></span>
              )}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAdjust}>
            <div className="grid gap-4 py-4">
              {selectedProduct && (
                <div className="rounded-lg bg-muted p-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Stock actual:</span>
                      <span className="ml-2 font-bold">{selectedProduct.stock}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Precio:</span>
                      <span className="ml-2 font-bold">S/ {Number(selectedProduct.precio).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="stock">Nuevo Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={adjustForm.stock}
                  onChange={(e) => setAdjustForm({ ...adjustForm, stock: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="motivo">Motivo del Ajuste</Label>
                <Select value={adjustForm.motivo} onValueChange={(v) => setAdjustForm({ ...adjustForm, motivo: v })}>
                  <SelectTrigger id="motivo"><SelectValue placeholder="Selecciona un motivo" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Inventario físico">Inventario físico</SelectItem>
                    <SelectItem value="Devolución de cliente">Devolución de cliente</SelectItem>
                    <SelectItem value="Ajuste por error">Ajuste por error</SelectItem>
                    <SelectItem value="Producto dañado">Producto dañado</SelectItem>
                    <SelectItem value="Reabastecimiento">Reabastecimiento</SelectItem>
                    <SelectItem value="Otros">Otros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Guardar Ajuste</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
