const express = require('express');
const router = express.Router();
const { readJSON, writeJSON } = require('../services/storage');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// All routes require valid auth token with 'admin' role
router.use(authenticateToken, requireAdmin);

// GET /api/admin/stats - Overview metrics across platform
router.get('/stats', (req, res) => {
  try {
    const users = readJSON('users.json', []);
    const trips = readJSON('trips.json', []);
    const destinations = readJSON('destinations.json', []);

    const totalUsers = users.length;
    const adminCount = users.filter(u => u.role === 'admin').length;
    const userCount = users.filter(u => u.role !== 'admin').length;
    const totalTrips = trips.length;
    const totalBudget = trips.reduce((sum, t) => sum + Number(t.budget || 0), 0);
    const totalDestinations = destinations.length;

    res.json({
      success: true,
      data: {
        totalUsers,
        adminCount,
        userCount,
        totalTrips,
        totalBudget,
        totalDestinations
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/admin/users - List all users with statistics
router.get('/users', (req, res) => {
  try {
    const users = readJSON('users.json', []);
    const trips = readJSON('trips.json', []);

    const userList = users.map(u => {
      const userTrips = trips.filter(t => t.userId === u.id);
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role || 'user',
        createdAt: u.createdAt,
        tripsCount: userTrips.length
      };
    });

    res.json({ success: true, count: userList.length, data: userList });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/admin/users/:id/role - Toggle / update user role
router.put('/users/:id/role', (req, res) => {
  try {
    const { role } = req.body;
    if (!role || !['admin', 'user'].includes(role)) {
      return res.status(400).json({ success: false, error: 'Valid role (admin or user) is required' });
    }

    const users = readJSON('users.json', []);
    const user = users.find(u => u.id === req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Prevent removing the last admin
    if (user.role === 'admin' && role !== 'admin') {
      const remainingAdmins = users.filter(u => u.role === 'admin' && u.id !== user.id).length;
      if (remainingAdmins === 0) {
        return res.status(400).json({ success: false, error: 'Cannot demote the last remaining administrator' });
      }
    }

    user.role = role;
    writeJSON('users.json', users);

    res.json({
      success: true,
      message: `User role updated to ${role}`,
      data: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/admin/users/:id - Delete a user account
router.delete('/users/:id', (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ success: false, error: 'You cannot delete your own admin account' });
    }

    let users = readJSON('users.json', []);
    const initialLen = users.length;
    users = users.filter(u => u.id !== req.params.id);

    if (users.length === initialLen) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    writeJSON('users.json', users);

    // Optionally cleanup user's trips
    let trips = readJSON('trips.json', []);
    trips = trips.filter(t => t.userId !== req.params.id);
    writeJSON('trips.json', trips);

    res.json({ success: true, message: 'User account and associated trips deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/admin/destinations - Add new curated destination
router.post('/destinations', (req, res) => {
  try {
    const { name, country, region, tagline, description, coverImage, lat, lng, climate, currency, averageDailyCost } = req.body;

    if (!name || !country) {
      return res.status(400).json({ success: false, error: 'Destination name and country are required' });
    }

    const destinations = readJSON('destinations.json', []);
    const newDest = {
      id: `dest-${Date.now()}`,
      name: name.trim(),
      country: country.trim(),
      region: region || 'Global',
      flag: '📍',
      tagline: tagline || `Discover the beauty of ${name}`,
      description: description || `Experience the sights, culture, and cuisine of ${name}, ${country}.`,
      coverImage: coverImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80',
      lat: Number(lat || 0),
      lng: Number(lng || 0),
      climate: climate || 'Temperate',
      currency: currency || 'USD',
      currencySymbol: '$',
      averageDailyCost: Number(averageDailyCost || 120),
      tags: ['Culture', 'Sightseeing'],
      travelStyles: ['Cultural Explorer', 'Modern Urbanite'],
      attractions: [],
      tips: ['Explore historic center on foot.'],
      weather: {
        temperature: 22,
        condition: 'Sunny',
        forecast: [
          { day: 'Mon', high: 23, low: 14, condition: 'Sunny' },
          { day: 'Tue', high: 24, low: 15, condition: 'Clear' }
        ]
      }
    };

    destinations.push(newDest);
    writeJSON('destinations.json', destinations);

    res.status(201).json({ success: true, data: newDest });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/admin/destinations/:id - Delete destination from catalog
router.delete('/destinations/:id', (req, res) => {
  try {
    let destinations = readJSON('destinations.json', []);
    const initialLen = destinations.length;
    destinations = destinations.filter(d => d.id !== req.params.id);

    if (destinations.length === initialLen) {
      return res.status(404).json({ success: false, error: 'Destination not found' });
    }

    writeJSON('destinations.json', destinations);
    res.json({ success: true, message: 'Destination removed from catalog' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
