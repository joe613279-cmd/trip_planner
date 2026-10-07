const express = require('express');
const router = express.Router({ mergeParams: true });
const { readJSON, writeJSON } = require('../services/storage');

function getTrip(id) {
  const trips = readJSON('trips.json', []);
  const trip = trips.find(t => t.id === id);
  return { trips, trip };
}

// GET /api/trips/:id/packing - Get packing list with progress metrics
router.get('/', (req, res) => {
  try {
    const { trip } = getTrip(req.params.id);
    if (!trip) return res.status(404).json({ success: false, error: 'Trip not found' });

    const items = trip.packingList || [];
    const total = items.length;
    const packed = items.filter(i => i.packed).length;
    const percent = total > 0 ? Math.round((packed / total) * 100) : 0;

    // Group items by category
    const categories = {};
    items.forEach(i => {
      const cat = i.category || 'General';
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(i);
    });

    res.json({
      success: true,
      data: {
        total,
        packed,
        percent,
        categories,
        items
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/trips/:id/packing - Add packing item
router.post('/', (req, res) => {
  try {
    const { trips, trip } = getTrip(req.params.id);
    if (!trip) return res.status(404).json({ success: false, error: 'Trip not found' });

    const { item, category = 'Essentials', essential = false } = req.body;
    if (!item) return res.status(400).json({ success: false, error: 'Item name is required' });

    const newItem = {
      id: `pack-${Date.now()}`,
      category,
      item,
      packed: false,
      essential: Boolean(essential)
    };

    if (!trip.packingList) trip.packingList = [];
    trip.packingList.push(newItem);

    writeJSON('trips.json', trips);
    res.status(201).json({ success: true, data: newItem });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/trips/:id/packing/:packId - Toggle packed status or edit
router.put('/:packId', (req, res) => {
  try {
    const { trips, trip } = getTrip(req.params.id);
    if (!trip) return res.status(404).json({ success: false, error: 'Trip not found' });

    const item = (trip.packingList || []).find(p => p.id === req.params.packId);
    if (!item) return res.status(404).json({ success: false, error: 'Packing item not found' });

    Object.assign(item, req.body);
    writeJSON('trips.json', trips);

    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/trips/:id/packing/:packId - Remove item
router.delete('/:packId', (req, res) => {
  try {
    const { trips, trip } = getTrip(req.params.id);
    if (!trip) return res.status(404).json({ success: false, error: 'Trip not found' });

    const initialLength = (trip.packingList || []).length;
    trip.packingList = (trip.packingList || []).filter(p => p.id !== req.params.packId);

    if (trip.packingList.length === initialLength) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }

    writeJSON('trips.json', trips);
    res.json({ success: true, message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/trips/:id/packing/generate - Regenerate smart checklist
router.post('/generate', (req, res) => {
  try {
    const { trips, trip } = getTrip(req.params.id);
    if (!trip) return res.status(404).json({ success: false, error: 'Trip not found' });

    const destinations = readJSON('destinations.json', []);
    const dest = destinations.find(d => d.name.toLowerCase() === trip.destination.toLowerCase());
    const climate = dest ? dest.climate : 'Temperate';

    const packingTemplates = readJSON('packingTemplates.json', { baseEssentials: [], climateSpecific: {} });
    const climateItems = packingTemplates.climateSpecific[climate] || packingTemplates.climateSpecific.Temperate || [];

    const newItems = [
      ...packingTemplates.baseEssentials.map((it, idx) => ({
        id: `pack-gen-base-${Date.now()}-${idx}`,
        category: it.category,
        item: it.item,
        packed: false,
        essential: it.essential
      })),
      ...climateItems.map((it, idx) => ({
        id: `pack-gen-clim-${Date.now()}-${idx}`,
        category: it.category,
        item: it.item,
        packed: false,
        essential: it.essential
      }))
    ];

    trip.packingList = newItems;
    writeJSON('trips.json', trips);

    res.json({ success: true, count: newItems.length, data: newItems });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
