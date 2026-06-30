/**
 * Event.js — Event model
 * Each event is created by an organizer or admin (tracked via createdBy).
 * organizer field is a display string e.g. "JSConf Inc."
 */

import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  description: { type: String, default: '', trim: true },
  location:    { type: String, default: '', trim: true },
  startDate:   { type: Date, required: true },
  endDate:     { type: Date, required: true },
  capacity:    { type: Number, required: true, min: 1 },
  organizer:   { type: String, default: '', trim: true },  // display name
  status:      { type: String, enum: ['active', 'cancelled', 'completed'], default: 'active' },
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export const Event = mongoose.model('Event', eventSchema);
