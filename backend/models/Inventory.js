import mongoose from 'mongoose'

const inventorySchema = new mongoose.Schema(
  {
    itemName: {
      type: String,
      required: true,
      trim: true,
    },
    unit: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    reorderLevel: {
      type: Number,
      required: true,
      min: 0,
    },
    supplier: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
)

const Inventory = mongoose.model('Inventory', inventorySchema)

export default Inventory
