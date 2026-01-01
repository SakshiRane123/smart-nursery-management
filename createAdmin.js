const bcrypt = require('bcryptjs');
const db = require('./config/database');

async function createAdmin() {
  try {
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const query = `
      INSERT INTO users (username, password, email, role, first_name, last_name, phone) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.execute(
      query, 
      ['admin', hashedPassword, 'admin@nursery.com', 'admin', 'System', 'Administrator', '123-456-7890'],
      (err, results) => {
        if (err) {
          console.error('Error creating admin:', err);
        } else {
          console.log('Admin user created successfully!');
          console.log('Username: admin');
          console.log('Password: admin123');
        }
        process.exit();
      }
    );
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createAdmin();