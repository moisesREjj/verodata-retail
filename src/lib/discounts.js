/**
 * Calcula el porcentaje de descuento e importe con base en la cantidad total de unidades o por ítem
 */
export function getVolumeDiscount(totalItems) {
  if (totalItems >= 1000) {
    return { percentage: 30, label: 'Descuento por Millar (-30%)' }
  }
  if (totalItems >= 100) {
    return { percentage: 20, label: 'Descuento por Centenar (-20%)' }
  }
  if (totalItems >= 12) {
    return { percentage: 15, label: 'Descuento por Docena (-15%)' }
  }
  return { percentage: 0, label: 'Sin Descuento' }
}

export function calculateOrderSummary(cartItems) {
  const subtotal = cartItems.reduce((acc, item) => acc + Number(item.price) * item.quantity, 0)
  const totalUnits = cartItems.reduce((acc, item) => acc + item.quantity, 0)
  
  const discountInfo = getVolumeDiscount(totalUnits)
  const discountAmount = (subtotal * discountInfo.percentage) / 100
  const total = subtotal - discountAmount

  return {
    subtotal,
    totalUnits,
    discountPercentage: discountInfo.percentage,
    discountLabel: discountInfo.label,
    discountAmount,
    total,
  }
}