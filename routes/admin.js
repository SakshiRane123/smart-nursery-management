const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticateSession, authorizeSessionRoles } = require('../middleware/auth');

// Admin dashboard route - WEB PAGE
router.get('/dashboard', authenticateSession, authorizeSessionRoles('admin'), async (req, res) => {
  try {
    const users = await User.getAll();
    
    // Get recent users (last 5)
    const recentUsers = users.slice(-5).reverse();
    
    // Create stats
    const stats = {
      totalUsers: users.length,
      totalPlants: 0, // You'll update this when you have plants table
      totalOrders: 0  // You'll update this when you have orders table
    };

    res.render('admin/dashboard', { 
      title: 'Admin Dashboard',
      user: req.session.user,
      recentUsers: recentUsers,
      stats: stats
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).render('error', { 
      title: 'Error',
      message: 'Error loading dashboard' 
    });
  }
});

// User management page - WEB PAGE
// Temporary route using simple template
router.get('/users', authenticateSession, authorizeSessionRoles('admin'), async (req, res) => {
  try {
    const users = await User.getAll();
    res.render('admin/simple-users', { 
      title: 'Manage Users',
      user: req.session.user,
      users: users
    });
  } catch (error) {
    console.error('Users page error:', error);
    res.status(500).render('error', { 
      title: 'Error',
      message: 'Error loading users' 
    });
  }
});

// Create user form (admin only) - WEB PAGE
// Create user form (admin only) - WEB PAGE
router.get('/create-user', authenticateSession, authorizeSessionRoles('admin'), (req, res) => {
  console.log('=== ACCESSING CREATE USER FORM ===');
  console.log('Session user:', req.session.user);
  console.log('Session ID:', req.sessionID);
  
  res.render('admin/create-user', { 
    title: 'Create User',
    user: req.session.user,
    message: null
  });
});

// Create user (admin only) - WEB FORM HANDLER
router.post('/create-user', authenticateSession, authorizeSessionRoles('admin'), async (req, res) => {
  try {
    const { username, password, email, role, first_name, last_name, phone } = req.body;
    
    // Validate required fields
    if (!username || !password || !email || !role || !first_name || !last_name) {
      return res.render('admin/create-user', {
        title: 'Create User',
        user: req.session.user,
        message: { type: 'danger', text: 'All fields are required' }
      });
    }
    
    // Validate role
    if (!['admin', 'caretaker', 'customer'].includes(role)) {
      return res.render('admin/create-user', {
        title: 'Create User',
        user: req.session.user,
        message: { type: 'danger', text: 'Invalid role specified' }
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      return res.render('admin/create-user', {
        title: 'Create User',
        user: req.session.user,
        message: { type: 'danger', text: 'Username already exists' }
      });
    }
    
    // Check if email already exists
    const existingEmail = await User.findByEmail(email);
    if (existingEmail) {
      return res.render('admin/create-user', {
        title: 'Create User',
        user: req.session.user,
        message: { type: 'danger', text: 'Email already registered' }
      });
    }
    
    // Create user
    const userId = await User.create({
      username,
      password,
      email,
      role,
      first_name,
      last_name,
      phone: phone || null
    });
    
    res.render('admin/create-user', {
      title: 'Create User',
      user: req.session.user,
      message: { type: 'success', text: 'User created successfully! User ID: ' + userId }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.render('admin/create-user', {
      title: 'Create User',
      user: req.session.user,
      message: { type: 'danger', text: 'Error creating user: ' + error.message }
    });
  }
});

// Edit user form (admin only) - WEB PAGE
router.get('/edit-user/:id', authenticateSession, authorizeSessionRoles('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).render('error', {
        title: 'Not Found',
        message: 'User not found'
      });
    }
    
    res.render('admin/edit-user', {
      title: 'Edit User',
      user: req.session.user,
      userData: user,
      message: null
    });
  } catch (error) {
    console.error('Edit user form error:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Error loading user edit form'
    });
  }
});

// Update user (admin only) - WEB FORM HANDLER
router.post('/update-user/:id', authenticateSession, authorizeSessionRoles('admin'), async (req, res) => {
  try {
    const result = await User.update(req.params.id, req.body);
    if (result.affectedRows === 0) {
      return res.status(404).render('error', {
        title: 'Not Found',
        message: 'User not found'
      });
    }
    
    res.redirect('/admin/users?message=User updated successfully');
  } catch (error) {
    console.error('Update user error:', error);
    res.render('admin/edit-user', {
      title: 'Edit User',
      user: req.session.user,
      userData: req.body,
      message: { type: 'danger', text: 'Error updating user: ' + error.message }
    });
  }
});

// Delete user (admin only) - WEB FORM HANDLER
router.post('/delete-user/:id', authenticateSession, authorizeSessionRoles('admin'), async (req, res) => {
  try {
    const result = await User.delete(req.params.id);
    if (result.affectedRows === 0) {
      return res.status(404).render('error', {
        title: 'Not Found',
        message: 'User not found'
      });
    }
    
    res.redirect('/admin/users?message=User deleted successfully');
  } catch (error) {
    console.error('Delete user error:', error);
    res.redirect('/admin/users?error=Error deleting user: ' + error.message);
  }
});

module.exports = router;