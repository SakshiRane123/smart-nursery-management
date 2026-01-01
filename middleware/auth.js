const jwt = require('jsonwebtoken');
const db = require('../config/database');

// JWT Token Authentication (for API routes)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    next();
  };
};

// Session-based Authentication (for EJS pages)
const authenticateSession = (req, res, next) => {
  if (req.session && req.session.user) {
    req.user = req.session.user; // Make user available in req.user
    next();
  } else {
    console.log('No session found, redirecting to login');
    res.redirect('/auth/login');
  }
};

const authorizeSessionRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.session.user || !roles.includes(req.session.user.role)) {
      console.log('Insufficient permissions for role:', req.session.user?.role);
      return res.redirect('/auth/login');
    }
    next();
  };
};

// Make sure ALL functions are exported
module.exports = { 
  authenticateToken, 
  authorizeRoles, 
  authenticateSession, 
  authorizeSessionRoles 
};