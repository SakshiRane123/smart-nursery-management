const db = require('../config/database');

class Wishlist {
  // Add plant to wishlist
  static addToWishlist(userId, plantId) {
    return new Promise((resolve, reject) => {
      // First check if already in wishlist
      const checkQuery = 'SELECT * FROM wishlist WHERE user_id = ? AND plant_id = ?';
      db.execute(checkQuery, [userId, plantId], (err, results) => {
        if (err) return reject(err);
        
        if (results.length > 0) {
          resolve(false); // Already in wishlist
        } else {
          const insertQuery = 'INSERT INTO wishlist (user_id, plant_id) VALUES (?, ?)';
          db.execute(insertQuery, [userId, plantId], (err, results) => {
            if (err) reject(err);
            resolve(true);
          });
        }
      });
    });
  }

  // Remove from wishlist
  static removeFromWishlist(userId, plantId) {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM wishlist WHERE user_id = ? AND plant_id = ?';
      db.execute(query, [userId, plantId], (err, results) => {
        if (err) reject(err);
        resolve(results.affectedRows > 0);
      });
    });
  }

  // Get user's wishlist
  static getWishlist(userId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT p.*, w.added_date 
        FROM plants p 
        INNER JOIN wishlist w ON p.id = w.plant_id 
        WHERE w.user_id = ? 
        ORDER BY w.added_date DESC
      `;
      db.execute(query, [userId], (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });
  }

  // Check if plant is in wishlist
  static isInWishlist(userId, plantId) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM wishlist WHERE user_id = ? AND plant_id = ?';
      db.execute(query, [userId, plantId], (err, results) => {
        if (err) reject(err);
        resolve(results.length > 0);
      });
    });
  }
}

module.exports = Wishlist;