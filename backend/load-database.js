const fs = require('fs');
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  database: process.env.DB_NAME
});

async function executeSqlFile(filePath) {
  const sql = fs.readFileSync(filePath, 'utf8');
  const statements = sql.split(';').filter(s => s.trim());
  
  for (const stmt of statements) {
    try {
      await pool.query(stmt);
    } catch (error) {
      if (!error.message.includes('already exists')) {
        console.error(`Error executing statement: ${error.message}`);
      }
    }
  }
}

async function loadDatabase() {
  try {
    console.log('Loading schema...');
    await executeSqlFile('./database/schema.sql');
    console.log('✓ Schema loaded');
    
    console.log('Loading schema part 2...');
    await executeSqlFile('./database/schema_part2.sql');
    console.log('✓ Schema part 2 loaded');
    
    console.log('Loading tax schema...');
    await executeSqlFile('./database/schema_tax.sql');
    console.log('✓ Tax schema loaded');
    
    console.log('Loading mock data...');
    await executeSqlFile('./database/empay_mock_data.sql');
    console.log('✓ Mock data loaded successfully');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

loadDatabase();
