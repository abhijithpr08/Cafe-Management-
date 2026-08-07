import { jsPDF } from 'jspdf'
import * as XLSX from 'xlsx'

export const formatINR = (value) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(
    Number(value || 0)
  )

export const downloadCSV = (rows, filename = 'report.csv') => {
  if (!rows?.length) return
  const headers = Object.keys(rows[0])
  const csv = [
    headers.join(','),
    ...rows.map((row) =>
      headers
        .map((h) => {
          const val = row[h] ?? ''
          const str = typeof val === 'object' ? JSON.stringify(val) : String(val)
          return `"${str.replace(/"/g, '""')}"`
        })
        .join(',')
    ),
  ].join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export const downloadXLSX = (rows, filename = 'report.xlsx', sheetName = 'Report') => {
  if (!rows?.length) return
  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, sheetName)
  XLSX.writeFile(wb, filename)
}

export const downloadPDFTable = (title, rows, filename = 'report.pdf') => {
  const doc = new jsPDF()
  doc.setFontSize(14)
  doc.text(title, 14, 18)
  doc.setFontSize(9)
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 26)

  if (!rows?.length) {
    doc.text('No data', 14, 40)
    doc.save(filename)
    return
  }

  const headers = Object.keys(rows[0])
  let y = 36
  doc.text(headers.join(' | ').slice(0, 95), 14, y)
  y += 6
  rows.slice(0, 40).forEach((row) => {
    const line = headers.map((h) => row[h]).join(' | ').slice(0, 95)
    if (y > 280) {
      doc.addPage()
      y = 20
    }
    doc.text(String(line), 14, y)
    y += 6
  })
  doc.save(filename)
}

/** Generate a simple bill PDF for an order */
export const downloadBillPDF = (order, businessName = 'RestroPOS') => {
  const doc = new jsPDF()
  doc.setFontSize(16)
  doc.text(businessName, 14, 18)
  doc.setFontSize(10)
  doc.text(`Order: ${order.orderId}`, 14, 28)
  doc.text(`Table: ${order.table || '-'}`, 14, 34)
  doc.text(`Date: ${new Date(order.createdAt).toLocaleString()}`, 14, 40)
  doc.text(`Type: ${order.orderType || 'Dine-in'}`, 14, 46)

  let y = 56
  doc.text('Item', 14, y)
  doc.text('Qty', 90, y)
  doc.text('Amt', 130, y)
  y += 6
  ;(order.items || []).forEach((item) => {
    doc.text(String(item.name).slice(0, 40), 14, y)
    doc.text(String(item.qty), 90, y)
    doc.text(`Rs ${(item.price || 0) * item.qty}`, 130, y)
    y += 6
  })
  y += 4
  if (order.discountApplied?.discountAmount) {
    doc.text(`Discount: Rs ${order.discountApplied.discountAmount}`, 14, y)
    y += 6
  }
  if (order.tax?.total) {
    doc.text(`Tax: Rs ${order.tax.total}`, 14, y)
    y += 6
  }
  doc.setFontSize(12)
  doc.text(`Grand Total: Rs ${order.total}`, 14, y + 4)
  doc.save(`bill-${order.orderId}.pdf`)
}

export const buildWhatsAppBillLink = (phone, order) => {
  const digits = String(phone || '').replace(/\D/g, '')
  const lines = [
    `*${'RestroPOS'} E-Bill*`,
    `Order: ${order.orderId}`,
    `Table: ${order.table || '-'}`,
    ...(order.items || []).map((i) => `• ${i.name} x${i.qty} = ₹${(i.price || 0) * i.qty}`),
    `Total: ₹${order.total}`,
    `Thank you!`,
  ]
  const text = encodeURIComponent(lines.join('\n'))
  const num = digits.length === 10 ? `91${digits}` : digits
  return `https://wa.me/${num}?text=${text}`
}

export const buildSmsBillText = (order) =>
  `RestroPOS Bill ${order.orderId}: Total ₹${order.total}. Items: ${(order.items || [])
    .map((i) => `${i.name}x${i.qty}`)
    .join(', ')}. Thank you!`

export const buildEmailBillText = (order) => ({
  subject: `Your RestroPOS E-Bill — ${order.orderId}`,
  body: `Dear Guest,\n\nPlease find your bill summary:\nOrder ID: ${order.orderId}\nTable: ${order.table || '-'}\nTotal: ₹${order.total}\n\nItems:\n${(order.items || [])
    .map((i) => `- ${i.name} x ${i.qty} = ₹${(i.price || 0) * i.qty}`)
    .join('\n')}\n\nThank you for dining with us!\nRestroPOS`,
})
