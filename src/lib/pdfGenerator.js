import { jsPDF } from 'jspdf'

export const generarComprobantePDF = (pedido, itemsComprados, metodo, emailCliente) => {
  const doc = new jsPDF()

  // Encabezado
  doc.setFont("Helvetica", "bold")
  doc.setFontSize(22)
  doc.text("VERODATA RETAIL", 14, 20)
  
  doc.setFontSize(10)
  doc.setFont("Helvetica", "normal")
  doc.text(`Código de Pedido: ${pedido.codigo}`, 14, 28)
  doc.text(`Fecha: ${new Date(pedido.created_at || new Date()).toLocaleDateString()}`, 14, 34)
  doc.text(`Método de Pago: ${metodo || pedido.metodo_pago || 'Tarjeta'}`, 14, 40)

  // Información de Envío y Contacto Completa
  doc.setFont("Helvetica", "bold")
  doc.text("INFORMACIÓN DE ENVÍO Y CONTACTO", 14, 52)
  doc.line(14, 54, 196, 54)
  
  doc.setFont("Helvetica", "normal")
  doc.text(`Cliente: ${pedido.nombre_envio}`, 14, 60)
  doc.text(`Dirección: ${pedido.direccion_envio}, ${pedido.ciudad_envio}`, 14, 66)
  doc.text(`Teléfono: ${pedido.telefono_envio || 'No registrado'}`, 14, 72)
  doc.text(`Correo: ${emailCliente || pedido.usuarios?.email || 'No registrado'}`, 14, 78)

  // Detalle de Productos
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
  
  // Mapeo flexible para adaptarse tanto al carrito como a la base de datos
  const listaItems = itemsComprados.map(item => ({
    nombre: item.name || item.productos?.nombre || 'Producto',
    cantidad: item.quantity || item.cantidad || 1,
    precio: item.price || Number(item.precio_unitario) || 0
  }))

  listaItems.forEach((item) => {
    doc.text(item.nombre.substring(0, 45), 14, y)
    doc.text(`${item.cantidad}`, 142, y)
    doc.text(`S/ ${item.precio.toFixed(2)}`, 160, y)
    doc.text(`S/ ${(item.cantidad * item.precio).toFixed(2)}`, 180, y)
    y += 8
  })

  // Total
  doc.line(14, y, 196, y)
  doc.setFont("Helvetica", "bold")
  doc.setFontSize(12)
  doc.text(`TOTAL PAGADO: S/ ${Number(pedido.total).toFixed(2)}`, 135, y + 10)

  doc.save(`Comprobante-${pedido.codigo}.pdf`)
}