/**
 * User.js — User model
 * Stores account info. Three roles:
 *   admin       → full control
 *   organizer   → creates & manages own events
 *   participant → browses & registers for events
 */

import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name:         { type: String, required: true, trim: true },
  email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role:         { type: String, enum: ['admin', 'organizer', 'participant'], default: 'participant' }
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);
