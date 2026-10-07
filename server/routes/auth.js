const express = require('express');
const router = express.Router();
const { readJSON, writeJSON } = require('../services/storage');
const { generateSalt, hashPassword, verifyPassword, generateToken } = require('../services/auth');
const { authenticateToken } = require('../middleware/auth');

// POST /api/auth/register - Register a new user (Explorer or Admin)
router.post('/register', (req, res) => {
  try {
    const { name, email, password, role = 'user' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
    }

    const users = readJSON('users.json', []);
    const normalizedEmail = email.trim().toLowerCase();

    if (users.some(u => u.email.toLowerCase() === normalizedEmail)) {
      return res.status(409).json({ success: false, error: 'An account with this email already exists' });
    }

    const salt = generateSalt();
    const hash = hashPassword(password, salt);
    const token = generateToken();
    const assignedRole = (role === 'admin') ? 'admin' : 'user';

    const newUser = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: normalizedEmail,
      salt,
      hash,
      role: assignedRole,
      createdAt: new Date().toISOString(),
      tokens: [token]
    };

    users.push(newUser);
    writeJSON('users.json', users);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/auth/login - Log in with email and password
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    const users = readJSON('users.json', []);
    const normalizedEmail = email.trim().toLowerCase();
    const user = users.find(u => u.email.toLowerCase() === normalizedEmail);

    if (!user || !verifyPassword(password, user.salt, user.hash)) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const token = generateToken();
    if (!user.tokens) user.tokens = [];
    user.tokens.push(token);
    // Keep max 5 active tokens per user
    if (user.tokens.length > 5) user.tokens = user.tokens.slice(-5);

    writeJSON('users.json', users);

    res.json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role || 'user'
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/auth/logout - Invalidate session token
router.post('/logout', authenticateToken, (req, res) => {
  try {
    const users = readJSON('users.json', []);
    const user = users.find(u => u.id === req.user.id);
    if (user && user.tokens) {
      user.tokens = user.tokens.filter(t => t !== req.token);
      writeJSON('users.json', users);
    }
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/auth/me - Retrieve current authenticated profile
router.get('/me', authenticateToken, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

module.exports = router;
