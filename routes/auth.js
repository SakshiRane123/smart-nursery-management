const express = require('express');
const router = express.Router();
const { register, login, getProfile } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');


router.use((req, res, next) => {
  console.log(`Auth route hit: ${req.method} ${req.path}`);
  next();
});

// Render registration page (GET)
router.get('/register', (req, res) => {
  console.log('GET /auth/register - Rendering register form');
  res.render('auth/register', { 
    title: 'Register',
    user: null,
    message: null,
    script: '/js/auth.js'
  });
});



// Add EXTREME debugging for form submissions
router.post('/register', (req, res) => {
  console.log('🔵 === REGISTER FORM SUBMISSION START ===');
  console.log('Headers:', req.headers);
  console.log('Content-Type:', req.get('Content-Type'));
  console.log('Body:', req.body);
  console.log('Session ID:', req.sessionID);
  console.log('Session data:', req.session);
  
  // Check if body is parsed correctly
  if (!req.body || Object.keys(req.body).length === 0) {
    console.log('❌ ERROR: Request body is empty or not parsed!');
    console.log('Raw request:');
    console.log(req);
    
    // Return error response immediately
    return res.render('auth/register', {
      title: 'Register',
      user: null,
      message: { type: 'danger', text: 'Form data not received. Please try again.' }
    });
  }
  
  console.log('✅ Form data received successfully');
  register(req, res);
});



// Render login page (GET)
router.get('/login', (req, res) => {
    console.log('GET /auth/login - Rendering login form');
  res.render('auth/login', { 
    title: 'Login',
    user: null,
    message: null,
    script: '/js/auth.js'
  });
});

// Handle login form submission (POST)
router.post('/login', (req, res) => {
  console.log('🟢 === LOGIN FORM SUBMISSION START ===');
  console.log('Headers:', req.headers);
  console.log('Content-Type:', req.get('Content-Type'));
  console.log('Body:', req.body);
  console.log('Session ID:', req.sessionID);
  console.log('Session data:', req.session);
  
  if (!req.body || Object.keys(req.body).length === 0) {
    console.log('❌ ERROR: Request body is empty or not parsed!');
    return res.render('auth/login', {
      title: 'Login',
      user: null,
      message: { type: 'danger', text: 'Form data not received. Please try again.' }
    });
  }
  
  console.log('✅ Form data received successfully');
  login(req, res);
});

// Logout
router.get('/logout', (req, res) => {
  console.log('GET /auth/logout - Logging out');
  res.redirect('/');
});

// Protected route example
router.get('/profile', authenticateToken, getProfile);

module.exports = router;