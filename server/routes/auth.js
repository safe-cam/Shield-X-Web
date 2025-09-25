import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/UserR.js';
import authMiddleware from '../middleware/authmiddleware.js';


const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  const { username, password, name } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'username and password required' });
  const hashed = await bcrypt.hash(password, 10);
  try {
    const nameVal = (typeof name === 'string' && name.trim().length > 0) ? name.trim() : username;
    const user = await User.create({ username, password: hashed, name: nameVal });
    return res.status(201).json({ message: 'User registered', user: { id: user._id, username: user.username, name: user.name } });
  } catch (e) {
    console.error('Register error', e && e.message ? e.message : e);
    // Duplicate key (username) -> 409
    if (e && e.code === 11000) {
      return res.status(409).json({ message: 'Username already exists' });
    }
    return res.status(400).json({ message: e.message || 'Registration failed' });
  }
});

// Debug: list mongoose models
// ...existing code...

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET not set in environment');
    return res.status(500).json({ message: 'Server misconfiguration' });
  }
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });  // After 1 hour, the token becomes invalid
  res.json({ token, user: { id: user._id, username: user.username, name: user.name } });
});


// Protected route: return current user info (uses authMiddleware)
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json({ user: { id: user._id, username: user.username, name: user.name, email: user.email, contact: user.contact, avatar: user.avatar, dobDay: user.dobDay, dobMonth: user.dobMonth, dobYear: user.dobYear, gender: user.gender, contacts: user.contacts } });
  } catch (err) {
    console.error('Get /me error', err && err.message ? err.message : err);
    return res.status(500).json({ message: 'Server error' });
  }
});


// Update profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const updates = {};
    const allowed = ['name', 'email', 'contact', 'avatar', 'dobDay', 'dobMonth', 'dobYear', 'gender', 'contacts', 'username'];
    for (const k of allowed) if (req.body[k] !== undefined) updates[k] = req.body[k];
    const user = await User.findByIdAndUpdate(req.user.id, { $set: updates }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json({ user: { id: user._id, username: user.username, name: user.name, email: user.email, contact: user.contact, avatar: user.avatar, dobDay: user.dobDay, dobMonth: user.dobMonth, dobYear: user.dobYear, gender: user.gender, contacts: user.contacts } });
  } catch (err) {
    console.error('Update profile error', err && err.message ? err.message : err);
    return res.status(500).json({ message: 'Server error' });
  }
});



export default router;
