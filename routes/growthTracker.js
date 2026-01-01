const express = require('express');
const router = express.Router();
const PlantAnalytics = require('../models/PlantAnalytics');
const { authenticateSession, authorizeSessionRoles } = require('../middleware/auth');

// Test database connection on startup
console.log('🔍 Checking database connection...');
PlantAnalytics.checkTable()
  .then(count => {
    console.log('✅ Database connection successful!');
  })
  .catch(err => {
    console.log('❌ Database connection failed:', err.message);
  });

// POST /caretaker/growth-tracker/save - Save measurement to DATABASE ONLY
router.post('/caretaker/growth-tracker/save', authenticateSession, authorizeSessionRoles('caretaker'), async (req, res) => {
  try {
    const {
      plant_name,
      height_cm,
      width_cm,
      leaf_count,
      stem_diameter_mm,
      leaf_color,
      leaf_condition,
      sunlight_hours,
      temperature_celsius,
      humidity_percent,
      notes
    } = req.body;

    console.log('📝 Received form data for plant:', plant_name);

    // Validate required fields
    if (!plant_name) {
      return res.redirect('/caretaker/growth-tracker/add?error=' + encodeURIComponent('Plant name is required'));
    }

    // Save to DATABASE
    const measurementId = await PlantAnalytics.create({
      plant_name: plant_name,
      caretaker_id: req.session.user.id,
      height_cm: height_cm,
      width_cm: width_cm,
      leaf_count: leaf_count,
      stem_diameter_mm: stem_diameter_mm,
      leaf_color: leaf_color,
      leaf_condition: leaf_condition,
      sunlight_hours: sunlight_hours,
      temperature_celsius: temperature_celsius,
      humidity_percent: humidity_percent,
      notes: notes
    });

    console.log('✅ Measurement saved to database with ID:', measurementId);

    res.redirect('/caretaker/growth-tracker?message=' + encodeURIComponent('Measurement saved to database successfully!'));

  } catch (error) {
    console.error('❌ Error saving measurement to database:', error);
    res.redirect('/caretaker/growth-tracker/add?error=' + encodeURIComponent('Database error: ' + error.message));
  }
});

// GET /caretaker/growth-tracker - Load from DATABASE ONLY
router.get('/caretaker/growth-tracker', authenticateSession, authorizeSessionRoles('caretaker'), async (req, res) => {
  try {
    const measurements = await PlantAnalytics.getByCaretaker(req.session.user.id);
    
    console.log('📊 Displaying', measurements.length, 'measurements from database');

    res.render('caretaker/growth-tracker', {
      title: 'Plant Growth Tracker',
      user: req.session.user,
      measurements: measurements,
      message: req.query.message,
      error: req.query.error
    });
  } catch (error) {
    console.error('❌ Error loading growth tracker:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Database error: ' + error.message
    });
  }
});

// GET /caretaker/growth-tracker/add - Measurement form
router.get('/caretaker/growth-tracker/add', authenticateSession, authorizeSessionRoles('caretaker'), async (req, res) => {
  try {
    res.render('caretaker/growth-tracker-form', {
      title: 'Add Plant Measurement',
      user: req.session.user,
      error: req.query.error
    });
  } catch (error) {
    console.error('Error loading measurement form:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Failed to load form'
    });
  }
});

module.exports = router;