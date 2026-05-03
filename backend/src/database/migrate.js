const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'empay_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD !== undefined ? String(process.env.DB_PASSWORD) : '',
});

async function runMigrations() {
  try {
    console.log('Starting database migrations...');

    // Step 1: Drop all existing tables (clean slate)
    console.log('Dropping existing tables...');
    await pool.query(`
      DROP TABLE IF EXISTS audit_logs CASCADE;
      DROP TABLE IF EXISTS holidays CASCADE;
      DROP TABLE IF EXISTS policies CASCADE;
      DROP TABLE IF EXISTS goals CASCADE;
      DROP TABLE IF EXISTS performance_reviews CASCADE;
      DROP TABLE IF EXISTS payslips CASCADE;
      DROP TABLE IF EXISTS payroll_runs CASCADE;
      DROP TABLE IF EXISTS leave_requests CASCADE;
      DROP TABLE IF EXISTS leave_allocations CASCADE;
      DROP TABLE IF EXISTS leave_types CASCADE;
      DROP TABLE IF EXISTS attendance CASCADE;
      DROP TABLE IF EXISTS employees CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
      DROP TABLE IF EXISTS companies CASCADE;
    `);
    console.log('Existing tables dropped.');

    // Step 2: Run schema part 1 (core tables)
    const schema1 = fs.readFileSync(
      path.join(__dirname, 'schema.sql'),
      'utf8'
    );
    await pool.query(schema1);
    console.log('Schema part 1 executed successfully');

    // Step 3: Run schema part 2 (extra tables + indexes)
    // Remove the INSERT statements — mock data handles that
    const schema2Raw = fs.readFileSync(
      path.join(__dirname, 'schema_part2.sql'),
      'utf8'
    );
    const schema2 = schema2Raw.replace(/INSERT INTO[\s\S]*?;/g, '-- removed INSERT');
    await pool.query(schema2);
    console.log('Schema part 2 executed successfully');

    // Step 4: Check if schema_tax.sql exists and run it
    const taxPath = path.join(__dirname, 'schema_tax.sql');
    if (fs.existsSync(taxPath)) {
      const schemaTax = fs.readFileSync(taxPath, 'utf8');
      await pool.query(schemaTax);
      console.log('Tax schema executed successfully');
    }

    // Step 5: Load mock/seed data
    const mockData = fs.readFileSync(
      path.join(__dirname, 'empay_mock_data.sql'),
      'utf8'
    );
    await pool.query(mockData);
    console.log('Mock data inserted successfully');

    console.log('\n===========================================');
    console.log('   ALL MIGRATIONS COMPLETED SUCCESSFULLY!');
    console.log('===========================================\n');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
