import mongoose from 'mongoose'

const stockAdjustmentSchema = new mongoose.Schema(
  {
    itemName: { type: String, required: true, trim: true },
    inventoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory' },
    adjustment: { type: Number, required: true }, // +/- quantity
    reason: { type: String, required: true, trim: true },
    adjustedBy: { type: String, default: 'Staff' },
  },
  { timestamps: true }
)

export default mongoose.model('StockAdjustment', stockAdjustmentSchema)
