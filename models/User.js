const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  // Create a new user
  static async create(userData) {
    const { username, password, email, role, first_name, last_name, phone } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Ensure all values are defined, convert undefined to null
    const safePhone = phone !== undefined ? phone : null;
    
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO users (username, password, email, role, first_name, last_name, phone) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      
      db.execute(
        query, 
        [username, hashedPassword, email, role, first_name, last_name, safePhone],
        (err, results) => {
          if (err) {
            console.error('Database error:', err);
            reject(err);
          } else {
            resolve(results.insertId);
          }
        }
      );
    });
  }

  // Find user by username
  static findByUsername(username) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM users WHERE username = ?';
      db.execute(query, [username], (err, results) => {
        if (err) reject(err);
        resolve(results[0]);
      });
    });
  }

  // Find user by email
  static findByEmail(email) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM users WHERE email = ?';
      db.execute(query, [email], (err, results) => {
        if (err) reject(err);
        resolve(results[0]);
      });
    });
  }

  // Find user by ID
  static findById(id) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT id, username, email, role, first_name, last_name, phone, created_at FROM users WHERE id = ?';
      db.execute(query, [id], (err, results) => {
        if (err) reject(err);
        resolve(results[0]);
      });
    });
  }

  // Get all users (for admin)
  static getAll() {
    return new Promise((resolve, reject) => {
      const query = 'SELECT id, username, email, role, first_name, last_name, phone, created_at FROM users';
      db.execute(query, (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });
  }

  // Update user profile
  static update(id, userData) {
    const { email, first_name, last_name, phone } = userData;
    
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE users 
        SET email = ?, first_name = ?, last_name = ?, phone = ? 
        WHERE id = ?
      `;
      
      db.execute(query, [email, first_name, last_name, phone, id], (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });
  }

  // Delete user
  static delete(id) {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM users WHERE id = ?';
      db.execute(query, [id], (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });
  }

  // Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Add this to your User.js model:
static getByRole(role) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT id, username, first_name, last_name FROM users WHERE role = ?';
        db.execute(query, [role], (err, results) => {
            if (err) reject(err);
            resolve(results);
        });
    });
}

}

module.exports = User;