import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Users, MapPin, DollarSign, Plus, Trash2, 
  ArrowUpRight, ArrowDownRight, Compass, RefreshCw, X, Sparkles 
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTrips } from '../context/TripContext';

export default function AdminDashboard() {
  const { user: currentUser } = useAuth();
  const { showToast } = useTrips();

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'destinations'
  const [addDestModal, setAddDestModal] = useState(false);

  // New Destination Form
  const [destName, setDestName] = useState('');
  const [destCountry, setDestCountry] = useState('');
  const [destRegion, setDestRegion] = useState('Europe');
  const [destTagline, setDestTagline] = useState('');
  const [destClimate, setDestClimate] = useState('Temperate');
  const [destDailyCost, setDestDailyCost] = useState(130);
  const [destImage, setDestImage] = useState('');

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, destsRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminUsers(),
        api.getDestinations()
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (usersRes.success) setUsers(usersRes.data);
      if (destsRes.success) setDestinations(destsRes.data);
    } catch (err) {
      showToast(err.message || 'Failed to load admin management data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleToggleRole = async (targetUser) => {
    const nextRole = targetUser.role === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Change ${targetUser.name}'s role from ${targetUser.role.toUpperCase()} to ${nextRole.toUpperCase()}?`)) {
      return;
    }

    try {
      const res = await api.updateUserRole(targetUser.id, nextRole);
      if (res.success) {
        showToast(res.message);
        await loadAdminData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to update user role', 'error');
    }
  };

  const handleDeleteUser = async (targetUser) => {
    if (targetUser.id === currentUser?.id) {
      showToast('You cannot delete your own active administrator account', 'error');
      return;
    }

    if (!window.confirm(`Permanently delete user "${targetUser.name}" and all their trips?`)) {
      return;
    }

    try {
      const res = await api.deleteUser(targetUser.id);
      if (res.success) {
        showToast(res.message);
        await loadAdminData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete user', 'error');
    }
  };

  const handleCreateDestination = async (e) => {
    e.preventDefault();
    if (!destName.trim() || !destCountry.trim()) return;

    try {
      const res = await api.addAdminDestination({
        name: destName.trim(),
        country: destCountry.trim(),
        region: destRegion,
        tagline: destTagline.trim(),
        climate: destClimate,
        averageDailyCost: Number(destDailyCost || 120),
        coverImage: destImage.trim() || undefined
      });

      if (res.success) {
        showToast(`Destination "${res.data.name}" added to public catalog!`);
        setAddDestModal(false);
        setDestName('');
        setDestCountry('');
        setDestTagline('');
        await loadAdminData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to add destination', 'error');
    }
  };

  const handleDeleteDestination = async (destId, name) => {
    if (!window.confirm(`Remove destination "${name}" from the global catalog?`)) return;

    try {
      const res = await api.deleteAdminDestination(destId);
      if (res.success) {
        showToast(res.message);
        await loadAdminData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete destination', 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Admin Platform Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(14, 165, 233, 0.1) 100%)',
        border: '1px solid var(--border-card)',
        borderRadius: 'var(--radius-xl)',
        padding: '2.5rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.5rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.2)', color: 'var(--secondary)', border: '1px solid var(--secondary)' }}>
              <ShieldCheck size={13} /> Administrator Console
            </span>
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.4rem' }}>
            Platform Control & User Management
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
            Manage registered accounts, assign administrative roles, and curate global destinations.
          </p>
        </div>

        <button 
          className="btn btn-secondary btn-sm"
          onClick={loadAdminData}
          disabled={loading}
        >
          <RefreshCw size={14} className={loading ? 'spinning' : ''} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Platform Overview Metrics */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--secondary)' }}>
            <Users size={24} />
          </div>
          <div>
            <div className="stat-number">{stats?.totalUsers || 0}</div>
            <div className="stat-label">Total Accounts ({stats?.adminCount || 0} Admins)</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(14, 165, 233, 0.15)', color: 'var(--primary)' }}>
            <Compass size={24} />
          </div>
          <div>
            <div className="stat-number">{stats?.totalTrips || 0}</div>
            <div className="stat-label">Platform Trips</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)' }}>
            <DollarSign size={24} />
          </div>
          <div>
            <div className="stat-number">${(stats?.totalBudget || 0).toLocaleString()}</div>
            <div className="stat-label">Total Platform Budget</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-amber)' }}>
            <MapPin size={24} />
          </div>
          <div>
            <div className="stat-number">{destinations.length}</div>
            <div className="stat-label">Curated Destinations</div>
          </div>
        </div>
      </div>

      {/* Admin Section Tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
        <button
          className={`btn btn-sm ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('users')}
        >
          <Users size={15} />
          <span>User Management ({users.length})</span>
        </button>

        <button
          className={`btn btn-sm ${activeTab === 'destinations' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('destinations')}
        >
          <MapPin size={15} />
          <span>Destinations Catalog ({destinations.length})</span>
        </button>
      </div>

      {/* Tab 1: User Management */}
      {activeTab === 'users' && (
        <div style={{
          backgroundColor: 'var(--bg-card)',
          backdropFilter: 'blur(14px)',
          border: '1px solid var(--border-card)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.75rem',
          boxShadow: 'var(--shadow-md)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Registered Users</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                View accounts, promote to Admin, or delete users
              </p>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="expense-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Trips</th>
                  <th>Joined</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isCurrent = u.id === currentUser?.id;
                  return (
                    <tr key={u.id}>
                      <td style={{ fontWeight: 600 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: 'var(--radius-full)',
                            background: u.role === 'admin' ? 'var(--secondary)' : 'var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#FFF',
                            fontSize: '0.75rem',
                            fontWeight: 700
                          }}>
                            {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <span>{u.name}</span>
                          {isCurrent && (
                            <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 700 }}>(You)</span>
                          )}
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                      <td>
                        <span className={`badge ${u.role === 'admin' ? 'badge-category' : 'badge-upcoming'}`}>
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{u.tripsCount || 0}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                          {!isCurrent && (
                            <>
                              <button
                                className="btn btn-outline btn-sm"
                                onClick={() => handleToggleRole(u)}
                                title={`Change role to ${u.role === 'admin' ? 'user' : 'admin'}`}
                              >
                                {u.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                              </button>

                              <button
                                className="btn-icon btn-sm"
                                onClick={() => handleDeleteUser(u)}
                                title="Delete User Account"
                              >
                                <Trash2 size={14} style={{ color: 'var(--accent-coral)' }} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Destination Catalog Management */}
      {activeTab === 'destinations' && (
        <div style={{
          backgroundColor: 'var(--bg-card)',
          backdropFilter: 'blur(14px)',
          border: '1px solid var(--border-card)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.75rem',
          boxShadow: 'var(--shadow-md)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Curated Global Catalog</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Add or remove destinations available to travelers
              </p>
            </div>

            <button
              className="btn btn-primary btn-sm"
              onClick={() => setAddDestModal(true)}
            >
              <Plus size={15} />
              <span>Add Destination</span>
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="expense-table">
              <thead>
                <tr>
                  <th>Destination</th>
                  <th>Country</th>
                  <th>Climate</th>
                  <th>Avg Daily Cost</th>
                  <th>Attractions</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {destinations.map((d) => (
                  <tr key={d.id}>
                    <td style={{ fontWeight: 700 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>{d.flag}</span>
                        <span>{d.name}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{d.country} ({d.region})</td>
                    <td>
                      <span className="badge badge-upcoming" style={{ fontSize: '0.72rem' }}>
                        {d.climate}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--accent-emerald)' }}>
                      ${d.averageDailyCost} / day
                    </td>
                    <td>{(d.attractions || []).length} Sights</td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn-icon btn-sm"
                        onClick={() => handleDeleteDestination(d.id, d.name)}
                        title="Delete Destination"
                      >
                        <Trash2 size={14} style={{ color: 'var(--accent-coral)' }} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Destination Modal */}
      {addDestModal && (
        <div className="modal-backdrop" onClick={() => setAddDestModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} role="dialog">
            <div className="modal-header">
              <h2 style={{ fontSize: '1.2rem' }}>Add New Destination to Catalog</h2>
              <button className="btn-icon" onClick={() => setAddDestModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateDestination}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">City / Destination Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Barcelona, Kyoto, Florence"
                      value={destName}
                      onChange={(e) => setDestName(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Country *</label>
                    <input
                      type="text"
                      placeholder="e.g. Spain, Japan, Italy"
                      value={destCountry}
                      onChange={(e) => setDestCountry(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Region</label>
                    <select value={destRegion} onChange={(e) => setDestRegion(e.target.value)}>
                      <option value="Western Europe">Western Europe</option>
                      <option value="Southern Europe">Southern Europe</option>
                      <option value="East Asia">East Asia</option>
                      <option value="Southeast Asia">Southeast Asia</option>
                      <option value="North America">North America</option>
                      <option value="South America">South America</option>
                      <option value="Middle East">Middle East</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Climate</label>
                    <select value={destClimate} onChange={(e) => setDestClimate(e.target.value)}>
                      <option value="Mediterranean">Mediterranean</option>
                      <option value="Temperate">Temperate</option>
                      <option value="Tropical">Tropical</option>
                      <option value="Alpine">Alpine</option>
                      <option value="Desert">Desert</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Tagline</label>
                  <input
                    type="text"
                    placeholder="e.g. The gothic heart of Catalonia with sun-drenched tapas bars"
                    value={destTagline}
                    onChange={(e) => setDestTagline(e.target.value)}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Average Daily Cost ($)</label>
                    <input
                      type="number"
                      min="10"
                      value={destDailyCost}
                      onChange={(e) => setDestDailyCost(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Cover Image URL</label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={destImage}
                      onChange={(e) => setDestImage(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setAddDestModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Sparkles size={15} />
                  <span>Add Destination</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
