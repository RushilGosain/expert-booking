const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    expertId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Expert',
      required: true,
    },
    expertName: { type: String, required: true },
    userName: { type: String, required: true, trim: true },
    userEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email'],
    },
    userPhone: { type: String, required: true, trim: true },
    date: { type: String, required: true },       // "YYYY-MM-DD"
    timeSlot: { type: String, required: true },   // "10:00-11:00"
    notes: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
      default: 'Pending',
    },
  },
  { timestamps: true }
);

// Compound index to enforce uniqueness (prevent double booking)
bookingSchema.index(
  { expertId: 1, date: 1, timeSlot: 1 },
  { unique: true, partialFilterExpression: { status: { $ne: 'Cancelled' } } }
);

module.exports = mongoose.model('Booking', bookingSchema);