import React from 'react';
import { Calendar, CheckCircle2, DollarSign, Trash2, ArrowRight } from 'lucide-react';
import { useTrips } from '../context/TripContext';

export default function TripCard({ trip, onSelect }) {
  const { deleteTrip } = useTrips();

  const percentActivities = trip.totalActivities > 0
    ? Math.round((trip.completedActivities / trip.totalActivities) * 100)
    : 0;

  const formatDateRange = (start, end) => {
    if (!start) return '';
    const s = new Date(start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const e = end ? new Date(end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
    return `${s} - ${e}`;
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${trip.title}"?`)) {
      deleteTrip(trip.id);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'badge-completed';
      case 'in progress':
      case 'active': return 'badge-active';
      default: return 'badge-upcoming';
    }
  };

  return (
    <article 
      className="trip-card" 
      onClick={() => onSelect(trip.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') onSelect(trip.id); }}
    >
      <div className="trip-card-image-wrap">
        <img 
          src={trip.coverImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80'} 
          alt={trip.destination} 
          className="trip-card-image"
          loading="lazy"
        />
        <div className="trip-card-overlay">
          <div className="trip-card-badges">
            <span className={`badge ${getStatusBadgeClass(trip.status)}`}>
              {trip.status || 'Upcoming'}
            </span>
            <button 
              className="btn-icon btn-sm" 
              onClick={handleDelete}
              title="Delete Trip"
              aria-label="Delete Trip"
              style={{ background: 'rgba(0,0,0,0.5)', border: 'none', color: '#FFFFFF' }}
            >
              <Trash2 size={14} />
            </button>
          </div>
          <div className="trip-card-destination">
            <span>{trip.flag}</span>
            <span>{trip.destination}</span>
          </div>
        </div>
      </div>

      <div className="trip-card-body">
        <h3 className="trip-card-title">{trip.title}</h3>
        
        <div className="trip-card-meta">
          <div className="trip-meta-item">
            <Calendar size={14} />
            <span>{formatDateRange(trip.startDate, trip.endDate)}</span>
          </div>
          <div className="trip-meta-item">
            <span>•</span>
            <span>{trip.daysCount || 1} Days</span>
          </div>
        </div>

        <div style={{ marginTop: '0.4rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
            <span>Itinerary Progress</span>
            <span>{trip.completedActivities || 0}/{trip.totalActivities || 0} ({percentActivities}%)</span>
          </div>
          <div className="trip-progress-bar">
            <div 
              className="trip-progress-fill" 
              style={{ width: `${percentActivities}%` }} 
            />
          </div>
        </div>
      </div>

      <div className="trip-card-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
          <DollarSign size={15} style={{ color: 'var(--accent-emerald)' }} />
          <span>
            {trip.totalExpenses > 0 ? `$${trip.totalExpenses}` : '$0'}
            <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}> / ${trip.budget || 0}</span>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--primary)', fontWeight: 600 }}>
          <span>View Plan</span>
          <ArrowRight size={14} />
        </div>
      </div>
    </article>
  );
}
