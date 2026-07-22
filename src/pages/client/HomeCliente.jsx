import { useState, useEffect } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Truck, ShieldCheck, Headphones, ShoppingCart, ArrowRight, Percent, Tag, Zap
} from 'lucide-react'

/* ─── UNSPLASH IMAGES ─── */
const heroImages = [
  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1600&q=80',
  'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=1600&q=80',
  'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=1600&q=80',
  'https://images.unsplash.com/photo-1499678329028-101d549d2b6b?w=1600&q=80',
]

const categoryCards = [
  {
    title: 'URBANO',
    subtitle: 'STREETWEAR',
    image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800&q=80',
  },
  {
    title: 'DEPORTIVO',
    subtitle: 'ATHLEISURE',
    image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80',
  },
  {
    title: 'LUJO',
    subtitle: 'PRÊT-À-PORTER',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80',
  },
]

const benefits = [
  { icon: Truck, title: 'Envío Express a toda Italia', description: '24/48h en tu domicilio' },
  { icon: ShieldCheck, title: 'Pago Seguro (JWT/SSL)', description: 'Tus datos protegidos' },
  { icon: Headphones, title: 'Soporte 24/7', description: 'Asistencia personalizada' },
]

/* ─── FRAMER VARIANTS ─── */
const heroSlideVariants = {
  enter: (dir) => ({ x: dir > 0 ? '100%' : '-100%', scale: 1.1 }),
  center: { x: 0, scale: 1, transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } },
  exit: (dir) => ({ x: dir > 0 ? '-100%' : '100%', scale: 0.95, transition: { duration: 0.6, ease: [0.76, 0, 0.24, 1] } }),
}

const heroTextContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.18, delayChildren: 0.2 } },
}

const heroTextItem = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] } },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
}

const staggerItem = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
}

/* ─── PLACEHOLDER FALLBACK ─── */
function imgFallback(e, label) {
  e.target.src = `https://placehold.co/800x1000/1a1a1a/ffffff?text=${encodeURIComponent(label)}`
}

export default function HomeCliente() {
  const { products = [], addItem } = useOutletContext()
  const navigate = useNavigate()
  const [imgIndex, setImgIndex] = useState(0)
  const [dir, setDir] = useState(1)

  /* auto‑rotate hero every 4 s */
  useEffect(() => {
    const t = setInterval(() => { setDir(1); setImgIndex((p) => (p + 1) % heroImages.length) }, 4000)
    return () => clearInterval(t)
  }, [])

  const goTo = (i) => { setDir(i > imgIndex ? 1 : -1); setImgIndex(i) }

  const featured = products.length >= 4 ? products.slice(0, 4) : products

  return (
    <div className="overflow-hidden">

      {/* ════════════════════════════════════════════════════════════
          1.  HERO  –  Pantalla completa · Carrusel con slide + scale
          ════════════════════════════════════════════════════════════ */}
      <section className="relative h-screen w-full overflow-hidden">
        <AnimatePresence custom={dir}>
          <motion.img
            key={imgIndex}
            src={heroImages[imgIndex]}
            custom={dir}
            variants={heroSlideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0 h-full w-full object-cover"
            onError={(e) => imgFallback(e, 'Hero')}
          />
        </AnimatePresence>

        {/* gradientes superpuestos */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />

        {/* texto hero – abajo izquierda (estilo Nike) */}
        <motion.div
          className="absolute bottom-0 left-0 z-10 max-w-3xl p-8 sm:p-16"
          variants={heroTextContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={heroTextItem}>
            <Badge variant="outline" className="border-white/30 text-xs tracking-[0.25em] text-white/80 uppercase">
              Vero Data · Italia
            </Badge>
          </motion.div>

          <motion.h1
            variants={heroTextItem}
            className="mt-4 font-['Oswald',sans-serif] text-7xl font-black uppercase leading-none tracking-tighter text-white sm:text-8xl md:text-9xl"
          >
            NO SIGAS
            <br />
            TENDENCIAS.
            <br />
            <span className="text-white/90">CRÉALAS.</span>
          </motion.h1>

          <motion.p
            variants={heroTextItem}
            className="mt-4 max-w-lg text-base font-light leading-relaxed text-white/60 sm:text-lg"
          >
            El futuro del retail inteligente en Italia. Tecnología, diseño y
            excelencia para transformar tu forma de comprar.
          </motion.p>

          <motion.div variants={heroTextItem} className="mt-8 flex flex-wrap gap-4">
            <Button
              size="lg"
              className="h-14 rounded-full border-2 border-white bg-white px-10 text-base font-semibold text-black transition-all hover:bg-black hover:text-white"
              onClick={() => navigate('/catalogo')}
            >
              Comprar Ahora
              <ArrowRight className="ml-1 h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-14 rounded-full border-white/30 px-10 text-base text-white hover:bg-white/10"
              onClick={() => document.getElementById('categories-section')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Explorar
            </Button>
          </motion.div>
        </motion.div>

        {/* indicadores de imagen (abajo derecha) */}
        <div className="absolute bottom-8 right-8 z-10 flex gap-2">
          {heroImages.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === imgIndex ? 'w-12 bg-white' : 'w-3 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Imagen ${i + 1}`}
            />
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          2.  BENTO GRID  –  3 columnas con stagger + hover zoom
          ════════════════════════════════════════════════════════════ */}
      <section id="categories-section" className="px-4 py-12 sm:px-6">
        <motion.div
          className="mx-auto grid max-w-7xl grid-cols-1 gap-4 md:grid-cols-3"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          {categoryCards.map((cat) => (
            <motion.div
              key={cat.title}
              variants={staggerItem}
              className="group relative h-[55vh] cursor-pointer overflow-hidden rounded-2xl md:h-[70vh]"
              onClick={() => navigate('/catalogo')}
            >
              <img
                src={cat.image}
                alt={cat.title}
                className="h-full w-full object-cover transition-all duration-700 group-hover:scale-105"
                onError={(e) => imgFallback(e, cat.title)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6 sm:p-8">
                <p className="text-[10px] font-light tracking-[0.3em] text-white/60 uppercase">
                  {cat.subtitle}
                </p>
                <h3 className="font-['Oswald',sans-serif] text-4xl font-black uppercase leading-none tracking-tighter text-white sm:text-5xl">
                  {cat.title}
                </h3>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          3.  BANER PROMOCIONAL DE VENTAS AL POR MAYOR (NUEVO)
          ════════════════════════════════════════════════════════════ */}
      <section className="px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-zinc-900 to-black p-8 border border-emerald-500/30 text-white shadow-2xl"
          >
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
            
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
              <div className="space-y-2 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-emerald-400 border border-emerald-500/20">
                  <Zap className="h-3.5 w-3.5" /> Tarifas Mayoristas & Retail
                </div>
                <h2 className="font-['Oswald',sans-serif] text-3xl font-black uppercase tracking-tight sm:text-4xl lg:text-5xl">
                  ¡Descuentos automáticos por cantidad!
                </h2>
                <p className="max-w-xl text-sm font-light text-zinc-300">
                  Ahorra en tus compras de gran volumen. El descuento se aplica de manera automática en tu carrito y comprobante PDF al alcanzar las unidades.
                </p>
              </div>

              {/* Tarjetas de Tarifa */}
              <div className="grid grid-cols-3 gap-3 w-full sm:w-auto">
                <div className="flex flex-col items-center justify-center rounded-2xl bg-white/5 p-4 text-center backdrop-blur-md border border-white/10 hover:border-emerald-500/50 transition-all hover:scale-105">
                  <span className="text-2xl sm:text-3xl font-black text-emerald-400">-15%</span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-white mt-1">Docena</span>
                  <span className="text-[10px] text-zinc-400 font-mono">12+ unid.</span>
                </div>

                <div className="flex flex-col items-center justify-center rounded-2xl bg-white/5 p-4 text-center backdrop-blur-md border border-white/10 hover:border-emerald-500/50 transition-all hover:scale-105">
                  <span className="text-2xl sm:text-3xl font-black text-emerald-400">-20%</span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-white mt-1">Centenar</span>
                  <span className="text-[10px] text-zinc-400 font-mono">100+ unid.</span>
                </div>

                <div className="flex flex-col items-center justify-center rounded-2xl bg-white/5 p-4 text-center backdrop-blur-md border border-white/10 hover:border-emerald-500/50 transition-all hover:scale-105">
                  <span className="text-2xl sm:text-3xl font-black text-emerald-400">-30%</span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-white mt-1">Millar</span>
                  <span className="text-[10px] text-zinc-400 font-mono">1000+ unid.</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          4.  COPY EMOCIONAL  +  PRODUCTOS DESTACADOS
          ════════════════════════════════════════════════════════════ */}
      <section className="bg-muted/30 px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mx-auto mb-20 max-w-3xl text-center"
          >
            <p className="mb-4 text-xs font-medium tracking-[0.3em] text-muted-foreground uppercase">
              Vero Data Retail
            </p>
            <h2 className="font-['Oswald',sans-serif] text-5xl font-black uppercase leading-none tracking-tighter sm:text-7xl">
              MAKE IT HERE.
              <br />
              TAKE IT ANYWHERE.
            </h2>
            <p className="mt-6 text-base font-light leading-relaxed text-muted-foreground sm:text-lg">
              Curamos cada producto con inteligencia de datos para ofrecerte lo
              mejor del retail italiano. Innovación, estilo y confianza en cada
              entrega.
            </p>
          </motion.div>

          <motion.div
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
          >
            {featured.map((product, i) => (
              <motion.div key={product.id} variants={staggerItem}>
                <Card className="group flex h-full flex-col overflow-hidden border-border/50 bg-card transition-all duration-500 hover:shadow-xl hover:-translate-y-1">
                  <div className="relative aspect-[1/1] overflow-hidden bg-muted">
                    <img
                      src={product.imagen_url || product.image || product.imagen}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      onError={(e) => imgFallback(e, product.name)}
                    />
                    <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <div className="w-full translate-y-4 p-4 transition-transform duration-300 group-hover:translate-y-0">
                        <Button
                          className="w-full rounded-full bg-white text-sm font-semibold text-black shadow-lg hover:bg-white/90"
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); addItem(product) }}
                        >
                          <ShoppingCart className="mr-1 h-4 w-4" /> Agregar
                        </Button>
                      </div>
                    </div>
                    <Badge className="absolute left-3 top-3 rounded-full border-0 bg-black px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
                      {i === 0 ? 'TOP VENTAS' : i === 1 ? 'NUEVO' : product.stock <= 3 ? 'STOCK LIMITADO' : 'DESTACADO'}
                    </Badge>
                  </div>
                  <CardContent className="flex flex-1 flex-col p-4">
                    <p className="text-[10px] font-medium tracking-[0.2em] text-muted-foreground uppercase">
                      {product.category}
                    </p>
                    <h3 className="mt-0.5 font-semibold leading-tight">{product.name}</h3>
                    <p className="mt-auto pt-2 text-xl font-bold tracking-tight">
                      S/{Number(product.price).toFixed(2)}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <Button
              variant="outline"
              size="lg"
              className="h-12 gap-2 rounded-full px-8"
              onClick={() => navigate('/catalogo')}
            >
              Ver Catálogo Completo
              <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          5.  EDITORIAL BANNER  –  Full‑bleed brand moment
          ════════════════════════════════════════════════════════════ */}
      <section className="relative h-[70vh] overflow-hidden sm:h-[80vh]">
        <img
          src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1600&q=80"
          alt="Editorial"
          className="h-full w-full object-cover"
          onError={(e) => imgFallback(e, 'Editorial')}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        <div className="absolute inset-0 flex items-center px-6 sm:px-16">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="max-w-2xl"
          >
            <p className="text-xs font-light tracking-[0.3em] text-white/50 uppercase">
              Vero Data Retail &middot; Italia
            </p>
            <h2 className="mt-4 font-['Oswald',sans-serif] text-6xl font-black uppercase leading-none tracking-tighter text-white sm:text-8xl">
              EL RETAIL
              <br />
              INTELIGENTE
              <br />
              EMPIEZA AQUÍ
            </h2>
            <p className="mt-6 max-w-lg text-base font-light leading-relaxed text-white/60">
              Datos, diseño y precisión italiana. Cada producto está
              seleccionado para ofrecerte lo mejor del comercio del futuro.
            </p>
            <Button
              size="lg"
              className="mt-8 h-12 rounded-full border-2 border-white bg-transparent px-8 text-sm font-semibold text-white transition-all hover:bg-white hover:text-black"
              onClick={() => navigate('/catalogo')}
            >
              Descubrir Colección
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          6.  TRUST / FIDELITY  (estilo Nike - cards con hover)
          ════════════════════════════════════════════════════════════ */}
      <section className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid gap-6 md:grid-cols-3"
          >
            {benefits.map((b) => {
              const Icon = b.icon
              return (
                <motion.div
                  key={b.title}
                  variants={staggerItem}
                  className="group rounded-2xl border border-border/50 p-8 text-center transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:-translate-y-0.5"
                >
                  <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/5 transition-colors group-hover:bg-primary/10">
                    <Icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-base font-semibold">{b.title}</h3>
                  <p className="mt-1 text-sm font-light text-muted-foreground">
                    {b.description}
                  </p>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

    </div>
  )
}