const db = require('../config/database');

class Plant {
  // Get all plants (for customers - only in stock)
  static getAll() {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM plants WHERE stock_quantity > 0 ORDER BY name';
      db.execute(query, (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });
  }

  // Get all plants including out-of-stock (for admin)
  static getAllForAdmin() {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM plants ORDER BY name';
      db.execute(query, (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });
  }

  // Get plant by ID
  static findById(id) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM plants WHERE id = ?';
      db.execute(query, [id], (err, results) => {
        if (err) reject(err);
        resolve(results[0]);
      });
    });
  }

  // Get plants by category
  static findByCategory(category) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM plants WHERE category = ? AND stock_quantity > 0';
      db.execute(query, [category], (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });
  }

  // Search plants
  static search(query) {
    return new Promise((resolve, reject) => {
      const searchQuery = 'SELECT * FROM plants WHERE (name LIKE ? OR description LIKE ?) AND stock_quantity > 0';
      db.execute(searchQuery, [`%${query}%`, `%${query}%`], (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });
  }

  // Create new plant
  static create(plantData) {
    const { name, description, price, stock_quantity, care_instructions, image_url } = plantData;
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO plants (name, description, price, stock_quantity, care_instructions, image_url) 
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      db.execute(query, [name, description, price, stock_quantity, care_instructions, image_url], (err, results) => {
        if (err) reject(err);
        resolve(results.insertId);
      });
    });
  }

  // Update plant
  static update(id, plantData) {
    const { name, description, price, stock_quantity, care_instructions, image_url } = plantData;
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE plants 
        SET name = ?, description = ?, price = ?, stock_quantity = ?, care_instructions = ?, image_url = ?
        WHERE id = ?
      `;
      db.execute(query, [name, description, price, stock_quantity, care_instructions, image_url, id], (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });
  }

  // Delete plant
  static delete(id) {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM plants WHERE id = ?';
      db.execute(query, [id], (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });
  }
}

module.exports = Plant;