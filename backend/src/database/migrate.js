const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function runMigrations() {
  try {
    console.log('Starting database migrations...');
    
    const schema1 = fs.readFileSync(
      path.join(__dirname, 'schema.sql'),
      'utf8'
    );
    
    const schema2 = fs.readFileSync(
      path.join(__dirname, 'schema_part2.sql'),
      'utf8'
    );
    
    await pool.query(schema1);
    console.log('Schema part 1 executed successfully');
    
    await pool.query(schema2);
    console.log('Schema part 2 executed successfully');
    
    console.log('All migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
