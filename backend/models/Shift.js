import mongoose from 'mongoose'

const shiftSchema = new mongoose.Schema(
  {
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    employeeName: { type: String, required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    shift: {
      type: String,
      enum: ['Morning', 'Afternoon', 'Evening', 'Night'],
      required: true,
    },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
)

export default mongoose.model('Shift', shiftSchema)
