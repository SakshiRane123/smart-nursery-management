const db = require('../config/database');

class Order {
  // Create a new order
  static create(orderData) {
    const { customer_id, total_amount, delivery_address } = orderData;
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO orders (customer_id, total_amount, delivery_address) 
        VALUES (?, ?, ?)
      `;
      db.execute(query, [customer_id, total_amount, delivery_address], (err, results) => {
        if (err) reject(err);
        resolve(results.insertId);
      });
    });
  }

  // Get all orders for a customer
  static findByCustomerId(customerId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT o.*, 
               COUNT(oi.id) as item_count,
               GROUP_CONCAT(p.name SEPARATOR ', ') as plant_names
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        LEFT JOIN plants p ON oi.plant_id = p.id
        WHERE o.customer_id = ?
        GROUP BY o.id
        ORDER BY o.order_date DESC
      `;
      db.execute(query, [customerId], (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });
  }

  // Get order by ID with customer validation
  static findByIdAndCustomer(orderId, customerId) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM orders WHERE id = ? AND customer_id = ?';
      db.execute(query, [orderId, customerId], (err, results) => {
        if (err) reject(err);
        resolve(results[0]);
      });
    });
  }

  // Get all orders (for admin)
  static getAll() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT o.*, u.username, u.first_name, u.last_name, u.email,
               COUNT(oi.id) as item_count,
               SUM(oi.quantity) as total_items
        FROM orders o
        JOIN users u ON o.customer_id = u.id
        LEFT JOIN order_items oi ON o.id = oi.order_id
        GROUP BY o.id
        ORDER BY o.order_date DESC
      `;
      db.execute(query, (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });
  }

  // Get order details with customer info (for admin)
  static getOrderDetails(orderId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT o.*, u.username, u.first_name, u.last_name, u.email, u.phone
        FROM orders o
        JOIN users u ON o.customer_id = u.id
        WHERE o.id = ?
      `;
      db.execute(query, [orderId], (err, results) => {
        if (err) reject(err);
        resolve(results[0]);
      });
    });
  }

  // Update order status
  static updateStatus(orderId, status) {
    return new Promise((resolve, reject) => {
      const query = 'UPDATE orders SET status = ? WHERE id = ?';
      db.execute(query, [status, orderId], (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });
  }

  // Get orders by status
  static getByStatus(status) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT o.*, u.username, u.first_name, u.last_name,
               COUNT(oi.id) as item_count
        FROM orders o
        JOIN users u ON o.customer_id = u.id
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE o.status = ?
        GROUP BY o.id
        ORDER BY o.order_date DESC
      `;
      db.execute(query, [status], (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });
  }
}

module.exports = Order;