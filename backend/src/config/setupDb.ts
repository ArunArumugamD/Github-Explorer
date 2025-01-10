import fs from 'fs';
import path from 'path';
import pool from './database';

async function setupDatabase() {
  try {
    // First drop existing tables if they exist
    const dropTables = `
      DROP TABLE IF EXISTS friends;
      DROP TABLE IF EXISTS users;
    `;
    
    await pool.query(dropTables);
    console.log('Cleaned up existing tables');

    // Create new tables
    const sqlPath = path.join(__dirname, '..', 'models', 'init.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    await pool.query(sql);
    console.log('Database setup completed successfully');
  } catch (error) {
    console.error('Error setting up database:', error);
    throw error;
  }
}

// Run setup if this file is run directly
if (require.main === module) {
  setupDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export default setupDatabase;