import mongoose from 'mongoose'

/** Singleton business settings document */
const settingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'business', unique: true },
    businessName: { type: String, default: 'RestroPOS Cafe' },
    address: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    logoUrl: { type: String, default: '' },
    gstin: { type: String, default: '' },
    cgstPercent: { type: Number, default: 5 },
    sgstPercent: { type: Number, default: 5 },
    gstPercent: { type: Number, default: 10 },
    paymentMethods: {
      Cash: { type: Boolean, default: true },
      UPI: { type: Boolean, default: true },
      'Credit Card': { type: Boolean, default: true },
      'Debit Card': { type: Boolean, default: true },
      Wallet: { type: Boolean, default: true },
      'Split Payment': { type: Boolean, default: true },
    },
    kitchenPrinter: { name: { type: String, default: '' }, ip: { type: String, default: '' } },
    billingPrinter: { name: { type: String, default: '' }, ip: { type: String, default: '' } },
  },
  { timestamps: true }
)

export default mongoose.model('Settings', settingsSchema)
