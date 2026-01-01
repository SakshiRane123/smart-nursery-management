// routes/tasks.js
const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Plant = require('../models/Plant');
const User = require('../models/User');
const { authenticateSession, authorizeSessionRoles } = require('../middleware/auth');

// GET /admin/tasks - View all tasks (Admin only)
router.get('/admin/tasks', authenticateSession, authorizeSessionRoles('admin'), async (req, res) => {
  try {
    const tasks = await Task.getAll();
    const plants = await Plant.getAllForAdmin();
    const caretakers = await User.getByRole('caretaker');
    const stats = await Task.getStats();

    res.render('admin/tasks', {
      title: 'Manage Care Tasks',
      user: req.session.user,
      tasks: tasks,
      plants: plants,
      caretakers: caretakers,
      stats: stats,
      message: req.query.message,
      error: req.query.error
    });

  } catch (error) {
    console.error('Error loading tasks:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Error loading tasks'
    });
  }
});

// GET /caretaker/tasks - View my tasks (Caretaker only)
router.get('/caretaker/tasks', authenticateSession, authorizeSessionRoles('caretaker'), async (req, res) => {
  try {
    const tasks = await Task.getByCaretaker(req.session.user.id);
    const stats = await Task.getStats();

    res.render('caretaker/tasks', {
      title: 'My Care Tasks',
      user: req.session.user,
      tasks: tasks,
      stats: stats
    });

  } catch (error) {
    console.error('Error loading caretaker tasks:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Error loading tasks'
    });
  }
});

// POST /admin/tasks - Create new task (Admin only)
router.post('/admin/tasks', authenticateSession, authorizeSessionRoles('admin'), async (req, res) => {
  try {
    const { plant_id, caretaker_id, task_description, scheduled_date } = req.body;

    if (!plant_id || !caretaker_id || !task_description || !scheduled_date) {
      return res.redirect('/admin/tasks?error=All fields are required');
    }

    await Task.create({
      plant_id: parseInt(plant_id),
      caretaker_id: parseInt(caretaker_id),
      task_description: task_description.trim(),
      scheduled_date: scheduled_date
    });

    res.redirect('/admin/tasks?message=Task assigned successfully');

  } catch (error) {
    console.error('Error creating task:', error);
    res.redirect('/admin/tasks?error=Error creating task');
  }
});

// POST /tasks/:id/status - Update task status
router.post('/tasks/:id/status', authenticateSession, async (req, res) => {
  try {
    console.log('📝 Updating task status:', req.params.id, req.body.status);
    
    const { status } = req.body;
    const validStatuses = ['pending', 'in_progress', 'completed'];

    if (!validStatuses.includes(status)) {
      // FIX: Redirect to the referrer instead of 'back'
      return res.redirect(req.get('Referrer') + '?error=Invalid status');
    }

    await Task.updateStatus(req.params.id, status);
    
    console.log('✅ Task status updated successfully');
    // FIX: Redirect to the referrer instead of 'back'
    res.redirect(req.get('Referrer') + '?message=Task status updated successfully');

  } catch (error) {
    console.error('❌ Error updating task status:', error);
    // FIX: Redirect to the referrer instead of 'back'
    res.redirect(req.get('Referrer') + '?error=Error updating task status');
  }
});



// POST /admin/tasks/:id/delete - Delete task (Admin only)
router.post('/admin/tasks/:id/delete', authenticateSession, authorizeSessionRoles('admin'), async (req, res) => {
  try {
    await Task.delete(req.params.id);
    res.redirect('/admin/tasks?message=Task deleted successfully');
  } catch (error) {
    console.error('Error deleting task:', error);
    res.redirect('/admin/tasks?error=Error deleting task');
  }
});

module.exports = router;