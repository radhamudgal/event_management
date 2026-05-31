// Auth controller — handles user registration and login
// register: creates a new user (only 'organizer' or 'participant' roles allowed on self-register)
// login: verifies credentials and returns a JWT token

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

// Helper: create a signed JWT with user info in the payload
function signToken(user) {
  return jwt.sign(
    {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

// POST /api/auth/register
// Accepts: name, email, password, role (optional — only 'organizer' or 'participant')
export async function register(req, res) {
  const { name, email, password, role } = req.body;

  // Validate required fields
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'name, email, and password are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  // Only allow participant or organizer on self-register (admin cannot be created via API)
  const allowedRoles = ['organizer', 'participant'];
  const assignedRole = allowedRoles.includes(role) ? role : 'participant';

  // Check if email is already taken
  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) return res.status(409).json({ message: 'Email already in use' });

  // Hash the password before storing
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash,
    role: assignedRole
  });

  // Return token immediately so user is logged in after registering
  const token = signToken(user);
  res.status(201).json({
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role }
  });
}

// POST /api/auth/login
// Accepts: email, password
// Returns: JWT token + user info
export async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'email and password are required' });
  }

  // Find user by email
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  // Compare password with stored hash
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

  const token = signToken(user);
  res.json({
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role }
  });
}
