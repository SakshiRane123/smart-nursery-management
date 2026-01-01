// models/Cart.js
const db = require('../config/database');

class Cart {
  // Add item to cart
  static addItem(userId, plantId, quantity) {
    return new Promise((resolve, reject) => {
      // First check if item already exists in cart
      const checkQuery = 'SELECT * FROM cart WHERE user_id = ? AND plant_id = ?';
      db.execute(checkQuery, [userId, plantId], (err, results) => {
        if (err) return reject(err);
        
        if (results.length > 0) {
          // Update quantity if item exists
          const updateQuery = 'UPDATE cart SET quantity = quantity + ? WHERE user_id = ? AND plant_id = ?';
          db.execute(updateQuery, [quantity, userId, plantId], (err, results) => {
            if (err) reject(err);
            resolve(results);
          });
        } else {
          // Insert new item
          const insertQuery = 'INSERT INTO cart (user_id, plant_id, quantity) VALUES (?, ?, ?)';
          db.execute(insertQuery, [userId, plantId, quantity], (err, results) => {
            if (err) reject(err);
            resolve(results);
          });
        }
      });
    });
  }

  // Get user's cart with plant details
  static getCart(userId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT c.*, p.name, p.price, p.image_url, p.stock_quantity 
        FROM cart c 
        JOIN plants p ON c.plant_id = p.id 
        WHERE c.user_id = ?
      `;
      db.execute(query, [userId], (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });
  }

  // Get cart total
  static getCartTotal(userId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT SUM(c.quantity * p.price) as total 
        FROM cart c 
        JOIN plants p ON c.plant_id = p.id 
        WHERE c.user_id = ?
      `;
      db.execute(query, [userId], (err, results) => {
        if (err) reject(err);
        const total = results[0]?.total ? parseFloat(results[0].total) : 0;
        resolve(total);
      });
    });
  }

  // Update item quantity
  static updateQuantity(userId, plantId, quantity) {
    return new Promise((resolve, reject) => {
      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        this.removeItem(userId, plantId).then(resolve).catch(reject);
      } else {
        const query = 'UPDATE cart SET quantity = ? WHERE user_id = ? AND plant_id = ?';
        db.execute(query, [quantity, userId, plantId], (err, results) => {
          if (err) reject(err);
          resolve(results);
        });
      }
    });
  }

  // Remove item from cart
  static removeItem(userId, plantId) {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM cart WHERE user_id = ? AND plant_id = ?';
      db.execute(query, [userId, plantId], (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });
  }

  // Clear user's cart
  static clearCart(userId) {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM cart WHERE user_id = ?';
      db.execute(query, [userId], (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });
  }
}

module.exports = Cart;