/** GST configuration — CGST + SGST (percentages). */
export const TAX_CONFIG = {
  cgstPercent: Number(process.env.CGST_PERCENT) || 5,
  sgstPercent: Number(process.env.SGST_PERCENT) || 5,
}

export const calculateTax = (subtotalAfterDiscount) => {
  const cgst = (subtotalAfterDiscount * TAX_CONFIG.cgstPercent) / 100
  const sgst = (subtotalAfterDiscount * TAX_CONFIG.sgstPercent) / 100
  return {
    cgst: Math.round(cgst * 100) / 100,
    sgst: Math.round(sgst * 100) / 100,
    total: Math.round((cgst + sgst) * 100) / 100,
    cgstPercent: TAX_CONFIG.cgstPercent,
    sgstPercent: TAX_CONFIG.sgstPercent,
  }
}
