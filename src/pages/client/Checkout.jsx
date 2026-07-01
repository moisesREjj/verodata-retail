import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useCart } from '@/context/CartContext'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  CreditCard, CheckCircle, ArrowLeft, ShoppingBag, Store,
  Truck, ShieldCheck, Wallet, Landmark,
} from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart()
  const navigate = useNavigate()
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [processing, setProcessing] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [form, setForm] = useState({
    nombre: '',
    direccion: '',
    ciudad: '',
    codigoPostal: '',
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    setProcessing(true)
    setTimeout(() => {
      setProcessing(false)
      setCompleted(true)
      clearCart()
    }, 2000)
  }

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

  const shipping = 0
  const finalTotal = totalPrice + shipping

  /* ─── SUCCESS ─── */
  if (completed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-50 to-white p-4 dark:from-zinc-950 dark:to-zinc-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-md"
        >
          <Card className="overflow-hidden border-0 shadow-2xl">
            <div className="h-2 bg-gradient-to-r from-emerald-400 to-emerald-600" />
            <CardContent className="p-10 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20"
              >
                <CheckCircle className="h-10 w-10 text-emerald-400" />
              </motion.div>
              <h2 className="font-['Oswald',sans-serif] text-3xl font-black uppercase tracking-tighter">
                Pedido Confirmado
              </h2>
              <p className="mt-3 text-sm font-light text-muted-foreground">
                Gracias por tu compra. Recibir&aacute;s un correo con los detalles
                de env&iacute;o a la brevedad.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Button
                  className="h-11 rounded-full px-8 text-sm font-semibold"
                  onClick={() => navigate('/')}
                >
                  Ir al Inicio
                </Button>
                <Button
                  variant="outline"
                  className="h-11 rounded-full px-8 text-sm font-semibold"
                  onClick={() => navigate('/mis-pedidos')}
                >
                  Ver Mis Pedidos
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  /* ─── EMPTY ─── */
  if (items.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md text-center"
        >
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-muted">
            <ShoppingBag className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="font-['Oswald',sans-serif] text-3xl font-black uppercase tracking-tighter">
            Carrito Vac&iacute;o
          </h2>
          <p className="mt-2 text-sm font-light text-muted-foreground">
            Agrega productos al carrito antes de proceder al pago.
          </p>
          <Button
            className="mt-8 h-11 rounded-full px-8"
            onClick={() => navigate('/catalogo')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Ir al Cat&aacute;logo
          </Button>
        </motion.div>
      </div>
    )
  }

  /* ─── CHECKOUT FORM ─── */
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-white px-4 py-8 dark:from-zinc-950 dark:to-zinc-900 sm:px-6">
      {/* Minimalist header */}
      <div className="mx-auto mb-8 flex max-w-6xl items-center justify-between">
        <button
          onClick={() => navigate('/catalogo')}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </button>
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-sm">
            <Store className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-['Oswald',sans-serif] text-base font-semibold tracking-tight">
            VeroData
          </span>
        </div>
      </div>

      <motion.div
        className="mx-auto max-w-6xl"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        <div className="grid gap-8 lg:grid-cols-5">
          {/* ─── FORM ─── */}
          <motion.div variants={fadeUp} className="lg:col-span-3">
            <h1 className="font-['Oswald',sans-serif] text-4xl font-black uppercase tracking-tighter sm:text-5xl">
              Checkout
            </h1>
            <p className="mt-2 text-sm font-light text-muted-foreground">
              Completa tus datos para finalizar la compra.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              {/* Shipping information */}
              <Card className="overflow-hidden border-border/50">
                <div className="h-1 bg-gradient-to-r from-primary/50 to-primary" />
                <CardContent className="p-6 sm:p-8">
                  <h2 className="mb-6 flex items-center gap-2 text-base font-semibold">
                    <Truck className="h-4 w-4 text-muted-foreground" />
                    Informaci&oacute;n de Env&iacute;o
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="nombre" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Nombre Completo
                      </label>
                      <Input
                        id="nombre"
                        value={form.nombre}
                        onChange={(e) => update('nombre', e.target.value)}
                        placeholder="Ej: Juan Pérez"
                        className="h-11 rounded-lg border-border/50"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="direccion" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Direcci&oacute;n
                      </label>
                      <Input
                        id="direccion"
                        value={form.direccion}
                        onChange={(e) => update('direccion', e.target.value)}
                        placeholder="Ej: Calle Roma 123"
                        className="h-11 rounded-lg border-border/50"
                        required
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="ciudad" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          Ciudad
                        </label>
                        <Input
                          id="ciudad"
                          value={form.ciudad}
                          onChange={(e) => update('ciudad', e.target.value)}
                          placeholder="Ej: Milán"
                          className="h-11 rounded-lg border-border/50"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="codigoPostal" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          C&oacute;digo Postal
                        </label>
                        <Input
                          id="codigoPostal"
                          value={form.codigoPostal}
                          onChange={(e) => update('codigoPostal', e.target.value)}
                          placeholder="12345"
                          className="h-11 rounded-lg border-border/50"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment method */}
              <Card className="overflow-hidden border-border/50">
                <div className="h-1 bg-gradient-to-r from-primary/50 to-primary" />
                <CardContent className="p-6 sm:p-8">
                  <h2 className="mb-6 flex items-center gap-2 text-base font-semibold">
                    <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                    M&eacute;todo de Pago
                  </h2>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {[
                      { id: 'card', icon: CreditCard, label: 'Tarjeta', desc: 'Visa · MC · Amex' },
                      { id: 'paypal', icon: Wallet, label: 'PayPal', desc: 'Pago seguro online' },
                      { id: 'transfer', icon: Landmark, label: 'Transferencia', desc: 'Depósito bancario' },
                    ].map((m) => {
                      const Icon = m.icon
                      const active = paymentMethod === m.id
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setPaymentMethod(m.id)}
                          className={`group relative rounded-xl border-2 p-5 text-left transition-all ${
                            active
                              ? 'border-primary bg-primary/5 shadow-sm'
                              : 'border-border/50 hover:border-muted-foreground/30'
                          }`}
                        >
                          {active && (
                            <motion.div
                              layoutId="payment-indicator"
                              className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-primary"
                            />
                          )}
                          <Icon className={`mb-3 h-6 w-6 ${active ? 'text-primary' : 'text-muted-foreground'}`} />
                          <p className="text-sm font-semibold">{m.label}</p>
                          <p className="mt-0.5 text-[11px] text-muted-foreground">{m.desc}</p>
                        </button>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <Button
                type="submit"
                className="h-12 w-full rounded-full text-sm font-semibold shadow-lg transition-all hover:shadow-xl"
                disabled={processing}
              >
                {processing ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Procesando pago...
                  </span>
                ) : (
                  `Pagar S/${finalTotal.toFixed(2)}`
                )}
              </Button>

              <p className="text-center text-[11px] text-muted-foreground">
                <ShieldCheck className="mr-1 inline-block h-3 w-3" />
                Pago 100% seguro cifrado con SSL
              </p>
            </form>
          </motion.div>

          {/* ─── ORDER SUMMARY ─── */}
          <motion.div variants={fadeUp} className="lg:col-span-2">
            <div className="sticky top-24">
              <Card className="overflow-hidden border-border/50">
                <div className="h-1 bg-gradient-to-r from-zinc-300 to-zinc-500 dark:from-zinc-700 dark:to-zinc-500" />
                <CardContent className="p-6 sm:p-8">
                  <h2 className="font-['Oswald',sans-serif] mb-6 text-lg font-semibold uppercase tracking-tight">
                    Resumen
                  </h2>

                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center gap-4">
                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-zinc-50 dark:bg-zinc-900">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover"
                            onError={(e) => { e.target.style.display = 'none' }}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium leading-tight">{item.name}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            Cant: {item.quantity}
                          </p>
                          <p className="mt-0.5 text-sm font-semibold">
                            S/{(item.quantity * item.price).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-5" />

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span>S/{totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Env&iacute;o</span>
                      <span className="font-medium text-emerald-500">Gratis</span>
                    </div>
                  </div>

                  <Separator className="my-5" />

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">Total</span>
                    <span className="font-['Oswald',sans-serif] text-2xl font-bold tracking-tight">
                      S/{finalTotal.toFixed(2)}
                    </span>
                  </div>

                  <div className="mt-6 flex flex-col gap-2 rounded-xl bg-muted/50 p-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Truck className="h-3 w-3" /> Env&iacute;o express 24/48h
                    </span>
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="h-3 w-3" /> Devoluci&oacute;n gratuita
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
