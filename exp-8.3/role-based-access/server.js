// server.js (CommonJS)
require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
const PORT = process.env.PORT || 3000;

// ---- Middleware: verifyToken ----
function verifyToken(req, res, next) {
  // Accept either "Authorization: Bearer <token>" or "token" header
  const authHeader = req.headers['authorization'] || req.headers['token'];
  if (!authHeader) {
    return res.status(401).json({ message: 'Access token missing' });
  }

  // If header is "Bearer <token>", split; otherwise assume header itself is token
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : authHeader;

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = decoded; // attach decoded payload to request
    next();
  });
}

// ---- Middleware: role check (RBAC) ----
function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    const userRole = req.user && req.user.role;
    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(403).json({ message: 'Access denied: insufficient role' });
    }
    next();
  };
}

// ---- Route: login (generate token) ----
// POST /login
// body: { "username": "alice", "role": "Moderator" }
app.post('/login', (req, res) => {
  const { username, role } = req.body || {};
  if (!username || !role) {
    return res.status(400).json({ message: 'username and role required in body' });
  }

  // Example payload — add any fields you need (avoid sensitive data)
  const payload = {
    id: Math.floor(Math.random() * 1000) + 1, // demo id
    username,
    role
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '2h' });
  res.json({ token, expiresIn: '2h' });
});

// ---- Protected route: user-profile (GET) ----
app.get('/user-profile', verifyToken, (req, res) => {
  res.json({
    message: `Welcome to your profile, ${req.user.username}`,
    user: req.user
  });
});

// (Optional) If you want to allow POST for user-profile as well, add POST handler:
app.post('/user-profile', verifyToken, (req, res) => {
  res.json({
    message: `POST to profile successful for ${req.user.username}`,
    user: req.user
  });
});

// ---- Protected route: moderator-panel (GET only for Moderator) ----
app.get('/moderator-panel', verifyToken, authorizeRoles('Moderator'), (req, res) => {
  res.json({ message: `Welcome to the Moderator Panel, ${req.user.username}` });
});

// ---- Start server ----
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
