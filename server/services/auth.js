const crypto = require('crypto');

// Generate a random 16-byte salt in hex
function generateSalt() {
  return crypto.randomBytes(16).toString('hex');
}

// Hash password with salt using PBKDF2 (100,000 iterations, sha512)
function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
}

// Verify password against stored salt and hash
function verifyPassword(password, salt, hash) {
  const computedHash = hashPassword(password, salt);
  return crypto.timingSafeEqual(Buffer.from(computedHash, 'hex'), Buffer.from(hash, 'hex'));
}

// Generate secure random session token
function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

module.exports = {
  generateSalt,
  hashPassword,
  verifyPassword,
  generateToken
};
