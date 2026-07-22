import { useState } from 'react'
import { generarComprobantePDF } from '@/lib/pdfGenerator'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { calculateOrderSummary } from '@/lib/discounts'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  CreditCard, CheckCircle, ArrowLeft, ShoppingBag, Store,
  Truck, ShieldCheck, Landmark, Smartphone, Building2, XCircle,
  Eye, EyeOff,
} from 'lucide-react'
import API from '@/lib/api'

/* ─── LOGOS Y MÉTODOS DE PAGO ─── */

function VisaLogo() {
  return (
    <svg viewBox="0 0 50 16" className="h-4 w-12">
      <rect width="50" height="16" rx="2" fill="#1A1F71"/>
      <text x="25" y="12" textAnchor="middle" fill="#fff" fontSize="9" fontFamily="Arial" fontWeight="bold">VISA</text>
    </svg>
  )
}

function MastercardLogo() {
  return (
    <svg viewBox="0 0 36 22" className="h-4 w-7">
      <circle cx="13" cy="11" r="9" fill="#EB001B"/>
      <circle cx="23" cy="11" r="9" fill="#F79E1B"/>
      <path fill="#FF5F00" d="M18 4.5c1.8 1.3 3 3.4 3 6.5s-1.2 5.2-3 6.5c-1.8-1.3-3-3.4-3-6.5z"/>
    </svg>
  )
}

function AmexLogo() {
  return (
    <svg viewBox="0 0 36 22" className="h-4 w-7">
      <rect width="36" height="22" rx="3" fill="#2E77BC"/>
      <text x="18" y="15" textAnchor="middle" fill="#fff" fontSize="9" fontFamily="Arial" fontWeight="bold">AMEX</text>
    </svg>
  )
}

function DinersLogo() {
  return (
    <svg viewBox="0 0 36 22" className="h-4 w-7">
      <rect width="36" height="22" rx="3" fill="#004EA8"/>
      <text x="18" y="15" textAnchor="middle" fill="#fff" fontSize="7" fontFamily="Arial" fontWeight="bold">DINERS</text>
    </svg>
  )
}

function DiscoverLogo() {
  return (
    <svg viewBox="0 0 36 22" className="h-4 w-7">
      <rect width="36" height="22" rx="3" fill="#231F20"/>
      <text x="18" y="15" textAnchor="middle" fill="#fff" fontSize="6" fontFamily="Arial" fontWeight="bold">DISCOVER</text>
    </svg>
  )
}

function EloLogo() {
  return (
    <svg viewBox="0 0 36 22" className="h-4 w-7">
      <rect width="36" height="22" rx="3" fill="#231F20"/>
      <circle cx="14" cy="11" r="5" fill="#FFC107"/>
      <circle cx="18" cy="11" r="5" fill="#E0115F" opacity="0.7"/>
      <circle cx="22" cy="11" r="5" fill="#00A4E4" opacity="0.7"/>
    </svg>
  )
}

function HipercardLogo() {
  return (
    <svg viewBox="0 0 36 22" className="h-4 w-7">
      <rect width="36" height="22" rx="3" fill="#B3131B"/>
      <text x="18" y="15" textAnchor="middle" fill="#fff" fontSize="6" fontFamily="Arial" fontWeight="bold">HIPER</text>
    </svg>
  )
}

function CardLogo({ brand }) {
  if (!brand) return null
  switch (brand.label) {
    case 'Visa': return <VisaLogo />
    case 'Mastercard': return <MastercardLogo />
    case 'American Express': return <AmexLogo />
    case 'Diners Club': return <DinersLogo />
    case 'Discover': return <DiscoverLogo />
    case 'Elo': return <EloLogo />
    case 'Hipercard': return <HipercardLogo />
    default: return null
  }
}

const CARD_BRANDS = [
  { pattern: /^4/, label: 'Visa', comp: VisaLogo, lengths: [13, 16, 19] },
  { pattern: /^5[1-5]/, label: 'Mastercard', comp: MastercardLogo, lengths: [16] },
  { pattern: /^3[47]/, label: 'American Express', comp: AmexLogo, lengths: [15] },
  { pattern: /^3(?:0[0-5]|[68])/, label: 'Diners Club', comp: DinersLogo, lengths: [14] },
  { pattern: /^6(?:011|5)/, label: 'Discover', comp: DiscoverLogo, lengths: [16, 19] },
  { pattern: /^506[7]|^4576|^4011|^438935|^504175|^627780|^636368/, label: 'Elo', comp: EloLogo, lengths: [16] },
  { pattern: /^606282|^3841/, label: 'Hipercard', comp: HipercardLogo, lengths: [16] },
]

function detectCardBrand(numero) {
  const clean = numero.replace(/\D/g, '')
  for (const brand of CARD_BRANDS) {
    if (brand.pattern.test(clean)) return brand
  }
  return null
}

function formatCardNumber(value) {
  const digits = value.replace(/\D/g, '').slice(0, 19)
  const brand = detectCardBrand(digits)
  const groups = brand?.label === 'American Express' ? [4, 6, 5] : [4, 4, 4, 4]
  const parts = []
  let i = 0
  for (const g of groups) {
    parts.push(digits.slice(i, i + g))
    i += g
    if (i >= digits.length) break
  }
  return parts.filter(Boolean).join(' ')
}

function formatExpiry(value) {
  const digits = value.replace(/\D/g, '').slice(0, 4)
  if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2)
  return digits
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

/* ─── MAIN COMPONENT ─── */

export default function Checkout() {
  const { items, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [paymentMethod, setPaymentMethod] = useState('Tarjeta')
  const [processing, setProcessing] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [error, setError] = useState(null)
  
  const summary = calculateOrderSummary(items)  
  const [transaccionId, setTransaccionId] = useState(null)

  const [form, setForm] = useState({
    nombre: '',
    direccion: '',
    ciudad: '',
    codigoPostal: '',
    telefono: '',
    numeroTarjeta: '',
    expiracion: '',
    cvv: '',
    email: '',
  })
  
  const [errors, setErrors] = useState({})
  const [showCVV, setShowCVV] = useState(false)

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

  // Validaciones de campos individuales con soporte de tildes y eñes
  function validateField(name, value) {
    switch (name) {
      case 'nombre':
        if (!value.trim()) return 'Requerido'
        return /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(value) ? '' : 'No se permiten números ni símbolos'
      case 'direccion':
        return value.trim().length > 0 ? '' : 'Requerido'
      case 'ciudad':
        if (!value.trim()) return 'Requerido'
        return /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(value) ? '' : 'No se permiten números ni símbolos'
      case 'codigoPostal':
        if (!value.trim()) return 'Requerido'
        return /^\d{1,10}$/.test(value) ? '' : 'Solo números'
      case 'telefono':
        if (!value.trim()) return 'Requerido'
        if (!/^\d+$/.test(value)) return 'Solo números'
        if (value.length !== 9) return 'Debe tener exactamente 9 dígitos'
        if (!value.startsWith('9')) return 'Debe empezar con 9'
        return ''
      case 'email':
        if (!value.trim()) return 'Requerido'
        return /^[a-zA-Z0-9._%+-]+@(gmail\.com|hotmail\.com)$/i.test(value)
          ? ''
          : 'Debe terminar en @gmail.com o @hotmail.com'
      default:
        return ''
    }
  }

  function handleChange(name, value) {
    let clean = value
    
    // Limpieza estricta solo para campos que son puramente numéricos
    if (['codigoPostal', 'telefono', 'numeroTarjeta', 'cvv', 'expiracion'].includes(name)) {
      clean = value.replace(/\D/g, '')
    }
    
    // Para nombre y ciudad se filtran únicamente símbolos raros y números, PERMITIENDO tildes
    if (['nombre', 'ciudad'].includes(name)) {
      clean = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '')
    }
    
    update(name, clean)
    const err = validateField(name, clean)
    setErrors((prev) => ({ ...prev, [name]: err }))
  }

  function validateForm() {
    const newErrors = {}
    
    // Validar datos de envío
    const errNombre = validateField('nombre', form.nombre)
    if (errNombre) newErrors.nombre = errNombre

    const errDireccion = validateField('direccion', form.direccion)
    if (errDireccion) newErrors.direccion = errDireccion

    const errCiudad = validateField('ciudad', form.ciudad)
    if (errCiudad) newErrors.ciudad = errCiudad

    const errCodigoPostal = validateField('codigoPostal', form.codigoPostal)
    if (errCodigoPostal) newErrors.codigoPostal = errCodigoPostal

    const errTelefono = validateField('telefono', form.telefono)
    if (errTelefono) newErrors.telefono = errTelefono

    const errEmail = validateField('email', form.email)
    if (errEmail) newErrors.email = errEmail

    // Validar tarjeta solo si se seleccionó ese método
    if (paymentMethod === 'Tarjeta') {
      if (!form.numeroTarjeta) newErrors.numeroTarjeta = 'Requerido'
      else if (form.numeroTarjeta.replace(/\s/g, '').length < 13) newErrors.numeroTarjeta = 'Número inválido'

      if (!form.expiracion) newErrors.expiracion = 'Requerido'
      else if (form.expiracion.length < 4) newErrors.expiracion = 'Fecha inválida'

      if (!form.cvv) newErrors.cvv = 'Requerido'
      else if (form.cvv.length < 3) newErrors.cvv = 'CVV inválido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    setProcessing(true)
    setError(null)

    try {
      const itemsPedido = items.map((item) => ({
        id_producto: item.id,
        producto_id: item.id,
        cantidad: item.quantity,
        precio_unitario: Number(item.price),
        subtotal: Number(item.price) * item.quantity,
      }))

      const resPedido = await API.post('/pedidos', {
        items: itemsPedido,
        nombre_envio: form.nombre,
        direccion_envio: form.direccion,
        ciudad_envio: form.ciudad,
        codigo_postal: form.codigoPostal,
        telefono_envio: form.telefono,
        email_envio: form.email,
        metodo_pago: paymentMethod,
        total: summary.total,
        subtotal: summary.subtotal,
        descuento: summary.discountAmount,
      })

      const pedidoCreado = resPedido.data

      const datosPago = { telefono: form.telefono }
      if (paymentMethod === 'Tarjeta') {
        datosPago.numeroTarjeta = form.numeroTarjeta ? form.numeroTarjeta.replace(/\s/g, '') : ''
        datosPago.expiracion = form.expiracion || ''
        datosPago.cvv = form.cvv || ''
      }

      const resPago = await API.post('/pagos/procesar', {
        pedido_id: pedidoCreado.id || pedidoCreado.pedido_id,
        metodo_pago: paymentMethod,
        datos_pago: datosPago,
        monto: summary.total,
      })

      // 📄 Generación de PDF
      try {
        const pedidoParaPDF = {
          ...pedidoCreado,
          subtotal: summary.subtotal,
          descuento: summary.discountAmount,
          total: summary.total,
          nombre_envio: form.nombre,
          direccion_envio: form.direccion,
          ciudad_envio: form.ciudad,
          telefono_envio: form.telefono,
          email_envio: form.email,
          metodo_pago: paymentMethod
        }
        generarComprobantePDF(pedidoParaPDF, items, paymentMethod, form.email)
      } catch (pdfErr) {
        console.warn("PDF no generado automáticamente:", pdfErr)
      }

      setTransaccionId(resPago.data?.transaccion_id || pedidoCreado.codigo || 'TX-' + Date.now())
      setCompleted(true)
      clearCart()
    } catch (err) {
      console.error("Error en flujo de compra:", err)
      const msg = err.response?.data?.error?.mensaje 
        || err.response?.data?.mensaje 
        || err.response?.data?.message 
        || 'Error al procesar el pedido y pago.'
      setError({ mensaje: msg })
    } finally {
      setProcessing(false)
    }
  }

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
              {transaccionId && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Transacción: <span className="font-mono text-emerald-400">{transaccionId}</span>
                </p>
              )}
              <p className="mt-3 text-sm font-light text-muted-foreground">
                Gracias por tu compra. Recibirás un correo con los detalles de envío a la brevedad.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Button className="h-11 rounded-full px-8 text-sm font-semibold" onClick={() => navigate('/')}>
                  Ir al Inicio
                </Button>
                <Button variant="outline" className="h-11 rounded-full px-8 text-sm font-semibold" onClick={() => navigate('/mis-pedidos')}>
                  Ver Mis Pedidos
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-muted">
            <ShoppingBag className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="font-['Oswald',sans-serif] text-3xl font-black uppercase tracking-tighter">
            Carrito Vacío
          </h2>
          <p className="mt-2 text-sm font-light text-muted-foreground">
            Agrega productos al carrito antes de proceder al pago.
          </p>
          <Button className="mt-8 h-11 rounded-full px-8" onClick={() => navigate('/catalogo')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Ir al Catálogo
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-white px-4 py-8 dark:from-zinc-950 dark:to-zinc-900 sm:px-6">
      <div className="mx-auto mb-8 flex max-w-6xl items-center justify-between">
        <button
          onClick={() => navigate('/catalogo')}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Volver
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

      <motion.div className="mx-auto max-w-6xl" variants={stagger} initial="hidden" animate="visible">
        <div className="grid gap-8 lg:grid-cols-5">
          <motion.div variants={fadeUp} className="lg:col-span-3">
            <h1 className="font-['Oswald',sans-serif] text-4xl font-black uppercase tracking-tighter sm:text-5xl">
              Checkout
            </h1>
            <p className="mt-2 text-sm font-light text-muted-foreground">
              Completa tus datos para finalizar la compra.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <Card className="overflow-hidden border-border/50">
                <div className="h-1 bg-gradient-to-r from-primary/50 to-primary" />
                <CardContent className="p-6 sm:p-8">
                  <h2 className="mb-6 flex items-center gap-2 text-base font-semibold">
                    <Truck className="h-4 w-4 text-muted-foreground" /> Información de Envío
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="nombre" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Nombre Completo *
                      </label>
                      <Input
                        id="nombre"
                        value={form.nombre}
                        onChange={(e) => handleChange('nombre', e.target.value)}
                        placeholder="Ej: María García"
                        className={`h-11 rounded-lg ${errors.nombre ? 'border-red-500' : 'border-border/50'}`}
                      />
                      {errors.nombre && <p className="mt-1 text-xs text-red-400">{errors.nombre}</p>}
                    </div>

                    <div>
                      <label htmlFor="direccion" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Dirección *
                      </label>
                      <Input
                        id="direccion"
                        value={form.direccion}
                        onChange={(e) => handleChange('direccion', e.target.value)}
                        placeholder="Ej: Av. Primavera 123"
                        className={`h-11 rounded-lg ${errors.direccion ? 'border-red-500' : 'border-border/50'}`}
                      />
                      {errors.direccion && <p className="mt-1 text-xs text-red-400">{errors.direccion}</p>}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="ciudad" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          Ciudad *
                        </label>
                        <Input
                          id="ciudad"
                          value={form.ciudad}
                          onChange={(e) => handleChange('ciudad', e.target.value)}
                          placeholder="Ej: Lima"
                          className={`h-11 rounded-lg ${errors.ciudad ? 'border-red-500' : 'border-border/50'}`}
                        />
                        {errors.ciudad && <p className="mt-1 text-xs text-red-400">{errors.ciudad}</p>}
                      </div>
                      <div>
                        <label htmlFor="codigoPostal" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          Código Postal *
                        </label>
                        <Input
                          id="codigoPostal"
                          value={form.codigoPostal}
                          onChange={(e) => handleChange('codigoPostal', e.target.value)}
                          placeholder="15001"
                          className={`h-11 rounded-lg ${errors.codigoPostal ? 'border-red-500' : 'border-border/50'}`}
                        />
                        {errors.codigoPostal && <p className="mt-1 text-xs text-red-400">{errors.codigoPostal}</p>}
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 pt-2">
                      <div>
                        <label htmlFor="telefono" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          Teléfono de Contacto (9 dígitos) *
                        </label>
                        <Input 
                          id="telefono"
                          placeholder="Ej: 912345678" 
                          maxLength={9}
                          value={form.telefono} 
                          onChange={(e) => handleChange('telefono', e.target.value)} 
                          className={`h-11 rounded-lg ${errors.telefono ? 'border-red-500' : 'border-border/50'}`}
                        />
                        {errors.telefono && <p className="mt-1 text-xs text-red-400">{errors.telefono}</p>}
                      </div>
                      <div>
                        <label htmlFor="email" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          Correo Electrónico (@gmail/@hotmail) *
                        </label>
                        <Input 
                          id="email"
                          type="email"
                          placeholder="Ej: usuario@gmail.com" 
                          value={form.email} 
                          onChange={(e) => handleChange('email', e.target.value)} 
                          className={`h-11 rounded-lg ${errors.email ? 'border-red-500' : 'border-border/50'}`}
                        />
                        {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden border-border/50">
                <div className="h-1 bg-gradient-to-r from-primary/50 to-primary" />
                <CardContent className="p-6 sm:p-8">
                  <h2 className="mb-6 flex items-center gap-2 text-base font-semibold">
                    <ShieldCheck className="h-4 w-4 text-muted-foreground" /> Método de Pago
                  </h2>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {[
                      { id: 'Tarjeta', icon: CreditCard, label: 'Tarjeta', desc: 'Visa · MasterCard · Amex' },
                      { id: 'Yape', icon: Smartphone, label: 'Yape', desc: 'Pago desde tu app Yape' },
                      { id: 'Plin', icon: Smartphone, label: 'Plin', desc: 'Pago desde tu app Plin' },
                      { id: 'PagoEfectivo', icon: Building2, label: 'PagoEfectivo', desc: 'Código de pago' },
                      { id: 'Transferencia', icon: Landmark, label: 'Transferencia', desc: 'Depósito bancario' },
                    ].map((m) => {
                      const Icon = m.icon
                      const active = paymentMethod === m.id
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setPaymentMethod(m.id)}
                          className={`group relative rounded-xl border-2 p-5 text-left transition-all ${
                            active ? 'border-primary bg-primary/5 shadow-sm' : 'border-border/50 hover:border-muted-foreground/30'
                          }`}
                        >
                          {active && (
                            <motion.div layoutId="payment-indicator" className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-primary" />
                          )}
                          <Icon className={`mb-3 h-6 w-6 ${active ? 'text-primary' : 'text-muted-foreground'}`} />
                          <p className="text-sm font-semibold">{m.label}</p>
                          <p className="mt-0.5 text-[11px] text-muted-foreground">{m.desc}</p>
                        </button>
                      )
                    })}
                  </div>

                  {paymentMethod === 'Tarjeta' && (
                    <div className="mt-4 space-y-4">
                      <div>
                        <label htmlFor="numeroTarjeta" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          Número de Tarjeta
                        </label>
                        <div className="relative">
                          <Input
                            id="numeroTarjeta"
                            value={formatCardNumber(form.numeroTarjeta)}
                            onChange={(e) => handleChange('numeroTarjeta', e.target.value.replace(/\s/g, ''))}
                            placeholder="Ej: 4111 1111 1111 1111"
                            className={`h-11 rounded-lg font-mono pr-10 ${errors.numeroTarjeta ? 'border-red-500' : 'border-border/50'}`}
                            maxLength={23}
                          />
                          {form.numeroTarjeta.length >= 4 && (() => {
                            const brand = detectCardBrand(form.numeroTarjeta)
                            return brand ? (
                              <span className="absolute right-3 top-1/2 -translate-y-1/2">
                                <CardLogo brand={brand} />
                              </span>
                            ) : null
                          })()}
                        </div>
                        {errors.numeroTarjeta && <p className="mt-1 text-xs text-red-400">{errors.numeroTarjeta}</p>}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="expiracion" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            Vencimiento
                          </label>
                          <Input
                            id="expiracion"
                            value={formatExpiry(form.expiracion)}
                            onChange={(e) => handleChange('expiracion', e.target.value.replace(/\D/g, ''))}
                            placeholder="MM/AA"
                            className={`h-11 rounded-lg font-mono ${errors.expiracion ? 'border-red-500' : 'border-border/50'}`}
                            maxLength={5}
                          />
                          {errors.expiracion && <p className="mt-1 text-xs text-red-400">{errors.expiracion}</p>}
                        </div>
                        <div>
                          <label htmlFor="cvv" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            CVV
                          </label>
                          <div className="relative">
                            <Input
                              id="cvv"
                              type={showCVV ? 'text' : 'password'}
                              value={form.cvv}
                              onChange={(e) => handleChange('cvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
                              placeholder="123"
                              className={`h-11 rounded-lg font-mono pr-10 ${errors.cvv ? 'border-red-500' : 'border-border/50'}`}
                              maxLength={4}
                            />
                            <button
                              type="button"
                              onClick={() => setShowCVV(!showCVV)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                              {showCVV ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                          {errors.cvv && <p className="mt-1 text-xs text-red-400">{errors.cvv}</p>}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {error && (
                <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4">
                  <div className="flex items-start gap-3">
                    <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" />
                    <div>
                      <p className="text-sm font-medium text-rose-400">Pago rechazado</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {error.mensaje || 'Error al procesar la orden'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

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
                  `Pagar S/${summary.total.toFixed(2)}`
                )}
              </Button>

              <p className="text-center text-[11px] text-muted-foreground">
                <ShieldCheck className="mr-1 inline-block h-3 w-3" /> Pago 100% seguro cifrado con SSL
              </p>
            </form>
          </motion.div>

          <motion.div variants={fadeUp} className="lg:col-span-2">
            <div className="sticky top-24">
              <Card className="overflow-hidden border-border/50">
                <div className="h-1 bg-gradient-to-r from-zinc-300 to-zinc-500 dark:from-zinc-700 dark:to-zinc-500" />
                <CardContent className="p-6 sm:p-8">
                  <h2 className="font-['Oswald',sans-serif] mb-6 text-lg font-semibold uppercase tracking-tight">
                    Resumen
                  </h2>

                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center gap-4">
                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-zinc-50 dark:bg-zinc-900">
                          <img
                            src={item.image || item.imagen_url || item.imagen}
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
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal ({summary.totalUnits} items)</span>
                      <span className="font-mono">S/{summary.subtotal.toFixed(2)}</span>
                    </div>

                    {summary.discountPercentage > 0 && (
                      <div className="flex justify-between text-emerald-500 font-medium">
                        <span>{summary.discountLabel}</span>
                        <span className="font-mono">-S/{summary.discountAmount.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-base font-bold pt-2 border-t">
                      <span>Total Final</span>
                      <span className="font-mono text-emerald-500">S/{summary.total.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col gap-2 rounded-xl bg-muted/50 p-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Truck className="h-3 w-3" /> Envío express 24/48h
                    </span>
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="h-3 w-3" /> Devolución gratuita
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