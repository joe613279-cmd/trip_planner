const express = require('express');
const router = express.Router();
const { generateSmartItinerary } = require('../services/plannerEngine');

// POST /api/ai-plan/generate - Generate smart itinerary preview
router.post('/generate', (req, res) => {
  try {
    const { destination, startDate, endDate, travelStyle, budget, interests } = req.body;

    if (!destination) {
      return res.status(400).json({ success: false, error: 'Destination is required' });
    }

    const result = generateSmartItinerary({
      destination,
      startDate: startDate || new Date().toISOString().split('T')[0],
      endDate,
      travelStyle,
      budget,
      interests
    });

    res.json({
      success: true,
      data: result
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
