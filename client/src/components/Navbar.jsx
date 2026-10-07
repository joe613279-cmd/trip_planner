import React from 'react';
import { Compass, Plus, Sun, Moon, MapPin, Globe, Sparkles, ShieldCheck, LogIn, LogOut, User } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ currentView, setCurrentView, onOpenNewTrip, onOpenAuth }) {
  const { theme, toggleTheme } = useTheme();
  const { user, isAdmin, isAuthenticated, logout } = useAuth();

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div 
          className="brand-logo" 
          onClick={() => setCurrentView('trips')}
          role="button"
          tabIndex={0}
        >
          <div className="brand-icon">
            <Compass size={22} />
          </div>
          <span>VoyageCraft</span>
        </div>

        <nav className="nav-links">
          <button
            className={`nav-item ${currentView === 'trips' ? 'active' : ''}`}
            onClick={() => setCurrentView('trips')}
          >
            <MapPin size={16} />
            <span>My Trips</span>
          </button>

          <button
            className={`nav-item ${currentView === 'destinations' ? 'active' : ''}`}
            onClick={() => setCurrentView('destinations')}
          >
            <Globe size={16} />
            <span>Explore Destinations</span>
          </button>

          {isAdmin && (
            <button
              className={`nav-item ${currentView === 'admin' ? 'active' : ''}`}
              onClick={() => setCurrentView('admin')}
              style={{ color: 'var(--secondary)' }}
            >
              <ShieldCheck size={16} />
              <span>Admin Panel</span>
            </button>
          )}
        </nav>

        <div className="nav-actions">
          {/* Theme Toggle */}
          <button 
            className="btn-icon" 
            onClick={toggleTheme} 
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* User Profile / Auth Action */}
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                background: 'var(--bg-subtle)',
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border-subtle)'
              }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: 'var(--radius-full)',
                  background: isAdmin ? 'var(--secondary)' : 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}>
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user?.name?.split(' ')[0]}</span>
                <span className="badge" style={{
                  fontSize: '0.65rem',
                  padding: '0.1rem 0.4rem',
                  background: isAdmin ? 'rgba(99, 102, 241, 0.2)' : 'rgba(14, 165, 233, 0.2)',
                  color: isAdmin ? 'var(--secondary)' : 'var(--primary)'
                }}>
                  {isAdmin ? 'ADMIN' : 'EXPLORER'}
                </span>
              </div>

              <button
                className="btn-icon"
                onClick={logout}
                title="Log Out"
                aria-label="Log Out"
              >
                <LogOut size={16} style={{ color: 'var(--accent-coral)' }} />
              </button>
            </div>
          ) : (
            <button
              className="btn btn-secondary btn-sm"
              onClick={onOpenAuth}
            >
              <LogIn size={15} />
              <span>Sign In / Register</span>
            </button>
          )}

          {/* Plan New Trip CTA */}
          <button 
            className="btn btn-primary"
            onClick={onOpenNewTrip}
          >
            <Sparkles size={16} />
            <span>Plan New Trip</span>
          </button>
        </div>
      </div>
    </header>
  );
}
