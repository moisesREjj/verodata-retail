import { useState, useMemo } from 'react'
import { useOutletContext } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ShoppingCart, Package, Search, Grid3X3, List, Heart } from 'lucide-react'

/* ─── DATA ENRICHMENT ─── */

const descriptionMap = {
  Electrónicos: 'Tecnología de última generación',
  Ropa: 'Estilo y confort premium',
  Hogar: 'Diseño funcional para tu espacio',
  Deportes: 'Rendimiento profesional',
  Libros: 'Conocimiento esencial para tu carrera',
}

const colorWays = [
  { color: 'Negro', hex: '#111111' },
  { color: 'Blanco', hex: '#f5f5f5' },
  { color: 'Azul', hex: '#2563eb' },
  { color: 'Rojo', hex: '#dc2626' },
  { color: 'Gris', hex: '#6b7280' },
  { color: 'Verde', hex: '#16a34a' },
]

const discountTable = [0, 15, 20, 25, 30, 40]

function enrichProduct(p) {
  const isNew = p.stock > 4
  const discountIdx = p.id % discountTable.length
  const discount = p.stock <= 3 ? discountTable[discountIdx] : 0
  const originalPrice = discount > 0 ? p.price / (1 - discount / 100) : null
  const variantCount = 2 + (p.id % 2)
  const startIdx = ((p.id - 1) * 2) % colorWays.length

  // 🖼️ EXTRAEMOS LA IMAGEN REAL DE LA BASE DE DATOS / API
  const realImage = p.imagen_url || p.image || p.imagen || `https://placehold.co/600x600/1a1a1a/ffffff?text=${encodeURIComponent(p.name)}`

  const variants = Array.from({ length: variantCount }, (_, i) => {
    const cw = colorWays[(startIdx + i) % colorWays.length]
    return {
      ...cw,
      // Usamos la imagen real tanto para frente como reverso para no romper la galería
      frontImage: realImage,
      backImage: realImage,
      thumbnail: realImage,
    }
  })

  return {
    ...p,
    isNew,
    discount,
    originalPrice: originalPrice ? Math.round(originalPrice * 100) / 100 : null,
    description: p.description || descriptionMap[p.category] || 'Producto premium',
    variants,
  }
}

/* ─── FALLBACK ─── */

function imgFallback(e, label) {
  e.target.src = `https://placehold.co/600x600/1a1a1a/ffffff?text=${encodeURIComponent(label)}`
}

/* ─── PRODUCT CARD (maneja su propio hover / variante) ─── */

function ProductCard({ product, onAdd }) {
  const [isHovered, setIsHovered] = useState(false)
  const [isFav, setIsFav] = useState(false)
  const [selVar, setSelVar] = useState(0)
  const current = product.variants[selVar]

  const label = product.discount > 0
    ? { text: `-${product.discount}%`, variant: 'destructive' }
    : product.isNew
      ? { text: 'JUST IN', variant: 'default' }
      : product.stock <= 3
        ? { text: `STOCK ${product.stock}`, variant: 'secondary' }
        : null

  return (
    <motion.div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card className="flex h-full flex-col overflow-hidden border-border/40 bg-card transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        {/* ── IMAGE CONTAINER ── */}
        <div className="relative aspect-[1/1] overflow-hidden bg-zinc-50 dark:bg-zinc-900">
          <AnimatePresence mode="wait">
            <motion.img
              key={`${selVar}-${isHovered ? 'b' : 'f'}`}
              src={isHovered ? current.backImage : current.frontImage}
              alt={product.name}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="h-full w-full object-cover"
              onError={(e) => imgFallback(e, product.name)}
            />
          </AnimatePresence>

          {/* Heart (favoritos) */}
          <button
            onClick={(e) => { e.stopPropagation(); setIsFav((v) => !v) }}
            className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/70 shadow-sm backdrop-blur-sm transition-all hover:scale-110 dark:bg-black/50"
            aria-label="Favoritos"
          >
            <Heart
              className={`h-4 w-4 transition-colors ${isFav ? 'fill-red-500 text-red-500' : 'text-zinc-700 dark:text-zinc-300'}`}
            />
          </button>

          {/* Label (Just In / descuento) */}
          {label && (
            <Badge
              variant={label.variant}
              className="absolute left-3 top-3 rounded-sm border-0 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest"
            >
              {label.text}
            </Badge>
          )}

          {/* Color thumbnails */}
          {product.variants.length > 1 && (
            <div className="absolute bottom-3 left-3 flex gap-1.5">
              {product.variants.map((v, i) => (
                <button
                  key={v.color}
                  onClick={(e) => { e.stopPropagation(); setSelVar(i) }}
                  className={`overflow-hidden rounded-full border-2 transition-all ${
                    i === selVar ? 'scale-110 border-black dark:border-white' : 'border-white/70 dark:border-zinc-700'
                  }`}
                  aria-label={v.color}
                >
                  <img
                    src={v.thumbnail}
                    alt={v.color}
                    className="h-6 w-6 object-cover"
                    onError={(e) => { e.target.style.display = 'none' }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── PRODUCT INFO ── */}
        <CardContent className="flex flex-1 flex-col p-4">
          <p className="text-[10px] font-medium tracking-[0.2em] text-muted-foreground uppercase">
            {product.category}
          </p>
          <h3 className="mt-0.5 font-semibold leading-tight">{product.name}</h3>
          <p className="mt-0.5 text-xs font-light text-muted-foreground line-clamp-1">
            {product.description}
          </p>

          <div className="mt-auto flex items-baseline gap-2 pt-3">
            <span className="text-lg font-bold tracking-tight">
              S/{Number(product.price).toFixed(2)}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                S/{product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>

          <Button
            className="mt-3 w-full gap-1.5 rounded-full text-xs font-semibold"
            size="sm"
            onClick={() => onAdd(product)}
          >
            <ShoppingCart className="h-3.5 w-3.5" /> Agregar
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}

/* ─── MAIN CATALOG ─── */

export default function Catalog() {
  const { products = [], addItem } = useOutletContext()
  const [searchTerm, setSearchTerm] = useState('')
  const [category, setCategory] = useState('Todas')
  const [viewMode, setViewMode] = useState('grid')

  const enriched = useMemo(() => products.map(enrichProduct), [products])

  const categories = ['Todas', ...new Set(products.map((p) => p.category))]

  const filtered = enriched.filter(
    (p) =>
      (category === 'Todas' || p.category === category) &&
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <Package className="mb-4 h-16 w-16" />
        <p className="text-lg font-medium">No se encontraron productos</p>
        <p className="text-sm">Intenta con otros términos de búsqueda o categoría.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {/* ─── HEADER ─── */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-['Oswald',sans-serif] text-3xl font-black uppercase tracking-tighter sm:text-4xl">
            Catálogo
          </h1>
          <p className="mt-1 text-sm font-light text-muted-foreground">
            {filtered.length} producto{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Input
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9 rounded-full border-border/50 pl-9 text-sm"
            />
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
          <div className="hidden rounded-lg border border-border/50 p-0.5 sm:flex">
            <button
              onClick={() => setViewMode('grid')}
              className={`rounded-md p-1.5 transition-colors ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              aria-label="Vista cuadrícula"
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`rounded-md p-1.5 transition-colors ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              aria-label="Vista lista"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ─── CATEGORY FILTER ─── */}
      <div className="mb-6 flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`rounded-full px-4 py-1.5 text-xs font-medium tracking-wide uppercase transition-colors ${
              category === cat
                ? 'bg-black text-white dark:bg-white dark:text-black'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ─── EMPTY / GRID / LIST ─── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Package className="mb-4 h-16 w-16" />
          <p className="text-lg font-medium">No se encontraron productos</p>
          <p className="text-sm">Intenta con otros términos de búsqueda o categoría.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} onAdd={addItem} />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((product) => (
            <div
              key={product.id}
              className="group flex items-center gap-5 rounded-2xl border border-border/50 p-4 transition-all hover:shadow-md"
            >
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-zinc-50 sm:h-28 sm:w-28 dark:bg-zinc-900">
                <img
                  src={product.variants[0].frontImage}
                  alt={product.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  onError={(e) => imgFallback(e, product.name)}
                />
                {product.discount > 0 && (
                  <span className="absolute left-1.5 top-1.5 rounded-sm bg-destructive px-1.5 py-0.5 text-[9px] font-bold text-destructive-foreground uppercase tracking-wider">
                    -{product.discount}%
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[10px] font-medium tracking-[0.2em] text-muted-foreground uppercase">
                    {product.category}
                  </p>
                  <h3 className="font-semibold leading-tight">{product.name}</h3>
                  <p className="text-xs font-light text-muted-foreground">{product.description}</p>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="font-bold tracking-tight">S/{Number(product.price).toFixed(2)}</span>
                    {product.originalPrice && (
                      <span className="text-xs text-muted-foreground line-through">
                        S/{product.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  className="mt-3 w-full rounded-full sm:mt-0 sm:w-auto sm:px-6"
                  size="sm"
                  onClick={() => addItem(product)}
                >
                  <ShoppingCart className="mr-1.5 h-4 w-4" /> Agregar
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}