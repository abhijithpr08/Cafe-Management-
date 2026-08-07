import mongoose from 'mongoose'

const orderItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    qty: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { _id: false }
)

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    table: {
      type: String,
      required: true,
    },
    items: {
      type: [orderItemSchema],
      default: [],
    },
    status: {
      type: String,
      enum: ['Preparing', 'Served', 'Ready', 'Completed'],
      default: 'Preparing',
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    waiter: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
)

const Order = mongoose.model('Order', orderSchema)

export default Order
