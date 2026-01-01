// routes/plants.js
const express = require('express');
const router = express.Router();
const Plant = require('../models/Plant');
const { authenticateSession, authorizeSessionRoles } = require('../middleware/auth');

// GET /admin/plants - Show all plants for management
router.get('/admin/plants', authenticateSession, authorizeSessionRoles('admin'), async (req, res) => {
    try {
        const plants = await Plant.getAll();
        res.render('admin/plants', {
            title: 'Manage Plants',
            user: req.session.user,
            plants: plants,
            message: null
        });
    } catch (error) {
        console.error('Error loading plants:', error);
        res.status(500).render('error', {
            title: 'Error',
            message: 'Error loading plants'
        });
    }
});

// GET /admin/plants/new - Show form to create new plant
router.get('/admin/plants/new', authenticateSession, authorizeSessionRoles('admin'), (req, res) => {
    res.render('admin/plant-form', {
        title: 'Add New Plant',
        user: req.session.user,
        plant: null, // Empty plant for new form
        message: null
    });
});

// POST /admin/plants - Handle creating new plant
router.post('/admin/plants', authenticateSession, authorizeSessionRoles('admin'), async (req, res) => {
    try {
        const { name, description, price, stock_quantity, care_instructions, image_url } = req.body;
        
        // Basic validation
        if (!name || !price || !stock_quantity) {
            return res.render('admin/plant-form', {
                title: 'Add New Plant',
                user: req.session.user,
                plant: req.body,
                message: { type: 'danger', text: 'Name, price, and quantity are required' }
            });
        }

        // Create plant
        const plantId = await Plant.create({
            name,
            description,
            price: parseFloat(price),
            stock_quantity: parseInt(stock_quantity),
            care_instructions,
            image_url
        });

        res.redirect('/admin/plants?message=Plant added successfully');

    } catch (error) {
        console.error('Error creating plant:', error);
        res.render('admin/plant-form', {
            title: 'Add New Plant',
            user: req.session.user,
            plant: req.body,
            message: { type: 'danger', text: 'Error creating plant' }
        });
    }
});

// GET /admin/plants/edit/:id - Show edit form
router.get('/admin/plants/edit/:id', authenticateSession, authorizeSessionRoles('admin'), async (req, res) => {
    try {
        const plant = await Plant.findById(req.params.id);
        if (!plant) {
            return res.status(404).render('error', {
                title: 'Not Found',
                message: 'Plant not found'
            });
        }

        res.render('admin/plant-form', {
            title: 'Edit Plant',
            user: req.session.user,
            plant: plant,
            message: null
        });

    } catch (error) {
        console.error('Error loading plant:', error);
        res.status(500).render('error', {
            title: 'Error',
            message: 'Error loading plant'
        });
    }
});

// POST /admin/plants/update/:id - Handle updating plant
router.post('/admin/plants/update/:id', authenticateSession, authorizeSessionRoles('admin'), async (req, res) => {
    try {
        const { name, description, price, stock_quantity, care_instructions, image_url } = req.body;
        
        // Basic validation
        if (!name || !price || !stock_quantity) {
            return res.render('admin/plant-form', {
                title: 'Edit Plant',
                user: req.session.user,
                plant: { ...req.body, id: req.params.id },
                message: { type: 'danger', text: 'Name, price, and quantity are required' }
            });
        }

        // Update plant
        await Plant.update(req.params.id, {
            name,
            description,
            price: parseFloat(price),
            stock_quantity: parseInt(stock_quantity),
            care_instructions,
            image_url
        });

        res.redirect('/admin/plants?message=Plant updated successfully');

    } catch (error) {
        console.error('Error updating plant:', error);
        res.render('admin/plant-form', {
            title: 'Edit Plant',
            user: req.session.user,
            plant: { ...req.body, id: req.params.id },
            message: { type: 'danger', text: 'Error updating plant' }
        });
    }
});

// POST /admin/plants/delete/:id - Handle deleting plant
router.post('/admin/plants/delete/:id', authenticateSession, authorizeSessionRoles('admin'), async (req, res) => {
    try {
        await Plant.delete(req.params.id);
        res.redirect('/admin/plants?message=Plant deleted successfully');
    } catch (error) {
        console.error('Error deleting plant:', error);
        res.redirect('/admin/plants?error=Error deleting plant');
    }
});

module.exports = router;