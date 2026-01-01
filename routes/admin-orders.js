// routes/admin-orders.js
const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const { authenticateSession, authorizeSessionRoles } = require('../middleware/auth');

// GET /admin/orders - View all orders
router.get('/admin/orders', authenticateSession, authorizeSessionRoles('admin'), async (req, res) => {
  try {
    const orders = await Order.getAll();
    const statusFilter = req.query.status || 'all';
    
    let filteredOrders = orders;
    if (statusFilter !== 'all') {
      filteredOrders = await Order.getByStatus(statusFilter);
    }

    // Get order counts for stats
    const allOrders = await Order.getAll();
    const orderStats = {
      total: allOrders.length,
      pending: allOrders.filter(o => o.status === 'pending').length,
      confirmed: allOrders.filter(o => o.status === 'confirmed').length,
      shipped: allOrders.filter(o => o.status === 'shipped').length,
      delivered: allOrders.filter(o => o.status === 'delivered').length,
      cancelled: allOrders.filter(o => o.status === 'cancelled').length
    };

    res.render('admin/orders', {
      title: 'Manage Orders',
      user: req.session.user,
      orders: filteredOrders,
      orderStats: orderStats,
      statusFilter: statusFilter,
      message: req.query.message,
      error: req.query.error
    });

  } catch (error) {
    console.error('Error loading orders:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Error loading orders'
    });
  }
});

// GET /admin/orders/:id - View order details
router.get('/admin/orders/:id', authenticateSession, authorizeSessionRoles('admin'), async (req, res) => {
  try {
    const order = await Order.getOrderDetails(req.params.id);
    if (!order) {
      return res.status(404).render('error', {
        title: 'Not Found',
        message: 'Order not found'
      });
    }

    const items = await OrderItem.findByOrderId(req.params.id);

    res.render('admin/order-details', {
      title: 'Order Details #' + order.id,
      user: req.session.user,
      order: order,
      items: items
    });

  } catch (error) {
    console.error('Error loading order details:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Error loading order details'
    });
  }
});

// POST /admin/orders/:id/status - Update order status
router.post('/admin/orders/:id/status', authenticateSession, authorizeSessionRoles('admin'), async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.redirect('/admin/orders?error=Invalid status');
    }

    await Order.updateStatus(req.params.id, status);
    res.redirect('/admin/orders?message=Order status updated successfully');

  } catch (error) {
    console.error('Error updating order status:', error);
    res.redirect('/admin/orders?error=Error updating order status');
  }
});

module.exports = router;