const API_BASE = '/api';

function getAuthHeader() {
  const token = localStorage.getItem('voyagecraft_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

async function request(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
        ...(options.headers || {})
      },
      ...options
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || `HTTP error ${res.status}`);
    }
    return data;
  } catch (err) {
    console.error(`API Error [${endpoint}]:`, err);
    throw err;
  }
}

export const api = {
  // Authentication
  register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  getMe: () => request('/auth/me'),

  // Admin Management
  getAdminStats: () => request('/admin/stats'),
  getAdminUsers: () => request('/admin/users'),
  updateUserRole: (userId, role) => request(`/admin/users/${userId}/role`, { method: 'PUT', body: JSON.stringify({ role }) }),
  deleteUser: (userId) => request(`/admin/users/${userId}`, { method: 'DELETE' }),
  addAdminDestination: (destData) => request('/admin/destinations', { method: 'POST', body: JSON.stringify(destData) }),
  deleteAdminDestination: (destId) => request(`/admin/destinations/${destId}`, { method: 'DELETE' }),

  // Trips
  getTrips: () => request('/trips'),
  getTrip: (id) => request(`/trips/${id}`),
  createTrip: (tripData) => request('/trips', { method: 'POST', body: JSON.stringify(tripData) }),
  updateTrip: (id, tripData) => request(`/trips/${id}`, { method: 'PUT', body: JSON.stringify(tripData) }),
  deleteTrip: (id) => request(`/trips/${id}`, { method: 'DELETE' }),

  // Days & Activities
  addDay: (tripId, dayData) => request(`/trips/${tripId}/days`, { method: 'POST', body: JSON.stringify(dayData) }),
  deleteDay: (tripId, dayNumber) => request(`/trips/${tripId}/days/${dayNumber}`, { method: 'DELETE' }),
  addActivity: (tripId, actData) => request(`/trips/${tripId}/activities`, { method: 'POST', body: JSON.stringify(actData) }),
  updateActivity: (tripId, actId, actData) => request(`/trips/${tripId}/activities/${actId}`, { method: 'PUT', body: JSON.stringify(actData) }),
  deleteActivity: (tripId, actId) => request(`/trips/${tripId}/activities/${actId}`, { method: 'DELETE' }),

  // Expenses & Budget
  getExpenses: (tripId) => request(`/trips/${tripId}/expenses`),
  addExpense: (tripId, expData) => request(`/trips/${tripId}/expenses`, { method: 'POST', body: JSON.stringify(expData) }),
  updateExpense: (tripId, expId, expData) => request(`/trips/${tripId}/expenses/${expId}`, { method: 'PUT', body: JSON.stringify(expData) }),
  deleteExpense: (tripId, expId) => request(`/trips/${tripId}/expenses/${expId}`, { method: 'DELETE' }),

  // Packing Checklist
  getPacking: (tripId) => request(`/trips/${tripId}/packing`),
  addPackingItem: (tripId, itemData) => request(`/trips/${tripId}/packing`, { method: 'POST', body: JSON.stringify(itemData) }),
  updatePackingItem: (tripId, itemId, itemData) => request(`/trips/${tripId}/packing/${itemId}`, { method: 'PUT', body: JSON.stringify(itemData) }),
  deletePackingItem: (tripId, itemId) => request(`/trips/${tripId}/packing/${itemId}`, { method: 'DELETE' }),
  generatePacking: (tripId) => request(`/trips/${tripId}/packing/generate`, { method: 'POST' }),

  // Destinations & Weather
  getDestinations: (params = '') => request(`/destinations${params ? `?${params}` : ''}`),
  getDestination: (id) => request(`/destinations/${id}`),
  getDestinationWeather: (id) => request(`/destinations/${id}/weather`),

  // AI Smart Planner
  generateAIPlan: (planParams) => request('/ai-plan/generate', { method: 'POST', body: JSON.stringify(planParams) })
};
