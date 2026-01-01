const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const PlantAnalytics = require('../models/PlantAnalytics');
const { authenticateSession, authorizeSessionRoles } = require('../middleware/auth');

// GET /caretaker/dashboard - Caretaker dashboard with stats
router.get('/caretaker/dashboard', authenticateSession, authorizeSessionRoles('caretaker'), async (req, res) => {
  try {
    // Get task stats
    const taskStats = await Task.getCaretakerStats(req.session.user.id);
    
    // Get analytics stats (you'll need to create this method)
    const analyticsStats = await PlantAnalytics.getCaretakerStats(req.session.user.id);
    
    const stats = {
      total_tasks: taskStats?.total_tasks || 0,
      total_measurements: analyticsStats?.total_records || 0,
      avg_health_score: analyticsStats?.avg_health_score || 0,
      plants_monitored: analyticsStats?.unique_plants || 0
    };

    res.render('caretaker/dashboard', {
      title: 'Caretaker Dashboard',
      user: req.session.user,
      stats: stats
    });
  } catch (error) {
    console.error('Error loading caretaker dashboard:', error);
    res.render('caretaker/dashboard', {
      title: 'Caretaker Dashboard',
      user: req.session.user,
      stats: {}
    });
  }
});



module.exports = router;