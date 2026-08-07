import mongoose from 'mongoose'

const orderItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    qty: { type: Number, required: true, min: 1 },
    price: { type: Number, min: 0 },
    sku: { type: String, default: '' },
  },
  { _id: false }
)

const paymentDetailSchema = new mongoose.Schema(
  {
    method: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
  },
  { _id: false }
)

const discountAppliedSchema = new mongoose.Schema(
  {
    code: String,
    name: String,
    type: String,
    value: Number,
    discountAmount: Number,
  },
  { _id: false }
)

const taxSchema = new mongoose.Schema(
  {
    cgst: Number,
    sgst: Number,
    total: Number,
    cgstPercent: Number,
    sgstPercent: Number,
  },
  { _id: false }
)

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true },
    orderType: {
      type: String,
      enum: ['Dine-in', 'Takeaway', 'Delivery', 'Complimentary'],
      default: 'Dine-in',
    },
    table: { type: String, default: '' },
    mergedTables: { type: [String], default: [] },
    items: { type: [orderItemSchema], default: [] },
    status: {
      type: String,
      enum: ['Preparing', 'Served', 'Ready', 'Completed', 'Cancelled'],
      default: 'Preparing',
    },
    cancelReason: { type: String, default: '' },
    total: { type: Number, required: true, min: 0 },
    waiter: { type: String, default: 'Staff' },
    customerMobile: { type: String, trim: true, default: '' },
    customerName: { type: String, trim: true, default: '' },
    customerPhone: { type: String, trim: true, default: '' },
    customerAddress: { type: String, trim: true, default: '' },
    complimentaryReason: { type: String, default: '' },
    discountApplied: discountAppliedSchema,
    tax: taxSchema,
    subtotal: { type: Number, min: 0 },
    paymentDetails: { type: [paymentDetailSchema], default: [] },
    paymentStatus: { type: String, enum: ['Pending', 'Paid'], default: 'Pending' },
    orderSource: { type: String, enum: ['POS', 'QR'], default: 'POS' },
    splitFrom: { type: String, default: '' },
    transferredFrom: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

export default mongoose.model('Order', orderSchema)
