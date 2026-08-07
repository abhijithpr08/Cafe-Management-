import mongoose from 'mongoose'

const attendanceSchema = new mongoose.Schema(
  {
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    employeeName: { type: String, required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    checkIn: { type: Date },
    checkOut: { type: Date },
    status: { type: String, enum: ['Present', 'Absent', 'Half Day'], default: 'Present' },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
)

attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true })

export default mongoose.model('Attendance', attendanceSchema)
