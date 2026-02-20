const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema({
  date: { type: String, required: true }, // "YYYY-MM-DD"
  startTime: { type: String, required: true }, // "10:00"
  endTime: { type: String, required: true },   // "11:00"
  isBooked: { type: Boolean, default: false },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', default: null },
});

const expertSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ['Technology', 'Business', 'Design', 'Marketing', 'Finance', 'Health', 'Legal', 'Education'],
    },
    experience: { type: Number, required: true, min: 0 }, // years
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    bio: { type: String, default: '' },
    avatar: { type: String, default: '' },
    hourlyRate: { type: Number, required: true },
    skills: [{ type: String }],
    timeSlots: [timeSlotSchema],
  },
  { timestamps: true }
);

expertSchema.index({ name: 'text', category: 1 });

module.exports = mongoose.model('Expert', expertSchema);