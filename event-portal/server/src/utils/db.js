/**
 * db.js — MongoDB connection
 * Tries to connect to real MongoDB first.
 * Falls back to in-memory MongoDB (for demo) and seeds 3 test users.
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/event-portal';
  mongoose.set('strictQuery', true);

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 2500 });
    console.log('✅ MongoDB connected');
  } catch {
    // No local MongoDB — start in-memory fallback
    console.warn('⚠️  Using in-memory MongoDB (demo mode)');
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());
    console.log('✅ In-memory MongoDB ready');
    await seedUsers();
  }
}

// Seeds 3 demo users when using in-memory DB
async function seedUsers() {
  // Inline schema avoids circular import issues
  const UserModel = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
    name: String, email: { type: String, unique: true, lowercase: true },
    passwordHash: String,
    role: { type: String, enum: ['admin', 'organizer', 'participant'], default: 'participant' }
  }, { timestamps: true }));

  if (await UserModel.countDocuments()) return; // already seeded

  const hash = (pw) => bcrypt.hash(pw, 10);
  await UserModel.insertMany([
    { name: 'Admin User',      email: 'admin@evently.com',     passwordHash: await hash('admin123'), role: 'admin' },
    { name: 'Event Organizer', email: 'organizer@evently.com', passwordHash: await hash('org1234'),  role: 'organizer' },
    { name: 'Participant',     email: 'user@evently.com',      passwordHash: await hash('user1234'), role: 'participant' },
  ]);
  console.log('🌱 Demo users seeded — admin / organizer / user');
}
