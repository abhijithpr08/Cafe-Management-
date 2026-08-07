import mongoose from 'mongoose'

const vendorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    contact: { type: String, default: '', trim: true },
    email: { type: String, default: '', trim: true },
    itemsSupplied: { type: [String], default: [] },
    address: { type: String, default: '' },
  },
  { timestamps: true }
)

export default mongoose.model('Vendor', vendorSchema)
