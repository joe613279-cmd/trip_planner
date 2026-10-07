const express = require('express');
const router = express.Router();
const { readJSON } = require('../services/storage');

// GET /api/destinations - List curated destinations with optional search and style filter
router.get('/', (req, res) => {
  try {
    let destinations = readJSON('destinations.json', []);
    const { q, style, climate } = req.query;

    if (q) {
      const query = q.toLowerCase();
      destinations = destinations.filter(d => 
        d.name.toLowerCase().includes(query) ||
        d.country.toLowerCase().includes(query) ||
        d.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    if (style) {
      destinations = destinations.filter(d => 
        d.travelStyles && d.travelStyles.includes(style)
      );
    }

    if (climate) {
      destinations = destinations.filter(d => 
        d.climate && d.climate.toLowerCase() === climate.toLowerCase()
      );
    }

    res.json({ success: true, count: destinations.length, data: destinations });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/destinations/:id - Retrieve single destination
router.get('/:id', (req, res) => {
  try {
    const destinations = readJSON('destinations.json', []);
    const destination = destinations.find(d => d.id === req.params.id);

    if (!destination) {
      return res.status(404).json({ success: false, error: 'Destination not found' });
    }

    res.json({ success: true, data: destination });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/destinations/:id/weather - Get forecast for destination
router.get('/:id/weather', (req, res) => {
  try {
    const destinations = readJSON('destinations.json', []);
    const destination = destinations.find(d => d.id === req.params.id);

    if (!destination || !destination.weather) {
      return res.status(404).json({ success: false, error: 'Weather data not found for destination' });
    }

    res.json({
      success: true,
      destination: destination.name,
      country: destination.country,
      weather: destination.weather
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
