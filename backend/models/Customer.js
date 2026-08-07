import mongoose from 'mongoose'

const customerSchema = new mongoose.Schema(
  {
    mobile: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: [/^\d{10}$/, 'Mobile must be a 10-digit number'],
    },
    name: { type: String, default: '', trim: true },
    orderHistory: { type: [String], default: [] },
    loyaltyPoints: { type: Number, default: 0, min: 0 },
    totalSpend: { type: Number, default: 0, min: 0 },
    orderCount: { type: Number, default: 0, min: 0 },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

export default mongoose.model('Customer', customerSchema)
