import mongoose from 'mongoose'

const discountSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      trim: true,
    },
    value: {
      type: Number,
      required: true,
      min: 0,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    validTill: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
)

const Discount = mongoose.model('Discount', discountSchema)

export default Discount
