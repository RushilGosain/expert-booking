const mongoose = require('mongoose');
const { validationResult } = require('express-validator');
const Booking = require('../models/Booking');
const Expert = require('../models/Expert');

// POST /bookings
exports.createBooking = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { expertId, userName, userEmail, userPhone, date, timeSlot, notes } = req.body;
  const session = await mongoose.startSession();

  try {
    let result;
    await session.withTransaction(async () => {
      // Lock the expert document and check slot atomically
      const expert = await Expert.findOneAndUpdate(
        {
          _id: expertId,
          'timeSlots.date': date,
          'timeSlots.startTime': timeSlot.split('-')[0],
          'timeSlots.endTime': timeSlot.split('-')[1],
          'timeSlots.isBooked': false,
        },
        {
          $set: {
            'timeSlots.$[slot].isBooked': true,
          },
        },
        {
          arrayFilters: [{ 'slot.date': date, 'slot.startTime': timeSlot.split('-')[0], 'slot.isBooked': false }],
          new: true,
          session,
        }
      );

      if (!expert) {
        const err = new Error('This time slot is no longer available');
        err.statusCode = 409;
        throw err;
      }

      const booking = new Booking({
        expertId,
        expertName: expert.name,
        userName,
        userEmail,
        userPhone,
        date,
        timeSlot,
        notes,
        status: 'Pending',
      });

      await booking.save({ session });

      // Link booking to the slot
      await Expert.updateOne(
        { _id: expertId, 'timeSlots.date': date, 'timeSlots.startTime': timeSlot.split('-')[0] },
        { $set: { 'timeSlots.$.bookingId': booking._id } },
        { session }
      );

      result = booking;
    });

    // Emit real-time slot update via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.to(`expert:${expertId}`).emit('slotBooked', {
        expertId,
        date,
        timeSlot,
        isBooked: true,
      });
    }

    res.status(201).json({ success: true, data: result, message: 'Booking created successfully!' });
  } catch (err) {
    if (err.code === 11000 || err.statusCode === 409) {
      return res.status(409).json({ success: false, message: 'This time slot is already booked. Please choose another.' });
    }
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  } finally {
    await session.endSession();
  }
};

// GET /bookings?email=
exports.getBookingsByEmail = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    const bookings = await Booking.find({ userEmail: email.toLowerCase() }).sort({ createdAt: -1 });
    res.json({ success: true, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// PATCH /bookings/:id/status
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Status must be one of: ${validStatuses.join(', ')}` });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    // If cancelled, free up the slot
    if (status === 'Cancelled') {
      await Expert.updateOne(
        { _id: booking.expertId, 'timeSlots.bookingId': booking._id },
        { $set: { 'timeSlots.$.isBooked': false, 'timeSlots.$.bookingId': null } }
      );

      const io = req.app.get('io');
      if (io) {
        io.to(`expert:${booking.expertId}`).emit('slotReleased', {
          expertId: booking.expertId,
          date: booking.date,
          timeSlot: booking.timeSlot,
          isBooked: false,
        });
      }
    }

    res.json({ success: true, data: booking, message: 'Status updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};