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
    /** Food image URL (Unsplash / CDN). Optional — UI falls back to placeholder. */
    image: {
      type: String,
      default: '',
      trim: true,
    },
    /** Barcode / SKU for quick billing lookup */
    sku: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { timestamps: true, collection: 'menuItems' }
)

const MenuItem = mongoose.model('MenuItem', menuItemSchema)

export default MenuItem
