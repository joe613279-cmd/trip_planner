import React, { useState } from 'react';
import { 
  Plus, Calendar, Clock, MapPin, DollarSign, Edit3, Trash2, 
  CheckCircle2, Circle, Utensils, Landmark, Camera, Mountain, 
  ShoppingBag, Bed, Compass, ChevronRight 
} from 'lucide-react';
import { useTrips } from '../context/TripContext';
import ActivityModal from './ActivityModal';

export default function ItineraryView({ trip }) {
  const { 
    addDay, 
    deleteDay, 
    addActivity, 
    updateActivity, 
    deleteActivity, 
    toggleActivityComplete 
  } = useTrips();

  const [selectedDayNumber, setSelectedDayNumber] = useState(1);
  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);

  const days = trip?.days || [];
  const currentDay = days.find(d => d.dayNumber === selectedDayNumber) || days[0];

  const handleAddDay = () => {
    addDay(trip.id, {});
    setSelectedDayNumber(days.length + 1);
  };

  const handleOpenAddActivity = () => {
    setEditingActivity(null);
    setActivityModalOpen(true);
  };

  const handleOpenEditActivity = (activity) => {
    setEditingActivity(activity);
    setActivityModalOpen(true);
  };

  const handleSaveActivity = (activityData) => {
    if (editingActivity) {
      updateActivity(trip.id, editingActivity.id, activityData);
    } else {
      addActivity(trip.id, { ...activityData, dayNumber: selectedDayNumber });
    }
  };

  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'dining':
      case 'food & dining': return <Utensils size={18} />;
      case 'culture':
      case 'art & museums': return <Landmark size={18} />;
      case 'nature':
      case 'adventure': return <Mountain size={18} />;
      case 'shopping': return <ShoppingBag size={18} />;
      case 'accommodation': return <Bed size={18} />;
      default: return <Camera size={18} />;
    }
  };

  const totalDayCost = currentDay?.activities
    ? currentDay.activities.reduce((acc, a) => acc + Number(a.cost || 0), 0)
    : 0;

  return (
    <div className="itinerary-layout">
      {/* Days Sidebar */}
      <aside className="day-selector-sidebar">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Trip Schedule</h3>
          <button 
            className="btn btn-sm btn-outline" 
            onClick={handleAddDay}
            title="Add a new day"
          >
            <Plus size={14} />
            <span>Day</span>
          </button>
        </div>

        {days.map((day) => {
          const isActive = day.dayNumber === selectedDayNumber;
          const completedCount = (day.activities || []).filter(a => a.completed).length;
          const totalCount = (day.activities || []).length;

          return (
            <button
              key={day.dayNumber}
              className={`day-selector-btn ${isActive ? 'active' : ''}`}
              onClick={() => setSelectedDayNumber(day.dayNumber)}
            >
              <div>
                <div style={{ fontWeight: 700 }}>Day {day.dayNumber}</div>
                <div style={{ fontSize: '0.78rem', opacity: 0.85 }}>
                  {day.date ? new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                </div>
              </div>
              <span style={{ fontSize: '0.75rem', opacity: 0.85 }}>
                {completedCount}/{totalCount}
              </span>
            </button>
          );
        })}
      </aside>

      {/* Main Day Content */}
      <main className="day-activities-pane">
        {currentDay ? (
          <>
            <div className="day-header-card">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <span className="badge badge-upcoming">Day {currentDay.dayNumber}</span>
                  {currentDay.date && (
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {new Date(currentDay.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                  )}
                </div>
                <h2 style={{ fontSize: '1.45rem', marginTop: '0.35rem' }}>
                  {currentDay.title || `Day ${currentDay.dayNumber} Plan`}
                </h2>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ textAlign: 'right', marginRight: '0.5rem' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Estimated Day Cost</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>
                    ${totalDayCost}
                  </div>
                </div>

                <button 
                  className="btn btn-primary"
                  onClick={handleOpenAddActivity}
                >
                  <Plus size={16} />
                  <span>Add Activity</span>
                </button>

                {days.length > 1 && (
                  <button
                    className="btn-icon"
                    title="Delete Day"
                    onClick={() => {
                      if (window.confirm(`Delete Day ${currentDay.dayNumber}?`)) {
                        deleteDay(trip.id, currentDay.dayNumber);
                        setSelectedDayNumber(1);
                      }
                    }}
                  >
                    <Trash2 size={16} style={{ color: 'var(--accent-coral)' }} />
                  </button>
                )}
              </div>
            </div>

            {/* Activities Timeline */}
            {(!currentDay.activities || currentDay.activities.length === 0) ? (
              <div style={{
                padding: '3.5rem 2rem',
                textAlign: 'center',
                backgroundColor: 'var(--bg-card)',
                borderRadius: 'var(--radius-xl)',
                border: '1px dashed var(--border-card)'
              }}>
                <Compass size={40} style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }} />
                <h3 style={{ fontSize: '1.15rem', marginBottom: '0.35rem' }}>No activities scheduled for Day {currentDay.dayNumber}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                  Click below to add your first attraction, dining spot, or tour!
                </p>
                <button className="btn btn-primary" onClick={handleOpenAddActivity}>
                  <Plus size={16} />
                  <span>Add First Activity</span>
                </button>
              </div>
            ) : (
              <div className="timeline">
                {currentDay.activities.map((activity) => (
                  <div 
                    key={activity.id} 
                    className={`activity-item ${activity.completed ? 'completed' : ''}`}
                  >
                    <div 
                      className="activity-node"
                      role="button"
                      tabIndex={0}
                      title={activity.completed ? 'Mark as Incomplete' : 'Mark as Done'}
                      onClick={() => toggleActivityComplete(trip.id, activity.id, !activity.completed)}
                    >
                      {activity.completed ? <CheckCircle2 size={24} /> : getCategoryIcon(activity.category)}
                    </div>

                    <div className="activity-card">
                      <div className="activity-card-header">
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                            <span style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '0.25rem', 
                              fontSize: '0.8rem', 
                              color: 'var(--primary)', 
                              fontWeight: 700 
                            }}>
                              <Clock size={13} />
                              {activity.time}
                            </span>
                            <span className="badge badge-category">
                              {activity.category || 'Sightseeing'}
                            </span>
                          </div>
                          <h4 className="activity-title">{activity.title}</h4>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <button
                            className="btn-icon btn-sm"
                            title="Edit Activity"
                            onClick={() => handleOpenEditActivity(activity)}
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            className="btn-icon btn-sm"
                            title="Delete Activity"
                            onClick={() => {
                              if (window.confirm(`Delete "${activity.title}"?`)) {
                                deleteActivity(trip.id, activity.id);
                              }
                            }}
                          >
                            <Trash2 size={14} style={{ color: 'var(--accent-coral)' }} />
                          </button>
                        </div>
                      </div>

                      <div className="activity-meta-row">
                        {activity.location && (
                          <div className="trip-meta-item">
                            <MapPin size={14} style={{ color: 'var(--primary)' }} />
                            <span>{activity.location}</span>
                          </div>
                        )}
                        {activity.cost > 0 && (
                          <div className="trip-meta-item">
                            <DollarSign size={14} style={{ color: 'var(--accent-emerald)' }} />
                            <span>${activity.cost}</span>
                          </div>
                        )}
                      </div>

                      {activity.notes && (
                        <div className="activity-notes">
                          {activity.notes}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <p>Select or add a day to begin planning.</p>
          </div>
        )}
      </main>

      {/* Add / Edit Activity Modal */}
      <ActivityModal
        isOpen={activityModalOpen}
        onClose={() => setActivityModalOpen(false)}
        onSave={handleSaveActivity}
        activity={editingActivity}
        dayNumber={selectedDayNumber}
      />
    </div>
  );
}
