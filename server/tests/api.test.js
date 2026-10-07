const test = require('node:test');
const assert = require('node:assert');
const http = require('http');
const app = require('../server');

let server;
let baseUrl;

test.before((t, done) => {
  server = http.createServer(app);
  server.listen(0, () => {
    const port = server.address().port;
    baseUrl = `http://localhost:${port}`;
    done();
  });
});

test.after((t, done) => {
  server.close(done);
});

async function apiRequest(endpoint, options = {}) {
  const url = `${baseUrl}${endpoint}`;
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  const data = await response.json();
  return { status: response.status, data };
}

test('API Health Check', async () => {
  const { status, data } = await apiRequest('/api/health');
  assert.strictEqual(status, 200);
  assert.strictEqual(data.status, 'online');
  assert.strictEqual(data.app, 'VoyageCraft Travel Planner API');
});

test('GET /api/destinations returns curated destinations', async () => {
  const { status, data } = await apiRequest('/api/destinations');
  assert.strictEqual(status, 200);
  assert.strictEqual(data.success, true);
  assert.ok(data.data.length >= 3);
  assert.ok(data.data.some(d => d.name === 'Tokyo'));
});

test('GET /api/destinations/:id returns full destination detail and weather', async () => {
  const { status, data } = await apiRequest('/api/destinations/dest-paris');
  assert.strictEqual(status, 200);
  assert.strictEqual(data.success, true);
  assert.strictEqual(data.data.name, 'Paris');
  assert.ok(data.data.weather.forecast.length > 0);
  assert.ok(data.data.attractions.length > 0);
});

test('Full Trip Lifecycle: Create, Plan, Add Activity, Add Expense, Delete', async () => {
  // 1. Create a trip with autoGenerate
  const createRes = await apiRequest('/api/trips', {
    method: 'POST',
    body: JSON.stringify({
      title: 'Automated Test Alpine Expedition',
      destination: 'Swiss Alps (Interlaken)',
      startDate: '2026-12-10',
      endDate: '2026-12-13',
      travelStyle: 'Adventure & Nature',
      budget: 1500,
      autoGenerate: true
    })
  });

  assert.strictEqual(createRes.status, 201);
  assert.strictEqual(createRes.data.success, true);
  const trip = createRes.data.data;
  assert.ok(trip.id);
  assert.strictEqual(trip.days.length, 4);
  assert.ok(trip.packingList.length > 0);

  // 2. Add an activity
  const actRes = await apiRequest(`/api/trips/${trip.id}/activities`, {
    method: 'POST',
    body: JSON.stringify({
      dayNumber: 1,
      time: '11:00',
      title: 'Glacier Walk Experience',
      category: 'Adventure',
      cost: 45,
      location: 'Interlaken Mountain Base'
    })
  });
  assert.strictEqual(actRes.status, 201);
  assert.strictEqual(actRes.data.data.title, 'Glacier Walk Experience');

  // 3. Add an expense
  const expRes = await apiRequest(`/api/trips/${trip.id}/expenses`, {
    method: 'POST',
    body: JSON.stringify({
      title: 'Cable Car Pass',
      category: 'Transportation',
      amount: 60,
      currency: 'CHF'
    })
  });
  assert.strictEqual(expRes.status, 201);
  assert.strictEqual(expRes.data.data.amount, 60);

  // 4. Verify trip detail reflects updates
  const getRes = await apiRequest(`/api/trips/${trip.id}`);
  assert.strictEqual(getRes.status, 200);
  assert.strictEqual(getRes.data.data.expenses.length, 1);

  // 5. Test AI generator preview endpoint
  const aiRes = await apiRequest('/api/ai-plan/generate', {
    method: 'POST',
    body: JSON.stringify({
      destination: 'Rome',
      startDate: '2026-09-25',
      endDate: '2026-09-28',
      travelStyle: 'Foodie Tour'
    })
  });
  assert.strictEqual(aiRes.status, 200);
  assert.strictEqual(aiRes.data.success, true);
  assert.strictEqual(aiRes.data.data.days.length, 4);

  // 6. Clean up: Delete the created test trip
  const delRes = await apiRequest(`/api/trips/${trip.id}`, { method: 'DELETE' });
  assert.strictEqual(delRes.status, 200);
  assert.strictEqual(delRes.data.success, true);

  // 7. Verify deletion
  const checkRes = await apiRequest(`/api/trips/${trip.id}`);
  assert.strictEqual(checkRes.status, 404);
});

test('Authentication: Register, Login, and Protected /me endpoint', async () => {
  const testEmail = `testuser_${Date.now()}@example.com`;

  // 1. Register new user
  const regRes = await apiRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Maya Lin',
      email: testEmail,
      password: 'SecurePassword123!',
      role: 'user'
    })
  });
  assert.strictEqual(regRes.status, 201);
  assert.strictEqual(regRes.data.success, true);
  assert.strictEqual(regRes.data.user.email, testEmail);
  assert.ok(regRes.data.token);

  // 2. Login with registered user
  const loginRes = await apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: testEmail,
      password: 'SecurePassword123!'
    })
  });
  assert.strictEqual(loginRes.status, 200);
  assert.strictEqual(loginRes.data.success, true);
  assert.strictEqual(loginRes.data.user.role, 'user');
  const userToken = loginRes.data.token;

  // 3. Check /api/auth/me
  const meRes = await apiRequest('/api/auth/me', {
    headers: { Authorization: `Bearer ${userToken}` }
  });
  assert.strictEqual(meRes.status, 200);
  assert.strictEqual(meRes.data.user.email, testEmail);

  // 4. Verify regular user is forbidden from admin stats
  const forbidRes = await apiRequest('/api/admin/stats', {
    headers: { Authorization: `Bearer ${userToken}` }
  });
  assert.strictEqual(forbidRes.status, 403);
});

test('Admin Access Control and User Management', async () => {
  // 1. Login with pre-seeded admin
  const adminLogin = await apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'admin@voyagecraft.com',
      password: 'Admin@1234'
    })
  });
  assert.strictEqual(adminLogin.status, 200);
  assert.strictEqual(adminLogin.data.user.role, 'admin');
  const adminToken = adminLogin.data.token;

  // 2. Access admin stats
  const statsRes = await apiRequest('/api/admin/stats', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  assert.strictEqual(statsRes.status, 200);
  assert.strictEqual(statsRes.data.success, true);
  assert.ok(statsRes.data.data.totalUsers >= 2);

  // 3. Access admin users list
  const usersRes = await apiRequest('/api/admin/users', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  assert.strictEqual(usersRes.status, 200);
  assert.strictEqual(usersRes.data.success, true);
  assert.ok(usersRes.data.data.length >= 2);
});
