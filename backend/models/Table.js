import mongoose from 'mongoose'

const reservationSchema = new mongoose.Schema(
  {
    customerName: { type: String, default: '' },
    phone: { type: String, default: '' },
    reservedFor: { type: Date },
    notes: { type: String, default: '' },
  },
  { _id: false }
)

const tableSchema = new mongoose.Schema(
  {
    tableNumber: { type: String, required: true, unique: true, trim: true },
    capacity: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: ['Available', 'Occupied', 'Reserved'],
      default: 'Available',
    },
    floor: { type: String, required: true, trim: true },
    reservation: { type: reservationSchema, default: undefined },
    mergedWith: { type: [String], default: [] },
    activeOrderId: { type: String, default: '' },
  },
  { timestamps: true }
)

export default mongoose.model('Table', tableSchema)
