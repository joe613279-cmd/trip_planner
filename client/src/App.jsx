import React, { useState } from 'react';
import { 
  Plus, Compass, Calendar, DollarSign, MapPin, CheckCircle2, 
  ArrowLeft, Share2, Trash2, Globe, Sparkles, Layers, Backpack, CreditCard, ShieldCheck 
} from 'lucide-react';
import { useTrips } from './context/TripContext';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import TripCard from './components/TripCard';
import TripWizardModal from './components/TripWizardModal';
import ItineraryView from './components/ItineraryView';
import MapView from './components/MapView';
import BudgetTracker from './components/BudgetTracker';
import PackingList from './components/PackingList';
import DestinationExplorer from './components/DestinationExplorer';
import TripExportModal from './components/TripExportModal';
import AuthModal from './components/AuthModal';
import AdminDashboard from './components/AdminDashboard';

export default function App() {
  const { 
    trips, 
    activeTrip, 
    setActiveTrip, 
    loading, 
    toast, 
    loadTripDetails, 
    deleteTrip 
  } = useTrips();
  const { user, isAdmin, isAuthenticated } = useAuth();

  const [currentView, setCurrentView] = useState('trips'); // 'trips' | 'destinations' | 'admin'
  const [activeTab, setActiveTab] = useState('itinerary'); // 'itinerary' | 'map' | 'budget' | 'packing'
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardInitialDest, setWizardInitialDest] = useState('');
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Total summary statistics across all trips
  const totalDays = trips.reduce((sum, t) => sum + (t.daysCount || 0), 0);
  const totalBudget = trips.reduce((sum, t) => sum + (t.budget || 0), 0);
  const totalActivities = trips.reduce((sum, t) => sum + (t.totalActivities || 0), 0);

  const handleSelectTrip = async (tripId) => {
    await loadTripDetails(tripId);
    setActiveTab('itinerary');
  };

  const handleOpenNewTrip = (prefillDest = '') => {
    setWizardInitialDest(typeof prefillDest === 'string' ? prefillDest : '');
    setWizardOpen(true);
  };

  const handleDeleteActiveTrip = () => {
    if (!activeTrip) return;
    if (window.confirm(`Delete "${activeTrip.title}" permanently?`)) {
      deleteTrip(activeTrip.id);
      setActiveTrip(null);
    }
  };

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        setCurrentView={(view) => {
          setCurrentView(view);
          if (view === 'trips' && activeTrip) {
            // Keep active trip if in trips view
          }
        }}
        onOpenNewTrip={() => handleOpenNewTrip()}
        onOpenAuth={() => setAuthModalOpen(true)}
      />

      <main className="main-content">
        {/* VIEW 1: ADMIN DASHBOARD */}
        {currentView === 'admin' ? (
          isAdmin ? (
            <AdminDashboard />
          ) : (
            <div style={{
              padding: '4rem 2rem',
              textAlign: 'center',
              backgroundColor: 'var(--bg-card)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-card)',
              maxWidth: '560px',
              margin: '3rem auto'
            }}>
              <ShieldCheck size={48} style={{ color: 'var(--accent-coral)', marginBottom: '1rem' }} />
              <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Administrator Access Required</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                You must be signed in with an Administrator account to view platform metrics and manage user roles.
              </p>
              <button className="btn btn-primary" onClick={() => setAuthModalOpen(true)}>
                Sign In as Admin
              </button>
            </div>
          )
        ) : currentView === 'destinations' ? (
          /* VIEW 2: DESTINATIONS EXPLORER */
          <DestinationExplorer
            onSelectDestination={(destName) => {
              handleOpenNewTrip(destName);
            }}
          />
        ) : activeTrip ? (
          /* VIEW 3: ACTIVE TRIP DETAIL VIEW */
          <div>
            {/* Trip Detail Cover Header */}
            <div className="trip-detail-header">
              <img
                src={activeTrip.coverImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80'}
                alt={activeTrip.destination}
                className="trip-header-bg"
              />
              <div className="trip-header-overlay" />

              <div className="trip-header-content">
                <div className="trip-header-left">
                  <button
                    className="trip-header-back-btn"
                    onClick={() => setActiveTrip(null)}
                  >
                    <ArrowLeft size={14} />
                    <span>All Trips</span>
                  </button>

                  <h1 className="trip-header-title">
                    {activeTrip.flag} {activeTrip.title}
                  </h1>

                  <div className="trip-header-sub">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <MapPin size={15} />
                      {activeTrip.destination}{activeTrip.country ? `, ${activeTrip.country}` : ''}
                    </span>
                    <span>•</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Calendar size={15} />
                      {activeTrip.startDate} to {activeTrip.endDate} ({(activeTrip.days || []).length} Days)
                    </span>
                    <span>•</span>
                    <span className="badge badge-category">
                      {activeTrip.travelStyle || 'Cultural Explorer'}
                    </span>
                    {activeTrip.createdBy && (
                      <>
                        <span>•</span>
                        <span style={{ fontSize: '0.85rem', opacity: 0.85 }}>
                          Planner: {activeTrip.createdBy}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="trip-header-actions">
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setExportModalOpen(true)}
                    style={{ background: 'rgba(255,255,255,0.15)', color: '#FFF', border: '1px solid rgba(255,255,255,0.2)' }}
                  >
                    <Share2 size={15} />
                    <span>Export & Print</span>
                  </button>

                  <button
                    className="btn btn-danger btn-sm"
                    onClick={handleDeleteActiveTrip}
                    title="Delete this trip"
                  >
                    <Trash2 size={15} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Trip Navigation Tabs */}
            <nav className="trip-tabs" aria-label="Trip Sections">
              <button
                className={`trip-tab-btn ${activeTab === 'itinerary' ? 'active' : ''}`}
                onClick={() => setActiveTab('itinerary')}
              >
                <Calendar size={17} />
                <span>Day-by-Day Plan</span>
              </button>

              <button
                className={`trip-tab-btn ${activeTab === 'map' ? 'active' : ''}`}
                onClick={() => setActiveTab('map')}
              >
                <MapPin size={17} />
                <span>Interactive Map</span>
              </button>

              <button
                className={`trip-tab-btn ${activeTab === 'budget' ? 'active' : ''}`}
                onClick={() => setActiveTab('budget')}
              >
                <CreditCard size={17} />
                <span>Budget & Expenses</span>
              </button>

              <button
                className={`trip-tab-btn ${activeTab === 'packing' ? 'active' : ''}`}
                onClick={() => setActiveTab('packing')}
              >
                <Backpack size={17} />
                <span>Packing Assistant</span>
              </button>
            </nav>

            {/* Tab Views */}
            {activeTab === 'itinerary' && <ItineraryView trip={activeTrip} />}
            {activeTab === 'map' && <MapView trip={activeTrip} />}
            {activeTab === 'budget' && <BudgetTracker trip={activeTrip} />}
            {activeTab === 'packing' && <PackingList trip={activeTrip} />}
          </div>
        ) : (
          /* VIEW 4: DASHBOARD / TRIPS LIST */
          <div>
            {/* Hero Banner */}
            <div className="hero-banner">
              <div>
                <span className="badge badge-upcoming" style={{ marginBottom: '0.75rem' }}>
                  {isAuthenticated ? `Welcome back, ${user?.name}!` : 'Smart Travel Architecture'}
                </span>
                <h1 className="hero-title">Where Will You Wander Next?</h1>
                <p className="hero-subtitle">
                  Effortlessly organize day-by-day itineraries, interactive route maps, live budgets, and smart climate-tailored packing lists.
                </p>
              </div>

              <div style={{ zIndex: 2, display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {!isAuthenticated && (
                  <button
                    className="btn btn-secondary"
                    onClick={() => setAuthModalOpen(true)}
                    style={{ padding: '0.85rem 1.4rem' }}
                  >
                    <span>Sign In / Register</span>
                  </button>
                )}
                <button
                  className="btn btn-primary"
                  onClick={() => handleOpenNewTrip()}
                  style={{ padding: '0.85rem 1.6rem', fontSize: '1rem' }}
                >
                  <Sparkles size={18} />
                  <span>Plan New Trip</span>
                </button>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon-wrapper" style={{ background: 'rgba(14, 165, 233, 0.15)', color: 'var(--primary)' }}>
                  <Compass size={24} />
                </div>
                <div>
                  <div className="stat-number">{trips.length}</div>
                  <div className="stat-label">Trips Planned</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon-wrapper" style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--secondary)' }}>
                  <Calendar size={24} />
                </div>
                <div>
                  <div className="stat-number">{totalDays}</div>
                  <div className="stat-label">Days Scheduled</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)' }}>
                  <DollarSign size={24} />
                </div>
                <div>
                  <div className="stat-number">${totalBudget.toLocaleString()}</div>
                  <div className="stat-label">Total Budget</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-amber)' }}>
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <div className="stat-number">{totalActivities}</div>
                  <div className="stat-label">Activities Created</div>
                </div>
              </div>
            </div>

            {/* Trips Grid Header */}
            <div className="trips-section-header">
              <div>
                <h2 style={{ fontSize: '1.45rem', fontWeight: 800 }}>Your Journeys</h2>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  Select a trip to view and customize its day-by-day plan
                </p>
              </div>

              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setCurrentView('destinations')}
              >
                <Globe size={15} />
                <span>Explore Sights</span>
              </button>
            </div>

            {/* Trips Grid */}
            {loading ? (
              <div style={{ padding: '4rem', textAlign: 'center' }}>
                <Compass size={40} className="spinning" style={{ color: 'var(--primary)', marginBottom: '0.75rem' }} />
                <p style={{ color: 'var(--text-secondary)' }}>Loading your adventures...</p>
              </div>
            ) : trips.length === 0 ? (
              <div style={{
                padding: '4rem 2rem',
                textAlign: 'center',
                backgroundColor: 'var(--bg-card)',
                borderRadius: 'var(--radius-xl)',
                border: '1px dashed var(--border-card)'
              }}>
                <Compass size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.4rem' }}>No trips planned yet</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
                  Create your first trip or explore curated destinations to begin crafting your journey.
                </p>
                <button className="btn btn-primary" onClick={() => handleOpenNewTrip()}>
                  <Sparkles size={16} />
                  <span>Start Planning</span>
                </button>
              </div>
            ) : (
              <div className="trips-grid">
                {trips.map((trip) => (
                  <TripCard
                    key={trip.id}
                    trip={trip}
                    onSelect={handleSelectTrip}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Trip Creation Wizard Modal */}
      <TripWizardModal
        isOpen={wizardOpen}
        onClose={() => setWizardOpen(false)}
        initialDestination={wizardInitialDest}
      />

      {/* Trip Export / Print Modal */}
      <TripExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        trip={activeTrip}
      />

      {/* Auth / Registration Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      {/* Floating Toast Notification */}
      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.type}`}>
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
