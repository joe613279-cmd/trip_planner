import React, { useState } from 'react';
import { X, Sparkles, MapPin, Calendar, DollarSign, Compass } from 'lucide-react';
import { useTrips } from '../context/TripContext';

const TRAVEL_STYLES = [
  { id: 'Cultural Explorer', label: 'Cultural Explorer', emoji: '🏛️' },
  { id: 'Foodie Tour', label: 'Foodie Tour', emoji: '🍜' },
  { id: 'Adventure & Nature', label: 'Adventure & Nature', emoji: '🏔️' },
  { id: 'Luxury & Relaxation', label: 'Luxury & Relax', emoji: '✨' },
  { id: 'Romantic Getaway', label: 'Romantic Getaway', emoji: '🍷' },
  { id: 'Backpacker Budget', label: 'Backpacker', emoji: '🎒' }
];

const QUICK_DESTINATIONS = ['Tokyo', 'Paris', 'Bali', 'Rome', 'New York City', 'Swiss Alps (Interlaken)'];

export default function TripWizardModal({ isOpen, onClose, initialDestination = '' }) {
  const { createTrip } = useTrips();
  const [destination, setDestination] = useState(initialDestination || '');
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 18);
    return d.toISOString().split('T')[0];
  });
  const [travelStyle, setTravelStyle] = useState('Cultural Explorer');
  const [budget, setBudget] = useState(2000);
  const [currency, setCurrency] = useState('USD');
  const [autoGenerate, setAutoGenerate] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!destination.trim()) return;

    try {
      setSubmitting(true);
      await createTrip({
        title: title.trim() || `${destination} Trip`,
        destination: destination.trim(),
        startDate,
        endDate,
        travelStyle,
        budget: Number(budget || 0),
        currency,
        autoGenerate
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        role="dialog" 
        aria-modal="true"
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div className="brand-icon" style={{ width: '32px', height: '32px' }}>
              <Compass size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem' }}>Plan Your Next Journey</h2>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                Set up details or let AI generate a full custom itinerary
              </p>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Destination Field */}
            <div className="form-group">
              <label className="form-label">
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <MapPin size={14} style={{ color: 'var(--primary)' }} />
                  Destination City or Region *
                </span>
              </label>
              <input
                type="text"
                placeholder="e.g. Tokyo, Paris, Bali, Rome, Iceland..."
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                required
                autoFocus
              />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.35rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', alignSelf: 'center' }}>Popular:</span>
                {QUICK_DESTINATIONS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setDestination(q)}
                    style={{
                      fontSize: '0.75rem',
                      padding: '0.2rem 0.55rem',
                      borderRadius: 'var(--radius-full)',
                      background: 'var(--bg-subtle)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Trip Title */}
            <div className="form-group">
              <label className="form-label">Trip Title (Optional)</label>
              <input
                type="text"
                placeholder={destination ? `${destination} Gateway Adventure` : 'e.g. Summer European Odyssey'}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Dates */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Calendar size={14} />
                    Start Date
                  </span>
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Calendar size={14} />
                    End Date
                  </span>
                </label>
                <input
                  type="date"
                  value={endDate}
                  min={startDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Travel Style */}
            <div className="form-group">
              <label className="form-label">Travel Style & Vibe</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                {TRAVEL_STYLES.map((style) => (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => setTravelStyle(style.id)}
                    style={{
                      padding: '0.55rem 0.5rem',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      border: travelStyle === style.id ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                      background: travelStyle === style.id ? 'var(--primary-glow)' : 'var(--bg-subtle)',
                      color: travelStyle === style.id ? 'var(--primary)' : 'var(--text-secondary)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.2rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span style={{ fontSize: '1.2rem' }}>{style.emoji}</span>
                    <span style={{ textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>
                      {style.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Budget & Currency */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <DollarSign size={14} />
                    Total Budget
                  </span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Currency</label>
                <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="JPY">JPY (¥)</option>
                  <option value="INR">INR (₹)</option>
                  <option value="CHF">CHF (Fr)</option>
                  <option value="AUD">AUD ($)</option>
                </select>
              </div>
            </div>

            {/* Smart AI Generation Option */}
            <div 
              style={{ 
                padding: '1rem', 
                background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid rgba(14, 165, 233, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                cursor: 'pointer'
              }}
              onClick={() => setAutoGenerate(!autoGenerate)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ 
                  width: '36px', 
                  height: '36px', 
                  borderRadius: 'var(--radius-md)', 
                  background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF'
                }}>
                  <Sparkles size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>AI Smart Itinerary & Packing Assistant</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Auto-generates daily scheduled spots, coords, time slots, and climate packing items.
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={autoGenerate}
                onChange={(e) => setAutoGenerate(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting || !destination.trim()}>
              {submitting ? (
                <>
                  <Sparkles size={16} className="spinning" />
                  <span>Crafting Itinerary...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Create Trip</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
