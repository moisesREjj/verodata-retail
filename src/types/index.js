export const ROLES = {
  ADMIN: 'ROLE_ADMIN',
  CLIENTE: 'ROLE_CLIENTE',
  ANALISTA: 'ROLE_ANALISTA',
}

export const METODOS_PAGO = [
  { id: 'Tarjeta', label: 'Tarjeta', icon: 'CreditCard', desc: 'Visa · MasterCard · Amex' },
  { id: 'Yape', label: 'Yape', icon: 'Smartphone', desc: 'Pago desde tu app Yape' },
  { id: 'Plin', label: 'Plin', icon: 'Smartphone', desc: 'Pago desde tu app Plin' },
  { id: 'PagoEfectivo', label: 'PagoEfectivo', icon: 'Landmark', desc: 'Código de pago' },
  { id: 'Transferencia', label: 'Transferencia', icon: 'Building2', desc: 'Depósito bancario' },
]

export const ERROR_TARJETAS_PRUEBA = [
  { numero: '4000000000000002', error: 'Fondos insuficientes' },
  { numero: '4000000000000003', error: 'Tarjeta vencida' },
  { numero: '4000000000000004', error: 'Transacción rechazada' },
  { numero: '4000000000000005', error: 'Límite excedido' },
]

export const ESTADOS_PEDIDO = {
  Carrito: { label: 'Carrito', color: 'bg-zinc-500/20 text-zinc-400' },
  Pagado: { label: 'Pagado', color: 'bg-emerald-500/20 text-emerald-400' },
  Enviado: { label: 'Enviado', color: 'bg-blue-500/20 text-blue-400' },
  Cancelado: { label: 'Cancelado', color: 'bg-red-500/20 text-red-400' },
}
