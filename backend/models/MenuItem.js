import mongoose from 'mongoose'

const menuItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    veg: {
      type: Boolean,
      default: true,
    },
    available: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
)

const MenuItem = mongoose.model('MenuItem', menuItemSchema)

export default MenuItem
