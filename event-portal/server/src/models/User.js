// User model — stores name, email, hashed password, and role
// role can be: 'admin' | 'organizer' | 'participant'
// Admin has full control, organizer creates events, participant attends events

import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    passwordHash: { type: String, required: true },
    // Three roles: admin (full control), organizer (manage own events), participant (attend events)
    role: {
      type: String,
      enum: ['admin', 'organizer', 'participant'],
      default: 'participant'
    }
  },
  { timestamps: true }
);

export const User = mongoose.model('User', userSchema);
