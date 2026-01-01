const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();
const session = require('express-session');
const app = express();
const PORT = process.env.PORT || 3000;
const db = require('./config/database');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Basic Express middleware

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(cors());
// Session middleware
app.use(session({
  secret: process.env.JWT_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, // Should be true in production with HTTPS
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true
  } 
}));

// Add this RIGHT AFTER your session middleware
app.use((req, res, next) => {
  console.log('🕵️‍♂️ === REQUEST DETECTED ===');
  console.log('URL:', req.url);
  console.log('Method:', req.method);
  console.log('From page:', req.get('Referrer'));
  console.log('Is browser:', req.get('User-Agent').includes('Mozilla'));
  console.log('===========================');
  
  // BLOCK automatic dashboard requests
  if (req.url === '/dashboard' && (!req.get('Referrer') || req.get('Referrer').includes('/dashboard'))) {
    console.log('🚫 BLOCKING automatic dashboard request!');
    return res.status(200).send(`
      <h1>Auto-redirect Blocked</h1>
      <p>We blocked an automatic request to /dashboard.</p>
      <p>This is likely caused by a browser extension or prefetching.</p>
      <a href="/auth/login">Go to Login</a>
    `);
  }
  
  next();
});



// Static files
app.use(express.static(path.join(__dirname, 'public')));

// In server.js, add this:
const getCartCount = require('./middleware/cartCount');

// Add this middleware BEFORE your routes
app.use(getCartCount); // This makes cartCount available to ALL templates


const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const customerRoutes = require('./routes/customer');
const plantRoutes = require('./routes/plants');
const adminOrderRoutes = require('./routes/admin-orders');
const taskRoutes = require('./routes/tasks');
const growthTrackerRoutes = require('./routes/growthTracker');
const plantGPTroutes = require('./routes/plantGPT');

// Routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/admin', adminRoutes);
app.use('/customer', customerRoutes);
app.use('/', taskRoutes);
app.use('/', plantRoutes);
app.use('/', adminOrderRoutes);
app.use('/', growthTrackerRoutes);
app.use('/', plantGPTroutes);

// Test session route
app.get('/test-session', (req, res) => {
  if (!req.session.views) {
    req.session.views = 1;
    req.session.testData = 'Session is working!';
    res.send('Session started. Refresh to increment views.');
  } else {
    req.session.views++;
    res.send(`Views: ${req.session.views}, Data: ${req.session.testData}`);
  }
});


// Add this to server.js before your error handlers
app.get('/debug-routes', (req, res) => {
  const routes = [];
  
  app._router.stack.forEach(middleware => {
    if (middleware.route) {
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods)
      });
    } else if (middleware.name === 'router') {
      middleware.handle.stack.forEach(handler => {
        if (handler.route) {
          routes.push({
            path: handler.route.path,
            methods: Object.keys(handler.route.methods)
          });
        }
      });
    }
  });
  
  res.json(routes);
});

// Basic route
app.get('/', (req, res) => {
  res.render('index', { 
    title: 'Home - Nursery Management System',
    user: req.session.user || null, // No user logged in initially
    script: null 
  });
});

// Simple dashboard routes
// Dashboard routes - MAKE SURE THESE ARE UNCOMMENTED
app.get('/dashboard', (req, res) => {
  // Check if user exists in session
  if (!req.session || !req.session.user) {
    console.log('No user session, redirecting to login');
    return res.redirect('/auth/login');
  }
  console.log('Rendering customer dashboard for:', req.session.user.username);
  res.render('customer/dashboard', { 
    title: 'Dashboard',
    user: req.session.user
  });
});

app.get('/admin/dashboard', (req, res) => {
  if (!req.session || !req.session.user || req.session.user.role !== 'admin') {
    console.log('Unauthorized access to admin dashboard');
    return res.redirect('/auth/login');
  }
  console.log('Rendering admin dashboard for:', req.session.user.username);
  res.render('admin/dashboard', { 
    title: 'Admin Dashboard',
    user: req.session.user
  });
});

app.get('/caretaker/dashboard', (req, res) => {
  if (!req.session || !req.session.user || req.session.user.role !== 'caretaker') {
    console.log('Unauthorized access to caretaker dashboard');
    return res.redirect('/auth/login');
  }
  console.log('Rendering caretaker dashboard for:', req.session.user.username);
  res.render('caretaker/dashboard', { 
    title: 'Caretaker Dashboard',
    user: req.session.user
  });
});



// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).render('error', { 
    title: 'Page Not Found',
    message: 'The page you are looking for does not exist.'
  });
});




// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});