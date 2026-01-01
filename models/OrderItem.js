// models/OrderItem.js
const db = require('../config/database');

class OrderItem {
  // Add multiple items to an order
  static addItems(orderId, items) {
    return new Promise((resolve, reject) => {
      if (items.length === 0) {
        resolve([]);
        return;
      }

      const values = items.map(item => [orderId, item.plant_id, item.quantity, item.price]);
      const query = `
        INSERT INTO order_items (order_id, plant_id, quantity, price) 
        VALUES ?
      `;
      
      db.query(query, [values], (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });
  }

  // Get items for a specific order
  static findByOrderId(orderId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT oi.*, p.name, p.image_url 
        FROM order_items oi 
        JOIN plants p ON oi.plant_id = p.id 
        WHERE oi.order_id = ?
      `;
      db.execute(query, [orderId], (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });
  }
}

module.exports = OrderItem;