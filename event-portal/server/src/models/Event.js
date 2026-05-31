// Event model — each event belongs to an organizer (createdBy)
// createdBy links to the User who created the event (organizer or admin)
// organizer field is a display name string (e.g. "JSConf Inc.")

import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    location: { type: String, default: '', trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    capacity: { type: Number, required: true, min: 1 },
    // Display name of the organizer (free text, e.g. "JSConf Inc.")
    organizer: { type: String, default: '', trim: true },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'completed'],
      default: 'active'
    },
    // Reference to the User who created this event (organizer or admin)
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
);

export const Event = mongoose.model('Event', eventSchema);
