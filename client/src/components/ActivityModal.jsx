import React, { useState, useEffect } from 'react';
import { X, Clock, MapPin, DollarSign, Tag, FileText } from 'lucide-react';

const CATEGORIES = [
  'Sightseeing',
  'Dining',
  'Culture',
  'Nature',
  'Art & Museums',
  'Adventure',
  'Shopping',
  'Accommodation',
  'Transit'
];

export default function ActivityModal({ isOpen, onClose, onSave, activity = null, dayNumber = 1 }) {
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('10:00');
  const [category, setCategory] = useState('Sightseeing');
  const [location, setLocation] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [cost, setCost] = useState(0);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (activity) {
      setTitle(activity.title || '');
      setTime(activity.time || '10:00');
      setCategory(activity.category || 'Sightseeing');
      setLocation(activity.location || '');
      setLat(activity.lat !== null && activity.lat !== undefined ? activity.lat : '');
      setLng(activity.lng !== null && activity.lng !== undefined ? activity.lng : '');
      setCost(activity.cost || 0);
      setNotes(activity.notes || '');
    } else {
      setTitle('');
      setTime('10:00');
      setCategory('Sightseeing');
      setLocation('');
      setLat('');
      setLng('');
      setCost(0);
      setNotes('');
    }
  }, [activity, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      dayNumber,
      title: title.trim(),
      time,
      category,
      location: location.trim(),
      lat: lat !== '' ? Number(lat) : null,
      lng: lng !== '' ? Number(lng) : null,
      cost: Number(cost || 0),
      notes: notes.trim()
    });
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="modal-header">
          <h2 style={{ fontSize: '1.2rem' }}>
            {activity ? 'Edit Activity' : `Add Activity to Day ${dayNumber}`}
          </h2>
          <button className="btn-icon" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Activity Title *</label>
              <input
                type="text"
                placeholder="e.g. Visit Senso-ji Temple"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Clock size={14} /> Time
                  </span>
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Tag size={14} /> Category
                  </span>
                </label>
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <MapPin size={14} /> Location / Address
                </span>
              </label>
              <input
                type="text"
                placeholder="e.g. Asakusa, Taito City, Tokyo"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Latitude (Optional)</label>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 35.7148"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Longitude (Optional)</label>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 139.7967"
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <DollarSign size={14} /> Estimated Cost ($)
                </span>
              </label>
              <input
                type="number"
                min="0"
                step="1"
                placeholder="0"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <FileText size={14} /> Notes, Booking Info or Tips
                </span>
              </label>
              <textarea
                rows="3"
                placeholder="e.g. Remember to bring comfortable walking shoes; reservation code #8492"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {activity ? 'Save Changes' : 'Add Activity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
