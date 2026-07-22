import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export const generarReporteEjecutivoPDF = (datos = {}) => {
  const {
    ventasTotales = 0,
    ticketPromedio = 0,
    clientesNuevos = 0,
    pedidos = [],
    topProductos = [],
    rangoFecha = 'Mes Actual'
  } = datos

  const doc = new jsPDF()
  const colorPrimario = [15, 23, 42] // Dark Slate / Zinc
  const colorAcento = [16, 185, 129] // Emerald / Verde
  const colorGris = [100, 116, 139]

  // --- ENCABEZADO ---
  doc.setFillColor(...colorPrimario)
  doc.rect(0, 0, 210, 32, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.text('VERODATA RETAIL', 14, 18)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('REPORTE EJECUTIVO DE INTELIGENCIA COMERCIAL', 14, 25)

  // Fecha de emisión
  const hoy = new Date().toLocaleDateString('es-PE')
  doc.setFontSize(8)
  doc.text(`Fecha de emisión: ${hoy}`, 150, 18)
  doc.text(`Periodo: ${rangoFecha}`, 150, 24)

  // --- RESUMEN DE KPIS ---
  let yPos = 42

  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...colorPrimario)
  doc.text('1. Resumen Ejecutivo de Desempeño', 14, yPos)

  yPos += 8

  // Cajas de KPIs
  const kpis = [
    { title: 'Ventas Totales', value: `S/ ${Number(ventasTotales).toLocaleString('es-PE', { minimumFractionDigits: 2 })}` },
    { title: 'Ticket Promedio', value: `S/ ${Number(ticketPromedio).toLocaleString('es-PE', { minimumFractionDigits: 2 })}` },
    { title: 'Nuevos Clientes', value: `+${clientesNuevos}` }
  ]

  let xPos = 14
  const boxWidth = 58
  const boxHeight = 20

  kpis.forEach((kpi) => {
    doc.setFillColor(248, 250, 252)
    doc.setDrawColor(226, 232, 240)
    doc.roundedRect(xPos, yPos, boxWidth, boxHeight, 2, 2, 'FD')

    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...colorGris)
    doc.text(kpi.title, xPos + 6, yPos + 7)

    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...colorAcento)
    doc.text(kpi.value, xPos + 6, yPos + 15)

    xPos += boxWidth + 4
  })

  yPos += boxHeight + 12

  // --- TABLA 1: TOP PRODUCTOS MÁS VENDIDOS ---
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...colorPrimario)
  doc.text('2. Productos Top en Ventas', 14, yPos)

  yPos += 4

  const productosFilas = (topProductos || []).slice(0, 5).map((prod, index) => [
    `#${index + 1}`,
    prod.nombre || prod.product_name || 'Producto General',
    prod.categoria || 'General',
    prod.cantidad_vendida || prod.vendidos || 0,
    `S/ ${Number(prod.total_recaudado || prod.monto || 0).toFixed(2)}`
  ])

  autoTable(doc, {
    startY: yPos,
    head: [['Rank', 'Producto', 'Categoría', 'Unidades', 'Recaudado']],
    body: productosFilas.length > 0 ? productosFilas : [['-', 'No hay datos disponibles', '-', '-', '-']],
    theme: 'grid',
    headStyles: { fillColor: colorPrimario, textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 8 },
    margin: { left: 14, right: 14 }
  })

  // Obtener la posición final de la primera tabla
  yPos = (doc.lastAutoTable ? doc.lastAutoTable.finalY : yPos + 20) + 12

  // --- TABLA 2: ÚLTIMAS TRANSACCIONES ---
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...colorPrimario)
  doc.text('3. Registro Reciente de Pedidos', 14, yPos)

  yPos += 4

  const pedidosFilas = (pedidos || []).slice(0, 8).map((p) => [
    p.codigo || `ORD-${p.id}`,
    p.usuarios?.nombre || p.nombre_envio || 'Cliente',
    new Date(p.created_at || p.fecha || Date.now()).toLocaleDateString('es-PE'),
    p.estado || 'Pagado',
    `S/ ${Number(p.total || 0).toFixed(2)}`
  ])

  // Corregido: Se usa autoTable(doc, ...) en lugar de doc.autoTable(...)
  autoTable(doc, {
    startY: yPos,
    head: [['Código', 'Cliente', 'Fecha', 'Estado', 'Total']],
    body: pedidosFilas.length > 0 ? pedidosFilas : [['-', 'Sin transacciones', '-', '-', '-']],
    theme: 'striped',
    headStyles: { fillColor: colorGris, textColor: [255, 255, 255] },
    styles: { fontSize: 8 },
    margin: { left: 14, right: 14 }
  })

  // --- PIE DE PÁGINA ---
  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(...colorGris)
    doc.text(
      'VeroData Retail - Documento generado para rol: ROLE_ANALISTA',
      14,
      doc.internal.pageSize.height - 10
    )
    doc.text(
      `Página ${i} de ${pageCount}`,
      doc.internal.pageSize.width - 25,
      doc.internal.pageSize.height - 10
    )
  }

  // Descargar el archivo PDF
  doc.save(`Reporte_Ejecutivo_VeroData_${new Date().toISOString().slice(0, 10)}.pdf`)
}