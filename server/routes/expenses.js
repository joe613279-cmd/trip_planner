const express = require('express');
const router = express.Router({ mergeParams: true });
const { readJSON, writeJSON } = require('../services/storage');

// Helper to get trip
function getTrip(id) {
  const trips = readJSON('trips.json', []);
  const trip = trips.find(t => t.id === id);
  return { trips, trip };
}

// GET /api/trips/:id/expenses - Fetch expenses with category aggregations
router.get('/', (req, res) => {
  try {
    const { trip } = getTrip(req.params.id);
    if (!trip) return res.status(404).json({ success: false, error: 'Trip not found' });

    const expenses = trip.expenses || [];
    const totalSpent = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
    const budget = Number(trip.budget || 0);
    const remaining = budget - totalSpent;
    const percentSpent = budget > 0 ? Math.min(Math.round((totalSpent / budget) * 100), 100) : 0;

    // Breakdown by category
    const byCategory = {};
    expenses.forEach(e => {
      const cat = e.category || 'Other';
      byCategory[cat] = (byCategory[cat] || 0) + Number(e.amount || 0);
    });

    res.json({
      success: true,
      data: {
        budget,
        currency: trip.currency || 'USD',
        totalSpent,
        remaining,
        percentSpent,
        byCategory,
        expenses
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/trips/:id/expenses - Add an expense
router.post('/', (req, res) => {
  try {
    const { trips, trip } = getTrip(req.params.id);
    if (!trip) return res.status(404).json({ success: false, error: 'Trip not found' });

    const { title, category = 'Food & Dining', amount, currency, date, paidBy = 'Credit Card', notes = '' } = req.body;

    if (!title || amount === undefined) {
      return res.status(400).json({ success: false, error: 'Expense title and amount are required' });
    }

    const newExpense = {
      id: `exp-${Date.now()}`,
      title,
      category,
      amount: Number(amount),
      currency: currency || trip.currency || 'USD',
      date: date || new Date().toISOString().split('T')[0],
      paidBy,
      notes
    };

    if (!trip.expenses) trip.expenses = [];
    trip.expenses.unshift(newExpense);

    writeJSON('trips.json', trips);
    res.status(201).json({ success: true, data: newExpense });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/trips/:id/expenses/:expId - Edit an expense
router.put('/:expId', (req, res) => {
  try {
    const { trips, trip } = getTrip(req.params.id);
    if (!trip) return res.status(404).json({ success: false, error: 'Trip not found' });

    const expIndex = (trip.expenses || []).findIndex(e => e.id === req.params.expId);
    if (expIndex === -1) {
      return res.status(404).json({ success: false, error: 'Expense not found' });
    }

    const updated = {
      ...trip.expenses[expIndex],
      ...req.body,
      amount: req.body.amount !== undefined ? Number(req.body.amount) : trip.expenses[expIndex].amount
    };

    trip.expenses[expIndex] = updated;
    writeJSON('trips.json', trips);

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/trips/:id/expenses/:expId - Delete an expense
router.delete('/:expId', (req, res) => {
  try {
    const { trips, trip } = getTrip(req.params.id);
    if (!trip) return res.status(404).json({ success: false, error: 'Trip not found' });

    const initialLength = (trip.expenses || []).length;
    trip.expenses = (trip.expenses || []).filter(e => e.id !== req.params.expId);

    if (trip.expenses.length === initialLength) {
      return res.status(404).json({ success: false, error: 'Expense not found' });
    }

    writeJSON('trips.json', trips);
    res.json({ success: true, message: 'Expense deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
