import mongoose from 'mongoose'

const tableSchema = new mongoose.Schema(
  {
    tableNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: ['Available', 'Occupied', 'Reserved'],
      default: 'Available',
    },
    floor: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
)

const Table = mongoose.model('Table', tableSchema)

export default Table
