const fs = require('fs');
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'empay_db'
});

async function loadMockData() {
  try {
    const sql = fs.readFileSync('./database/empay_mock_data.sql', 'utf8');
    await pool.query(sql);
    console.log('✓ Mock data loaded successfully');
  } catch (error) {
    console.error('✗ Error loading mock data:', error.message);
  } finally {
    await pool.end();
  }
}

loadMockData();
