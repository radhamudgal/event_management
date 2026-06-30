/**
 * Registration.js — Registration model
 * Links a user to an event. One registration per user per event (unique index).
 * status: confirmed (active) | cancelled
 */

import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema({
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User',  required: true },
  eventId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  ticketType: { type: String, default: 'standard', trim: true },
  notes:      { type: String, default: '', trim: true },
  status:     { type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed' }
}, { timestamps: true });

// Prevent duplicate registrations
registrationSchema.index({ userId: 1, eventId: 1 }, { unique: true });

export const Registration = mongoose.model('Registration', registrationSchema);
