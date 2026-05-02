# EmPay HRMS Mock Data Usage Guide

## Overview
This guide explains how to load mock data into the EmPay HRMS database for testing and demonstration purposes.

## Prerequisites
- PostgreSQL installed and running
- Database `empay_db` created
- All schema tables created (run schema.sql, schema_part2.sql, schema_tax.sql first)

## Loading Mock Data

### Option 1: Using psql Command Line
```bash
psql -U postgres -d empay_db -f empay_mock_data.sql
```

### Option 2: Using pgAdmin
1. Open pgAdmin
2. Connect to your PostgreSQL server
3. Select database `empay_db`
4. Open Query Tool
5. Copy and paste contents of `empay_mock_data.sql`
6. Execute

### Option 3: Using Node.js Script
```bash
node -e "
const fs = require('fs');
const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  password: 'postgres',
  host: 'localhost',
  port: 5432,
  database: 'empay_db'
});

const sql = fs.readFileSync('./empay_mock_data.sql', 'utf8');
pool.query(sql, (err, res) => {
  if (err) console.error(err);
  else console.log('Mock data loaded successfully');
  pool.end();
});
"
```

## Test Credentials

### Admin Account
- **Login ID:** OIADM000001
- **Email:** admin@odoo-india.com
- **Password:** (Use your hashed password)
- **Role:** Admin

### HR Officer Account
- **Login ID:** OIHR0000001
- **Email:** hr@odoo-india.com
- **Password:** (Use your hashed password)
- **Role:** HR Officer

### Payroll Officer Account
- **Login ID:** OIPR0000001
- **Email:** payroll@odoo-india.com
- **Password:** (Use your hashed password)
- **Role:** Payroll Officer

### Employee Accounts
- **Employee 1:** Rajesh Kumar (Senior Developer)
- **Employee 2:** Priya Singh (HR Manager)

## Sample Data Included

### Company
- **Name:** Odoo India
- **Code:** OI
- **Email:** admin@odoo-india.com

### Employees
- 2 active employees with complete profiles
- Assigned to different departments (Engineering, HR)
- With salary information and employment details

### Attendance
- 4 attendance records (2 employees × 2 days)
- Check-in/check-out times
- Duration calculations

### Leave Management
- 3 leave types (Paid Time Off, Sick Leave, Unpaid Leave)
- Leave allocations for both employees
- Sample leave requests (1 approved, 1 pending)

### Payroll
- 1 payroll run for April 2026
- 2 payslips with salary calculations
- Deductions (PF, Professional Tax)

### Performance
- 2 performance reviews (completed)
- 2 goals (in progress)
- Ratings and feedback

### Policies
- 3 company policies (Attendance, Leave, Code of Conduct)

## Resetting Mock Data

To clear all mock data and start fresh:

```sql
-- Delete in reverse order of foreign key dependencies
DELETE FROM payslips;
DELETE FROM payroll_runs;
DELETE FROM goals;
DELETE FROM performance_reviews;
DELETE FROM policies;
DELETE FROM leave_requests;
DELETE FROM attendance;
DELETE FROM leave_allocations;
DELETE FROM leave_types;
DELETE FROM employees;
DELETE FROM users;
DELETE FROM companies;

-- Reset sequences
ALTER SEQUENCE companies_id_seq RESTART WITH 1;
ALTER SEQUENCE users_id_seq RESTART WITH 1;
ALTER SEQUENCE employees_id_seq RESTART WITH 1;
```

Then reload mock data using one of the methods above.

## Notes

- Password hashes in mock data are placeholders. Update with actual bcrypt hashes before using in production.
- Mock data uses realistic but fictional information.
- All dates are set to 2026 for testing purposes.
- Modify data as needed for your specific testing scenarios.

## Troubleshooting

### Error: "relation does not exist"
- Ensure all schema files have been executed first
- Run: `psql -U postgres -d empay_db -f schema.sql`
- Then: `psql -U postgres -d empay_db -f schema_part2.sql`
- Finally: `psql -U postgres -d empay_db -f empay_mock_data.sql`

### Error: "duplicate key value"
- Mock data may already be loaded
- Run the reset script above first, then reload

### Connection refused
- Ensure PostgreSQL is running
- Check connection parameters (host, port, user, password)
