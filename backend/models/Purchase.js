import mongoose from 'mongoose'

const purchaseSchema = new mongoose.Schema(
  {
    itemName: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 0 },
    unit: { type: String, default: 'kg' },
    cost: { type: Number, required: true, min: 0 },
    supplier: { type: String, required: true, trim: true },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
    purchaseDate: { type: Date, default: Date.now },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
)

export default mongoose.model('Purchase', purchaseSchema)
