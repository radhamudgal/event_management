/**
 * auth.controller.js — Register and Login
 * register → creates a new user (participant or organizer only; admin via seed)
 * login    → verifies credentials, returns JWT token
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

// Create and sign a JWT containing user info
const signToken = (user) =>
  jwt.sign(
    { id: user._id.toString(), email: user.email, name: user.name, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

// POST /api/auth/register
export async function register(req, res) {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) return res.status(400).json({ message: 'All fields required' });
  if (password.length < 6) return res.status(400).json({ message: 'Password min 6 chars' });
  if (await User.findOne({ email: email.toLowerCase() })) return res.status(409).json({ message: 'Email already in use' });

  const allowedRoles = ['organizer', 'participant'];
  const user = await User.create({
    name, email: email.toLowerCase(),
    passwordHash: await bcrypt.hash(password, 10),
    role: allowedRoles.includes(role) ? role : 'participant'
  });

  res.status(201).json({ token: signToken(user), user: { id: user._id, name: user.name, email: user.email, role: user.role } });
}

// POST /api/auth/login
export async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !(await bcrypt.compare(password, user.passwordHash)))
    return res.status(401).json({ message: 'Invalid credentials' });

  res.json({ token: signToken(user), user: { id: user._id, name: user.name, email: user.email, role: user.role } });
}
