import { jsPDF } from 'jspdf'
import { calculateOrderSummary } from '@/lib/discounts'

export const generarComprobantePDF = (pedido, itemsComprados = [], metodo, emailCliente) => {
  try {
    const doc = new jsPDF()

    // 1️⃣ Normalización flexible de lista de items
    const rawItems = itemsComprados.length > 0 ? itemsComprados : (pedido.items || pedido.detalles || [])

    const listaItems = rawItems.map(item => ({
      nombre: item.name || item.nombre || item.productos?.nombre || item.producto?.nombre || 'Producto',
      cantidad: Number(item.quantity || item.cantidad || 1),
      precio: Number(item.price || item.precio_unitario || 0)
    }))

    // 2️⃣ Cálculo de Subtotal, Descuentos y Ahorro usando calculateOrderSummary
    const summary = calculateOrderSummary(listaItems.map(i => ({ price: i.precio, quantity: i.cantidad })))

    const subtotal = Number(pedido.subtotal || summary.subtotal)
    const total = Number(pedido.total || summary.total)
    const descuento = Number(pedido.descuento || summary.discountAmount)
    const porcentajeDescuento = summary.discountPercentage || (subtotal > 0 ? Math.round((descuento / subtotal) * 100) : 0)

    // 3️⃣ ENCABEZADO
    doc.setFont("Helvetica", "bold")
    doc.setFontSize(22)
    doc.text("VERODATA RETAIL", 14, 20)
    
    doc.setFontSize(10)
    doc.setFont("Helvetica", "normal")
    doc.text(`Código de Pedido: ${pedido.codigo || pedido.codigo_pedido || 'ORD-000000'}`, 14, 28)
    doc.text(`Fecha: ${new Date(pedido.created_at || pedido.fecha || new Date()).toLocaleDateString()}`, 14, 34)
    doc.text(`Método de Pago: ${metodo || pedido.metodo_pago || 'Tarjeta'}`, 14, 40)

    // 4️⃣ INFORMACIÓN DE ENVÍO Y CONTACTO
    doc.setFont("Helvetica", "bold")
    doc.text("INFORMACIÓN DE ENVÍO Y CONTACTO", 14, 52)
    doc.line(14, 54, 196, 54)
    
    doc.setFont("Helvetica", "normal")
    doc.text(`Cliente: ${pedido.nombre_envio || pedido.cliente_nombre || 'Cliente'}`, 14, 60)
    doc.text(`Dirección: ${pedido.direccion_envio || pedido.direccion || ''}${pedido.ciudad_envio ? ', ' + pedido.ciudad_envio : ''}`, 14, 66)
    doc.text(`Teléfono: ${pedido.telefono_envio || pedido.telefono || 'No registrado'}`, 14, 72)
    doc.text(`Correo: ${emailCliente || pedido.email_envio || pedido.usuarios?.email || 'No registrado'}`, 14, 78)

    // 5️⃣ DETALLE DE PRODUCTOS
    doc.setFont("Helvetica", "bold")
    doc.text("DETALLE DE COMPRA", 14, 92)
    doc.line(14, 94, 196, 94)

    let y = 102
    doc.setFontSize(9)
    doc.text("Producto", 14, y)
    doc.text("Cant.", 140, y)
    doc.text("P. Unit.", 160, y)
    doc.text("Subtotal", 180, y)
    doc.line(14, y + 2, 196, y + 2)
    
    y += 10
    doc.setFont("Helvetica", "normal")

    listaItems.forEach((item) => {
      doc.text(item.nombre.substring(0, 42), 14, y)
      doc.text(`${item.cantidad}`, 142, y)
      doc.text(`S/ ${item.precio.toFixed(2)}`, 160, y)
      doc.text(`S/ ${(item.cantidad * item.precio).toFixed(2)}`, 180, y)
      y += 8
    })

    // 6️⃣ RESUMEN DE TOTALES Y MOSTRAR DESCUENTO SI APLICA
    doc.line(14, y, 196, y)
    y += 8

    doc.setFontSize(10)
    doc.setFont("Helvetica", "normal")
    doc.text(`Subtotal: S/ ${subtotal.toFixed(2)}`, 140, y)

    if (descuento > 0) {
      y += 6
      doc.setTextColor(16, 185, 129) // Color Verde Emerald
      doc.setFont("Helvetica", "bold")
      doc.text(`Descuento (${porcentajeDescuento}%): -S/ ${descuento.toFixed(2)}`, 122, y)
      
      y += 5
      doc.setFont("Helvetica", "italic")
      doc.setFontSize(9)
      doc.text(`¡Ahorraste S/ ${descuento.toFixed(2)} en esta compra!`, 122, y)
      
      // Restaurar estilos normales
      doc.setTextColor(0, 0, 0)
      doc.setFontSize(10)
    }

    y += 8
    doc.setFont("Helvetica", "bold")
    doc.setFontSize(12)
    doc.text(`TOTAL PAGADO: S/ ${total.toFixed(2)}`, 125, y)

    // 7️⃣ DESCARGA AUTOMÁTICA
    const codigoFinal = pedido.codigo || pedido.codigo_pedido || 'COMPROBANTE'
    doc.save(`Comprobante-${codigoFinal}.pdf`)
  } catch (error) {
    console.error("Error al generar el comprobante PDF:", error)
  }
}