import React, { useState, useEffect } from 'react';
import { Search, MapPin, CloudSun, Sun, DollarSign, Sparkles, Compass, CheckCircle } from 'lucide-react';
import { api } from '../services/api';

export default function DestinationExplorer({ onSelectDestination }) {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('All');

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await api.getDestinations();
        if (res.success) {
          setDestinations(res.data);
        }
      } catch (err) {
        console.error('Failed to load destinations:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const STYLES = ['All', 'Cultural Explorer', 'Foodie Tour', 'Adventure & Nature', 'Romantic Getaway', 'Luxury & Relaxation'];

  const filtered = destinations.filter(d => {
    const matchesSearch = !searchQuery || 
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.tags || []).some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStyle = selectedStyle === 'All' || 
      (d.travelStyles || []).includes(selectedStyle);

    return matchesSearch && matchesStyle;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Explorer Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.12) 0%, rgba(99, 102, 241, 0.08) 100%)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-xl)',
        padding: '2.5rem 2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem'
      }}>
        <div style={{ maxWidth: '640px' }}>
          <span className="badge badge-upcoming" style={{ marginBottom: '0.5rem' }}>
            Curated World Guides
          </span>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
            Explore Extraordinary Destinations
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)' }}>
            Discover handpicked global hotspots with weather forecasts, curated food specialties, and instant AI itineraries.
          </p>
        </div>

        {/* Search and Filters */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 300px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search by city, country, or tag (e.g. Tokyo, Italy, Beaches)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', paddingLeft: '2.5rem' }}
            />
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {STYLES.map(style => (
              <button
                key={style}
                className={`btn btn-sm ${selectedStyle === style ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setSelectedStyle(style)}
              >
                {style}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Destinations */}
      {loading ? (
        <div style={{ padding: '4rem', textAlign: 'center' }}>
          <Compass size={40} className="spinning" style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
          <p style={{ color: 'var(--text-secondary)' }}>Loading world destinations...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: '3.5rem', textAlign: 'center', background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)' }}>
          <p style={{ color: 'var(--text-secondary)' }}>No destinations match your search criteria.</p>
        </div>
      ) : (
        <div className="destinations-grid">
          {filtered.map((dest) => (
            <article key={dest.id} className="dest-card">
              <div className="dest-image-wrap">
                <img src={dest.coverImage} alt={dest.name} className="dest-image" loading="lazy" />
                <div className="weather-chip">
                  <Sun size={15} style={{ color: '#FBBF24' }} />
                  <span>{dest.weather?.temperature || 20}°C • {dest.weather?.condition || 'Clear'}</span>
                </div>
              </div>

              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1, gap: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {dest.flag} {dest.country} • {dest.region}
                    </span>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{dest.name}</h3>
                  </div>
                  <span className="badge badge-category" style={{ fontSize: '0.75rem' }}>
                    {dest.climate}
                  </span>
                </div>

                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {dest.tagline}
                </p>

                {/* Highlights */}
                <div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                    Top Attractions
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {(dest.attractions || []).slice(0, 3).map((a, i) => (
                      <span key={i} style={{
                        fontSize: '0.75rem',
                        padding: '0.2rem 0.5rem',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--bg-subtle)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-secondary)'
                      }}>
                        {a.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Footer info */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid var(--border-subtle)',
                  marginTop: 'auto'
                }}>
                  <div style={{ fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Avg Daily: </span>
                    <span style={{ fontWeight: 700, color: 'var(--accent-emerald)' }}>
                      ${dest.averageDailyCost} / day
                    </span>
                  </div>

                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => onSelectDestination(dest.name)}
                  >
                    <Sparkles size={14} />
                    <span>Plan Trip Here</span>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
