import { useState, useEffect } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Store, ShoppingCart, Package2, LogOut, Minus, Plus, Trash2, ChevronRight, House,
} from 'lucide-react'
import API from '@/lib/api'

const navLinkClass = ({ isActive }) =>
  `text-sm font-medium transition-colors hover:text-foreground ${
    isActive ? 'text-foreground' : 'text-muted-foreground'
  }`

export default function ClientLayout() {
  const { user, logout } = useAuth()
  const { items, addItem, removeItem, updateQuantity, totalItems, totalPrice } = useCart()
  const [cartOpen, setCartOpen] = useState(false)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    API.get('/productos')
      .then((res) => {
        const mapped = (res.data || []).map((p) => ({
          id: p.id,
          name: p.nombre,
          category: p.categorias?.nombre || 'General',
          price: Number(p.precio),
          stock: p.stock,
          image: p.imagen_url || 'https://placehold.co/400x300/1a1a1a/ffffff?text=Producto',
        }))
        setProducts(mapped)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const initials = user?.nombre?.[0]?.toUpperCase() || 'C'

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <NavLink to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary shadow-sm">
              <Store className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight">VeroData Retail</span>
          </NavLink>

          <nav className="hidden items-center gap-6 md:flex">
            <NavLink to="/" end className={navLinkClass}>
              <House className="mr-1.5 inline-block h-4 w-4" />
              Inicio
            </NavLink>
            <NavLink to="/catalogo" className={navLinkClass}>
              <Package2 className="mr-1.5 inline-block h-4 w-4" />
              Catálogo Completo
            </NavLink>
            <NavLink to="/mis-pedidos" className={navLinkClass}>
              <Package2 className="mr-1.5 inline-block h-4 w-4" />
              Mis Pedidos
            </NavLink>
          </nav>

          <div className="flex items-center gap-3">
            <Sheet open={cartOpen} onOpenChange={setCartOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {totalItems > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                      {totalItems}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="flex w-full flex-col sm:max-w-md">
                <SheetHeader>
                  <SheetTitle>Carrito de Compras</SheetTitle>
                </SheetHeader>
                {items.length === 0 ? (
                  <div className="flex flex-1 flex-col items-center justify-center gap-3 text-muted-foreground">
                    <ShoppingCart className="h-12 w-12" />
                    <p className="text-sm">Tu carrito está vacío</p>
                  </div>
                ) : (
                  <>
                    <ScrollArea className="flex-1 pr-4">
                      <div className="space-y-4 py-4">
                        {items.map((item) => (
                          <div key={item.id} className="flex gap-4 rounded-lg border p-3">
                            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-full w-full object-cover"
                                onError={(e) => { e.target.style.display = 'none' }}
                              />
                            </div>
                            <div className="flex flex-1 flex-col justify-between">
                              <div>
                                <p className="text-sm font-medium">{item.name}</p>
                                <p className="text-xs text-muted-foreground">S/{item.price.toFixed(2)}</p>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <span className="w-8 text-center text-sm tabular-nums">{item.quantity}</span>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                  onClick={() => removeItem(item.id)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                    <SheetFooter className="border-t pt-4 sm:flex-col sm:space-x-0 sm:space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Total</span>
                        <span className="text-xl font-bold">S/{totalPrice.toFixed(2)}</span>
                      </div>
                      <NavLink
                        to="/checkout"
                        onClick={() => setCartOpen(false)}
                        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
                      >
                        Proceder al Pago
                        <ChevronRight className="h-4 w-4" />
                      </NavLink>
                    </SheetFooter>
                  </>
                )}
              </SheetContent>
            </Sheet>

            <Separator orientation="vertical" className="h-6" />

            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8 border">
                <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block">
                <p className="text-sm font-medium leading-none">{user?.nombre || 'Cliente'}</p>
              </div>
              <Button variant="ghost" size="icon" className="text-muted-foreground" onClick={logout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-around border-t px-4 py-2 md:hidden">
          <NavLink to="/" end className={navLinkClass}>
            <House className="mx-auto h-5 w-5" />
            <span className="text-[10px]">Inicio</span>
          </NavLink>
          <NavLink to="/catalogo" className={navLinkClass}>
            <Package2 className="mx-auto h-5 w-5" />
            <span className="text-[10px]">Catálogo</span>
          </NavLink>
          <NavLink to="/mis-pedidos" className={navLinkClass}>
            <Package2 className="mx-auto h-5 w-5" />
            <span className="text-[10px]">Pedidos</span>
          </NavLink>
        </div>
      </header>

      <main className="flex-1">
        <Outlet context={{ products, loading, addItem }} />
      </main>
    </div>
  )
}
