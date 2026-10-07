import React, { useState } from 'react';
import { DollarSign, Plus, Trash2, AlertTriangle, PieChart, CreditCard, Tag, Calendar, X } from 'lucide-react';
import { useTrips } from '../context/TripContext';

const EXPENSE_CATEGORIES = [
  'Accommodation',
  'Transportation',
  'Food & Dining',
  'Sightseeing',
  'Shopping',
  'Entertainment',
  'Other'
];

export default function BudgetTracker({ trip }) {
  const { addExpense, deleteExpense, updateTrip } = useTrips();
  const [modalOpen, setModalOpen] = useState(false);
  const [editBudgetOpen, setEditBudgetOpen] = useState(false);
  const [newBudget, setNewBudget] = useState(trip?.budget || 0);

  // New expense form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Food & Dining');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('Credit Card');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const expenses = trip?.expenses || [];
  const budget = Number(trip?.budget || 0);
  const totalSpent = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const remaining = budget - totalSpent;
  const percentSpent = budget > 0 ? Math.min(Math.round((totalSpent / budget) * 100), 100) : 0;

  // Category aggregations
  const categoryTotals = {};
  expenses.forEach(e => {
    const cat = e.category || 'Other';
    categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(e.amount || 0);
  });

  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!title.trim() || !amount) return;

    addExpense(trip.id, {
      title: title.trim(),
      category,
      amount: Number(amount),
      currency: trip.currency || 'USD',
      paidBy,
      date
    });

    setTitle('');
    setAmount('');
    setModalOpen(false);
  };

  const handleSaveBudget = (e) => {
    e.preventDefault();
    updateTrip(trip.id, { budget: Number(newBudget) });
    setEditBudgetOpen(false);
  };

  // Circular progress SVG values
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentSpent / 100) * circumference;
  const ringColor = totalSpent > budget ? 'var(--accent-coral)' : (percentSpent > 85 ? 'var(--accent-amber)' : 'var(--primary)');

  return (
    <div className="budget-grid">
      {/* Left Column: Budget Summary & Categories */}
      <div className="budget-summary-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Trip Budget</h3>
          <button
            className="btn btn-sm btn-outline"
            onClick={() => setEditBudgetOpen(true)}
          >
            Adjust Budget
          </button>
        </div>

        {/* Circular Progress Meter */}
        <div className="progress-ring-wrap">
          <div style={{ position: 'relative', width: '160px', height: '160px' }}>
            <svg width="160" height="160" style={{ transform: 'rotate(-90deg)' }}>
              <circle
                cx="80"
                cy="80"
                r={radius}
                fill="transparent"
                stroke="var(--border-subtle)"
                strokeWidth="12"
              />
              <circle
                cx="80"
                cy="80"
                r={radius}
                fill="transparent"
                stroke={ringColor}
                strokeWidth="12"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.8s ease' }}
              />
            </svg>
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
                {percentSpent}%
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Spent</span>
            </div>
          </div>
        </div>

        {/* Budget Warning Alert if Over */}
        {totalSpent > budget && (
          <div style={{
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            color: 'var(--accent-coral)',
            fontSize: '0.85rem',
            fontWeight: 600
          }}>
            <AlertTriangle size={18} />
            <span>Budget exceeded by ${Math.abs(remaining).toLocaleString()}</span>
          </div>
        )}

        {/* Metric Rows */}
        <div>
          <div className="budget-metric-row">
            <span style={{ color: 'var(--text-secondary)' }}>Total Allocated Budget</span>
            <span style={{ fontWeight: 700 }}>${budget.toLocaleString()} {trip?.currency}</span>
          </div>
          <div className="budget-metric-row">
            <span style={{ color: 'var(--text-secondary)' }}>Total Expenses Logged</span>
            <span style={{ fontWeight: 700, color: ringColor }}>${totalSpent.toLocaleString()} {trip?.currency}</span>
          </div>
          <div className="budget-metric-row" style={{ borderBottom: 'none' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Remaining Balance</span>
            <span style={{ fontWeight: 800, color: remaining >= 0 ? 'var(--accent-emerald)' : 'var(--accent-coral)' }}>
              ${remaining.toLocaleString()} {trip?.currency}
            </span>
          </div>
        </div>

        {/* Category Breakdown */}
        <div style={{ marginTop: '0.5rem' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.85rem' }}>Expenses by Category</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {Object.keys(categoryTotals).length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No expenses recorded yet.</p>
            ) : (
              Object.entries(categoryTotals).map(([cat, amount]) => {
                const catPercent = totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0;
                return (
                  <div key={cat}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', marginBottom: '0.25rem' }}>
                      <span>{cat}</span>
                      <span style={{ fontWeight: 700 }}>${amount.toLocaleString()} ({catPercent}%)</span>
                    </div>
                    <div className="trip-progress-bar">
                      <div 
                        className="trip-progress-fill" 
                        style={{ width: `${catPercent}%`, background: 'var(--secondary)' }} 
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Transactions Log */}
      <div className="expense-list-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Expense Transactions</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Keep every receipt, flight, and meal tracked
            </p>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => setModalOpen(true)}
          >
            <Plus size={16} />
            <span>Add Expense</span>
          </button>
        </div>

        {expenses.length === 0 ? (
          <div style={{ padding: '3.5rem 1rem', textAlign: 'center' }}>
            <DollarSign size={40} style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }} />
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>No expenses logged for this trip yet.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="expense-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Payment</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((exp) => (
                  <tr key={exp.id}>
                    <td style={{ fontWeight: 600 }}>{exp.title}</td>
                    <td>
                      <span className="badge badge-category" style={{ fontSize: '0.72rem' }}>
                        {exp.category}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{exp.date}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{exp.paidBy || 'Card'}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--text-primary)' }}>
                      ${Number(exp.amount).toLocaleString()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn-icon btn-sm"
                        onClick={() => deleteExpense(trip.id, exp.id)}
                        title="Delete expense"
                      >
                        <Trash2 size={14} style={{ color: 'var(--accent-coral)' }} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      {modalOpen && (
        <div className="modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} role="dialog">
            <div className="modal-header">
              <h2 style={{ fontSize: '1.2rem' }}>Record an Expense</h2>
              <button className="btn-icon" onClick={() => setModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddExpense}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Expense Description *</label>
                  <input
                    type="text"
                    placeholder="e.g. Traditional Ramen Dinner, JR Rail Pass"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Amount ($) *</label>
                    <input
                      type="number"
                      min="0.01"
                      step="any"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)}>
                      {EXPENSE_CATEGORIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Date</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Payment Method</label>
                    <select value={paidBy} onChange={(e) => setPaidBy(e.target.value)}>
                      <option value="Credit Card">Credit Card</option>
                      <option value="Debit Card">Debit Card</option>
                      <option value="Cash">Cash</option>
                      <option value="Digital Wallet">Apple / Google Pay</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Record Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adjust Budget Modal */}
      {editBudgetOpen && (
        <div className="modal-backdrop" onClick={() => setEditBudgetOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} role="dialog">
            <div className="modal-header">
              <h2 style={{ fontSize: '1.2rem' }}>Adjust Trip Budget</h2>
              <button className="btn-icon" onClick={() => setEditBudgetOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveBudget}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Total Allocated Budget ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={newBudget}
                    onChange={(e) => setNewBudget(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setEditBudgetOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
