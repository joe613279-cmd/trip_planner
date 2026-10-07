import React, { useState } from 'react';
import { X, Lock, Mail, User, ShieldCheck, Sparkles, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTrips } from '../context/TripContext';

export default function AuthModal({ isOpen, onClose }) {
  const { login, register } = useAuth();
  const { showToast } = useTrips();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user'); // 'user' | 'admin'
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const user = await login(email, password);
        showToast(`Welcome back, ${user.name}!`);
        onClose();
      } else {
        const user = await register({ name, email, password, role });
        showToast(`Welcome to VoyageCraft, ${user.name}! Account registered.`);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (quickEmail, quickPassword) => {
    setError('');
    setLoading(true);
    try {
      const user = await login(quickEmail, quickPassword);
      showToast(`Signed in as ${user.name} (${user.role.toUpperCase()})`);
      onClose();
    } catch (err) {
      setError(err.message || 'Quick login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        role="dialog"
        style={{ maxWidth: '460px' }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div className="brand-icon" style={{ width: '32px', height: '32px' }}>
              <Lock size={16} />
            </div>
            <h2 style={{ fontSize: '1.25rem' }}>
              {mode === 'login' ? 'Sign In to VoyageCraft' : 'Create an Account'}
            </h2>
          </div>
          <button className="btn-icon" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Tab switch between Sign In and Register */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          padding: '0.5rem 1.75rem 0',
          gap: '0.5rem'
        }}>
          <button
            type="button"
            className={`btn btn-sm ${mode === 'login' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => { setMode('login'); setError(''); }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`btn btn-sm ${mode === 'register' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => { setMode('register'); setError(''); }}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ paddingTop: '1.25rem' }}>
            {error && (
              <div style={{
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(244, 63, 94, 0.15)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                color: 'var(--accent-coral)',
                fontSize: '0.85rem',
                fontWeight: 600
              }}>
                {error}
              </div>
            )}

            {mode === 'register' && (
              <div className="form-group">
                <label className="form-label">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <User size={14} /> Full Name *
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Alex Rivera"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Mail size={14} /> Email Address *
                </span>
              </label>
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus={mode === 'login'}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <KeyRound size={14} /> Password *
                </span>
              </label>
              <input
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            {mode === 'register' && (
              <div className="form-group">
                <label className="form-label">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <ShieldCheck size={14} /> Account Role
                  </span>
                </label>
                <select value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="user">Explorer (Standard Traveler)</option>
                  <option value="admin">Administrator (Full System & User Control)</option>
                </select>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {role === 'admin' 
                    ? 'Admins can view and manage all platform users, trips, and curated destinations.'
                    : 'Explorers can plan, customize, and save their own travel itineraries.'}
                </span>
              </div>
            )}

            {/* Quick Demo Credentials Bar */}
            <div style={{
              padding: '0.85rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-subtle)',
              marginTop: '0.5rem'
            }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                ⚡ Quick Demo One-Click Login
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleQuickLogin('admin@voyagecraft.com', 'Admin@1234')}
                  disabled={loading}
                  style={{ fontSize: '0.78rem', justifyContent: 'flex-start' }}
                >
                  <ShieldCheck size={14} style={{ color: 'var(--primary)' }} />
                  <span>Demo Admin</span>
                </button>

                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleQuickLogin('traveler@voyagecraft.com', 'Traveler@123')}
                  disabled={loading}
                  style={{ fontSize: '0.78rem', justifyContent: 'flex-start' }}
                >
                  <User size={14} style={{ color: 'var(--secondary)' }} />
                  <span>Demo Traveler</span>
                </button>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <Sparkles size={16} className="spinning" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>{mode === 'login' ? 'Sign In' : 'Complete Registration'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
