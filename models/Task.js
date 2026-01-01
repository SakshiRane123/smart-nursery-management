// models/Task.js
const db = require('../config/database');

class Task {
  // Create a new task
  static create(taskData) {
    const { plant_id, caretaker_id, task_description, scheduled_date } = taskData;
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO care_tasks (plant_id, caretaker_id, task_description, scheduled_date) 
        VALUES (?, ?, ?, ?)
      `;
      db.execute(query, [plant_id, caretaker_id, task_description, scheduled_date], (err, results) => {
        if (err) reject(err);
        resolve(results.insertId);
      });
    });
  }

  // Get all tasks with plant and caretaker details
  static getAll() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT ct.*, 
               p.name as plant_name, p.image_url as plant_image,
               u.first_name as caretaker_first_name, u.last_name as caretaker_last_name,
               u.username as caretaker_username
        FROM care_tasks ct
        JOIN plants p ON ct.plant_id = p.id
        JOIN users u ON ct.caretaker_id = u.id
        ORDER BY ct.scheduled_date DESC, ct.created_at DESC
      `;
      db.execute(query, (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });
  }

  // Get tasks for a specific caretaker
  static getByCaretaker(caretakerId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT ct.*, p.name as plant_name, p.image_url as plant_image
        FROM care_tasks ct
        JOIN plants p ON ct.plant_id = p.id
        WHERE ct.caretaker_id = ?
        ORDER BY ct.scheduled_date, ct.status
      `;
      db.execute(query, [caretakerId], (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });
  }

  // Get task by ID
  static findById(taskId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT ct.*, 
               p.name as plant_name, p.image_url as plant_image,
               u.first_name as caretaker_first_name, u.last_name as caretaker_last_name
        FROM care_tasks ct
        JOIN plants p ON ct.plant_id = p.id
        JOIN users u ON ct.caretaker_id = u.id
        WHERE ct.id = ?
      `;
      db.execute(query, [taskId], (err, results) => {
        if (err) reject(err);
        resolve(results[0]);
      });
    });
  }

  // Update task status
  static updateStatus(taskId, status) {
    return new Promise((resolve, reject) => {
      let query, params;
      
      if (status === 'completed') {
        query = 'UPDATE care_tasks SET status = ?, completed_date = NOW() WHERE id = ?';
        params = [status, taskId];
      } else {
        query = 'UPDATE care_tasks SET status = ?, completed_date = NULL WHERE id = ?';
        params = [status, taskId];
      }
      
      db.execute(query, params, (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });
  }

  // Update task details
  static update(taskId, taskData) {
    const { plant_id, caretaker_id, task_description, scheduled_date, status } = taskData;
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE care_tasks 
        SET plant_id = ?, caretaker_id = ?, task_description = ?, scheduled_date = ?, status = ?
        WHERE id = ?
      `;
      db.execute(query, [plant_id, caretaker_id, task_description, scheduled_date, status, taskId], (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });
  }

  // Delete task
  static delete(taskId) {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM care_tasks WHERE id = ?';
      db.execute(query, [taskId], (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });
  }

  // Get task statistics
  static getStats() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          COUNT(*) as total_tasks,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_tasks,
          SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_tasks,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_tasks
        FROM care_tasks
      `;
      db.execute(query, (err, results) => {
        if (err) reject(err);
        resolve(results[0]);
      });
    });
  }
}

module.exports = Task;