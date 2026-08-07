import mongoose from 'mongoose'

const wastageSchema = new mongoose.Schema(
  {
    itemName: { type: String, required: true, trim: true },
    inventoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory' },
    quantity: { type: Number, required: true, min: 0 },
    reason: { type: String, required: true, trim: true },
    loggedBy: { type: String, default: 'Staff' },
  },
  { timestamps: true }
)

export default mongoose.model('Wastage', wastageSchema)
