/**
 * Seed script — populates the database with demo users and events.
 * Run with: npm run seed
 *
 * Credentials:
 *   Admin:     admin@evently.com / admin123
 *   Organizer: organizer@evently.com / org1234
 *   User:      user@evently.com / user1234
 */

import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/event-portal';

// ── Inline schemas (avoids circular import issues in seed context) ──────────

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['admin', 'organizer', 'participant'], default: 'participant' }
  },
  { timestamps: true }
);

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    location: { type: String, default: '', trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    capacity: { type: Number, required: true, min: 1 },
    organizer: { type: String, default: '', trim: true },
    status: { type: String, enum: ['active', 'cancelled', 'completed'], default: 'active' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);
const Event = mongoose.model('Event', eventSchema);

// ── Seed users ───────────────────────────────────────────────────────────────

const USERS = [
  { name: 'Admin User', email: 'admin@evently.com', password: 'admin123', role: 'admin' },
  { name: 'Event Organizer', email: 'organizer@evently.com', password: 'org1234', role: 'organizer' },
  { name: 'Jane Doe', email: 'user@evently.com', password: 'user1234', role: 'participant' }
];

// ── Helper: create a date N days from now ───────────────────────────────────

const now = new Date();
const d = (daysFromNow, hours = 10) => {
  const dt = new Date(now);
  dt.setDate(dt.getDate() + daysFromNow);
  dt.setHours(hours, 0, 0, 0);
  return dt;
};

// ── Seed events (createdBy will be set to organizer user's _id) ─────────────

function buildEvents(organizerId) {
  return [
    {
      title: 'Fullstack JavaScript Summit 2026',
      description:
        'Join 500+ developers for a two-day deep dive into modern JavaScript, React 19, Node.js performance, and edge computing. Featuring keynotes from industry leaders and hands-on workshops.',
      location: 'Silicon Valley Convention Center, CA',
      startDate: d(7, 9),
      endDate: d(8, 18),
      capacity: 500,
      organizer: 'JSConf Inc.',
      status: 'active',
      createdBy: organizerId
    },
    {
      title: 'AI & Machine Learning Expo',
      description:
        'Explore the latest breakthroughs in artificial intelligence, large language models, and practical ML deployment. Network with researchers and engineers shaping the future of AI.',
      location: 'New York Tech Hub, NY',
      startDate: d(14, 10),
      endDate: d(14, 17),
      capacity: 300,
      organizer: 'AI Forward Labs',
      status: 'active',
      createdBy: organizerId
    },
    {
      title: 'Cloud & DevOps World 2026',
      description:
        'A premier conference covering Kubernetes, CI/CD pipelines, infrastructure-as-code, and platform engineering. Hands-on labs and certification prep sessions included.',
      location: 'Seattle Convention Center, WA',
      startDate: d(21, 8),
      endDate: d(22, 17),
      capacity: 400,
      organizer: 'CloudNative Foundation',
      status: 'active',
      createdBy: organizerId
    },
    {
      title: 'UX & Product Design Meetup',
      description:
        'Monthly meetup for designers, product managers, and UX researchers. This month: design systems at scale, accessibility-first design, and live portfolio critiques.',
      location: 'Austin Design Studio, TX',
      startDate: d(5, 18),
      endDate: d(5, 21),
      capacity: 80,
      organizer: 'DesignHub Austin',
      status: 'active',
      createdBy: organizerId
    },
    {
      title: 'Cybersecurity & Ethical Hacking Workshop',
      description:
        'Hands-on workshop covering penetration testing, OWASP Top 10, secure coding practices, and incident response. Bring your laptop — CTF challenges included.',
      location: 'Online / Remote',
      startDate: d(10, 14),
      endDate: d(10, 18),
      capacity: 150,
      organizer: 'SecureCode Academy',
      status: 'active',
      createdBy: organizerId
    },
    {
      title: 'Startup Pitch Night — Spring 2026',
      description:
        'Watch 12 early-stage startups pitch to a panel of VCs and angel investors. Open networking session follows. Great opportunity for founders, investors, and job seekers.',
      location: 'San Francisco Startup Hub, CA',
      startDate: d(3, 19),
      endDate: d(3, 22),
      capacity: 200,
      organizer: 'Founders Network SF',
      status: 'active',
      createdBy: organizerId
    }
  ];
}

// ── Main seed function ───────────────────────────────────────────────────────

async function seed() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
  console.log('Connected.');

  // Clear existing data
  await User.deleteMany({});
  await Event.deleteMany({});
  console.log('Cleared existing users and events.');

  // Create users and collect their IDs
  const createdUsers = {};
  for (const u of USERS) {
    const passwordHash = await bcrypt.hash(u.password, 10);
    const user = await User.create({ name: u.name, email: u.email, passwordHash, role: u.role });
    createdUsers[u.role] = user._id;
    console.log(`  Created ${u.role}: ${u.email} (password: ${u.password})`);
  }

  // Create events — all owned by the organizer user
  const events = buildEvents(createdUsers['organizer']);
  for (const ev of events) {
    await Event.create(ev);
    console.log(`  Created event: "${ev.title}"`);
  }

  console.log('\n✅ Seed complete!');
  console.log('   Admin:     admin@evently.com / admin123');
  console.log('   Organizer: organizer@evently.com / org1234');
  console.log('   User:      user@evently.com / user1234');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
