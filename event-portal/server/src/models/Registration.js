// Registration model — links a user to an event
// Each user can only register once per event (unique index on userId + eventId)
// status: 'confirmed' means active, 'cancelled' means the user cancelled

import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema(
  {
    // The user who registered
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    // The event they registered for
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true
    },
    // Ticket type: 'standard' or 'vip'
    ticketType: { type: String, default: 'standard', trim: true },
    // Optional notes from the attendee (dietary needs, accessibility, etc.)
    notes: { type: String, default: '', trim: true },
    // Registration status
    status: {
      type: String,
      enum: ['confirmed', 'cancelled'],
      default: 'confirmed'
    }
  },
  { timestamps: true }
);

// Prevent duplicate registrations — one user per event
registrationSchema.index({ userId: 1, eventId: 1 }, { unique: true });

export const Registration = mongoose.model('Registration', registrationSchema);
