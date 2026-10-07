const express = require('express');
const router = express.Router();
const { readJSON, writeJSON } = require('../services/storage');
const { generateSmartItinerary } = require('../services/plannerEngine');
const { optionalAuth } = require('../middleware/auth');

router.use(optionalAuth);

// Helper to get trip or 404
function findTrip(trips, id) {
  return trips.find(t => t.id === id);
}

// GET /api/trips - List all trips
router.get('/', (req, res) => {
  try {
    const trips = readJSON('trips.json', []);
    // Calculate summary statistics
    const summary = trips.map(t => {
      const totalActivities = (t.days || []).reduce((acc, d) => acc + (d.activities || []).length, 0);
      const completedActivities = (t.days || []).reduce((acc, d) => acc + (d.activities || []).filter(a => a.completed).length, 0);
      const totalExpenses = (t.expenses || []).reduce((acc, e) => acc + Number(e.amount || 0), 0);
      const totalPacking = (t.packingList || []).length;
      const packedItems = (t.packingList || []).filter(p => p.packed).length;

      return {
        id: t.id,
        title: t.title,
        destination: t.destination,
        country: t.country,
        flag: t.flag,
        startDate: t.startDate,
        endDate: t.endDate,
        coverImage: t.coverImage,
        travelStyle: t.travelStyle,
        status: t.status || 'Upcoming',
        budget: t.budget || 0,
        currency: t.currency || 'USD',
        daysCount: (t.days || []).length,
        totalActivities,
        completedActivities,
        totalExpenses,
        totalPacking,
        packedItems
      };
    });

    res.json({ success: true, count: trips.length, data: summary });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/trips/:id - Single trip full details
router.get('/:id', (req, res) => {
  try {
    const trips = readJSON('trips.json', []);
    const trip = findTrip(trips, req.params.id);

    if (!trip) {
      return res.status(404).json({ success: false, error: 'Trip not found' });
    }

    res.json({ success: true, data: trip });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/trips - Create new trip (with optional auto-generation)
router.post('/', (req, res) => {
  try {
    const trips = readJSON('trips.json', []);
    const {
      title,
      destination,
      startDate,
      endDate,
      travelStyle,
      budget,
      currency = 'USD',
      notes = '',
      coverImage,
      autoGenerate = false,
      interests = []
    } = req.body;

    if (!destination || !startDate) {
      return res.status(400).json({ success: false, error: 'Destination and start date are required' });
    }

    const tripId = `trip-${Date.now()}`;
    let days = [];
    let packingList = [];
    let flag = '✈️';
    let country = '';
    let resolvedImage = coverImage;

    if (autoGenerate) {
      const generated = generateSmartItinerary({
        destination,
        startDate,
        endDate,
        travelStyle,
        budget,
        interests
      });
      days = generated.days;
      packingList = generated.packingList;
      flag = generated.meta.flag;
      country = generated.meta.country;
      if (!resolvedImage) resolvedImage = generated.meta.coverImage;
    } else {
      // Create empty day 1
      days = [
        {
          dayNumber: 1,
          date: startDate,
          title: 'Arrival & Check-in',
          activities: []
        }
      ];
    }

    if (!resolvedImage) {
      resolvedImage = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80';
    }

    const newTrip = {
      id: tripId,
      userId: req.user ? req.user.id : null,
      createdBy: req.user ? req.user.name : 'Explorer',
      title: title || `${destination} Adventure`,
      destination,
      country,
      flag,
      startDate,
      endDate: endDate || startDate,
      coverImage: resolvedImage,
      travelStyle: travelStyle || 'Cultural Explorer',
      status: 'Upcoming',
      budget: Number(budget || 0),
      currency,
      notes,
      days,
      expenses: [],
      packingList
    };

    trips.unshift(newTrip);
    writeJSON('trips.json', trips);

    res.status(201).json({ success: true, data: newTrip });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/trips/:id - Update trip metadata
router.put('/:id', (req, res) => {
  try {
    const trips = readJSON('trips.json', []);
    const index = trips.findIndex(t => t.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Trip not found' });
    }

    const current = trips[index];
    const updated = {
      ...current,
      ...req.body,
      // Preserve core arrays if not explicitly provided
      days: req.body.days || current.days,
      expenses: req.body.expenses || current.expenses,
      packingList: req.body.packingList || current.packingList
    };

    trips[index] = updated;
    writeJSON('trips.json', trips);

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/trips/:id - Delete trip
router.delete('/:id', (req, res) => {
  try {
    let trips = readJSON('trips.json', []);
    const initialLength = trips.length;
    trips = trips.filter(t => t.id !== req.params.id);

    if (trips.length === initialLength) {
      return res.status(404).json({ success: false, error: 'Trip not found' });
    }

    writeJSON('trips.json', trips);
    res.json({ success: true, message: 'Trip deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- DAY & ACTIVITY SUB-ROUTES ---

// POST /api/trips/:id/days - Add a new day to trip
router.post('/:id/days', (req, res) => {
  try {
    const trips = readJSON('trips.json', []);
    const trip = findTrip(trips, req.params.id);
    if (!trip) return res.status(404).json({ success: false, error: 'Trip not found' });

    const dayNumber = (trip.days || []).length + 1;
    const startDate = new Date(trip.startDate);
    startDate.setDate(startDate.getDate() + (dayNumber - 1));
    const formattedDate = startDate.toISOString().split('T')[0];

    const newDay = {
      dayNumber,
      date: req.body.date || formattedDate,
      title: req.body.title || `Day ${dayNumber} Exploration`,
      activities: []
    };

    trip.days.push(newDay);
    writeJSON('trips.json', trips);

    res.status(201).json({ success: true, data: newDay, trip });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/trips/:id/days/:dayNumber - Delete a day
router.delete('/:id/days/:dayNumber', (req, res) => {
  try {
    const trips = readJSON('trips.json', []);
    const trip = findTrip(trips, req.params.id);
    if (!trip) return res.status(404).json({ success: false, error: 'Trip not found' });

    const targetDay = Number(req.params.dayNumber);
    trip.days = (trip.days || []).filter(d => d.dayNumber !== targetDay);
    // Re-index remaining days
    trip.days.forEach((d, idx) => {
      d.dayNumber = idx + 1;
    });

    writeJSON('trips.json', trips);
    res.json({ success: true, data: trip.days });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/trips/:id/activities - Add activity to a day
router.post('/:id/activities', (req, res) => {
  try {
    const trips = readJSON('trips.json', []);
    const trip = findTrip(trips, req.params.id);
    if (!trip) return res.status(404).json({ success: false, error: 'Trip not found' });

    const {
      dayNumber = 1,
      title,
      time = '10:00',
      category = 'Sightseeing',
      location = '',
      lat,
      lng,
      cost = 0,
      notes = ''
    } = req.body;

    if (!title) return res.status(400).json({ success: false, error: 'Activity title is required' });

    const day = (trip.days || []).find(d => d.dayNumber === Number(dayNumber));
    if (!day) return res.status(404).json({ success: false, error: `Day ${dayNumber} not found` });

    const newActivity = {
      id: `act-${Date.now()}`,
      time,
      title,
      category,
      location,
      lat: lat ? Number(lat) : null,
      lng: lng ? Number(lng) : null,
      cost: Number(cost || 0),
      notes,
      completed: false
    };

    day.activities.push(newActivity);
    // Sort activities by time
    day.activities.sort((a, b) => (a.time || '').localeCompare(b.time || ''));

    writeJSON('trips.json', trips);
    res.status(201).json({ success: true, data: newActivity, trip });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/trips/:id/activities/:actId - Edit activity
router.put('/:id/activities/:actId', (req, res) => {
  try {
    const trips = readJSON('trips.json', []);
    const trip = findTrip(trips, req.params.id);
    if (!trip) return res.status(404).json({ success: false, error: 'Trip not found' });

    let updatedActivity = null;
    for (const day of trip.days || []) {
      const act = (day.activities || []).find(a => a.id === req.params.actId);
      if (act) {
        Object.assign(act, req.body);
        if (req.body.lat) act.lat = Number(req.body.lat);
        if (req.body.lng) act.lng = Number(req.body.lng);
        if (req.body.cost !== undefined) act.cost = Number(req.body.cost);
        updatedActivity = act;
        break;
      }
    }

    if (!updatedActivity) {
      return res.status(404).json({ success: false, error: 'Activity not found' });
    }

    writeJSON('trips.json', trips);
    res.json({ success: true, data: updatedActivity, trip });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/trips/:id/activities/:actId - Delete activity
router.delete('/:id/activities/:actId', (req, res) => {
  try {
    const trips = readJSON('trips.json', []);
    const trip = findTrip(trips, req.params.id);
    if (!trip) return res.status(404).json({ success: false, error: 'Trip not found' });

    let found = false;
    for (const day of trip.days || []) {
      const initialLength = day.activities.length;
      day.activities = day.activities.filter(a => a.id !== req.params.actId);
      if (day.activities.length < initialLength) {
        found = true;
        break;
      }
    }

    if (!found) {
      return res.status(404).json({ success: false, error: 'Activity not found' });
    }

    writeJSON('trips.json', trips);
    res.json({ success: true, message: 'Activity deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
