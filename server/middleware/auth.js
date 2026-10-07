const { readJSON } = require('../services/storage');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, error: 'Authentication token required' });
  }

  const users = readJSON('users.json', []);
  const user = users.find(u => (u.tokens || []).includes(token));

  if (!user) {
    return res.status(403).json({ success: false, error: 'Invalid or expired session token' });
  }

  req.user = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role || 'user'
  };
  req.token = token;
  next();
}

function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    const users = readJSON('users.json', []);
    const user = users.find(u => (u.tokens || []).includes(token));
    if (user) {
      req.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role || 'user'
      };
      req.token = token;
    }
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Administrator access required' });
  }
  next();
}

module.exports = {
  authenticateToken,
  optionalAuth,
  requireAdmin
};
