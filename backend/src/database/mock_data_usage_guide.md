# EmPay Mock Data — Usage Guide

## 1. How to Load the Data

### Step 1 — Run schema first, then seed
```bash
# In your terminal (PostgreSQL)
psql -U postgres -d empay_db -f schema.sql
psql -U postgres -d empay_db -f empay_mock_data.sql
```

### Or inside psql shell:
```sql
\i /path/to/schema.sql
\i /path/to/empay_mock_data.sql
```

### With Docker Compose (if you're using it):
```bash
docker exec -i empay_postgres psql -U postgres -d empay_db < schema.sql
docker exec -i empay_postgres psql -U postgres -d empay_db < empay_mock_data.sql
```

### Node.js (if seeding programmatically):
```js
const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function seed() {
  const sql = fs.readFileSync('./empay_mock_data.sql', 'utf8');
  await pool.query(sql);
  console.log('Seed complete.');
}
seed();
```

---

## 2. Test Accounts (All Passwords = `Password@123`)

| Role            | Email                         | Login ID       | Notes                        |
|-----------------|-------------------------------|----------------|------------------------------|
| Admin           | admin@technova.com            | TCNV-ADM-001   | Full access, TechNova        |
| HR Officer      | priya.sharma@technova.com     | TCNV-HR-001    | Primary HR, TechNova         |
| HR Officer      | karan.mehta@technova.com      | TCNV-HR-002    | Secondary HR, TechNova       |
| Payroll Officer | finance@technova.com          | TCNV-PAY-001   | Payroll, TechNova            |
| Employee        | arjun.kapoor@technova.com     | TCNV-EMP-001   | Engineering, active          |
| Employee        | neha.joshi@technova.com       | TCNV-EMP-002   | Engineering, active          |
| Employee        | rohan.verma@technova.com      | TCNV-EMP-003   | Design, active               |
| Employee        | ananya.singh@technova.com     | TCNV-EMP-004   | **first_login=true** → test onboarding flow |
| Employee        | dev.null@technova.com         | TCNV-EMP-005   | **is_active=false** → test locked/inactive flow |
| Employee        | locked.user@technova.com      | TCNV-EMP-006   | **account_locked_until** set → test lockout UI |
| Admin (other co)| admin@brightmind.com          | BRMD-ADM-001   | Separate company isolation test |

### Password Hash Info
The `password_hash` in the SQL is the bcrypt hash of `Password@123` with salt rounds = 10.
Use it in your auth service like:
```js
// Node.js / Express
const bcrypt = require('bcrypt');
const isMatch = await bcrypt.compare('Password@123', user.password_hash); // true
```

---

## 3. What Data is Seeded & What to Test With It

### Companies
Two companies seeded: **TechNova Solutions** and **BrightMind Edu Systems**.
Use this to test **multi-tenant isolation** — ensure BrightMind users can never see TechNova data.

---

### Users & Roles
```sql
-- Check all users with their roles
SELECT login_id, email, role, is_active, first_login, account_locked_until
FROM users ORDER BY company_id, role;
```

**Test scenarios available:**
- `ananya.singh@technova.com` has `first_login = true` → must be redirected to change-password page
- `dev.null@technova.com` has `is_active = false` → login must fail with "account deactivated" message
- `locked.user@technova.com` has `account_locked_until` set → login must show lockout message

---

### Employees
```sql
-- All active TechNova employees
SELECT e.id, u.login_id, e.first_name, e.last_name,
       e.department, e.designation, e.basic_wage, e.status
FROM employees e JOIN users u ON e.user_id = u.id
WHERE e.company_id = 1 ORDER BY e.serial_number;
```

**Scenarios:**
- Employee 8 (Vikram Nair) is `status = inactive` — test deactivated employee badge in directory
- Employee 7 (Ananya) joined March 2025 — new joiner with prorated leave
- Employee 4 (Arjun) is reporting manager for Employee 5 (Neha) — test manager hierarchy display

---

### Attendance (April 2026)
```sql
-- Summary per employee for April 2026
SELECT e.first_name, e.last_name,
  COUNT(*) FILTER (WHERE a.status = 'present')  AS present,
  COUNT(*) FILTER (WHERE a.status = 'absent')   AS absent,
  COUNT(*) FILTER (WHERE a.status = 'on_leave') AS on_leave,
  COUNT(*) FILTER (WHERE a.status = 'half_day') AS half_day
FROM attendance a
JOIN employees e ON a.employee_id = e.id
WHERE a.date BETWEEN '2026-04-01' AND '2026-04-30'
GROUP BY e.first_name, e.last_name;
```

**Scenarios baked in:**
| Employee | Scenario |
|----------|----------|
| Arjun    | 1 approved leave, 1 half day, 1 unplanned absent |
| Neha     | 1 sick leave (approved), otherwise perfect |
| Rohan    | 2 approved leaves, 1 absent (auto-marked) |
| Ananya   | 100% attendance — perfect record |

---

### Leave Requests
```sql
-- All leave requests with status
SELECT e.first_name, lt.name AS leave_type,
       lr.from_date, lr.to_date, lr.days_requested,
       lr.status, lr.rejection_reason
FROM leave_requests lr
JOIN employees e ON lr.employee_id = e.id
JOIN leave_types lt ON lr.leave_type_id = lt.id
ORDER BY lr.created_at;
```

**Scenarios:**
- Request ID 1,2,3 → **Approved** (test approved display + balance deduction)
- Request ID 4,6 → **Pending** (test payroll officer approval queue)
- Request ID 5 → **Rejected** with reason (test rejection reason display)
- Request ID 7 → **Cancelled** (test cancelled badge + balance restored)

---

### Leave Allocations
```sql
-- Balance per employee
SELECT e.first_name, lt.name AS type,
       la.total_days, la.used_days, la.remaining_days
FROM leave_allocations la
JOIN employees e ON la.employee_id = e.id
JOIN leave_types lt ON la.leave_type_id = lt.id
WHERE la.validity_year = 2026 AND e.company_id = 1;
```

---

### Payroll
```sql
-- Payrun history
SELECT pay_period_month, pay_period_year, status,
       total_gross, total_deductions, total_net
FROM payroll_runs WHERE company_id = 1 ORDER BY pay_period_year, pay_period_month;
```

**Scenarios:**
- Feb 2026 → `status = paid` (oldest — good for trend charts)
- Mar 2026 → `status = paid`
- Apr 2026 → `status = generated` → test "Mark as Paid" button + locked after paid

```sql
-- April payslips
SELECT e.first_name, ps.basic_wage, ps.working_days, ps.days_worked,
       ps.gross_salary, ps.pf_employee, ps.professional_tax,
       ps.total_deductions, ps.net_pay
FROM payslips ps JOIN employees e ON ps.employee_id = e.id
WHERE ps.payroll_run_id = 3;
```

---

### Audit Logs
```sql
-- Recent audit trail
SELECT u.email AS actor, al.action, al.entity_type,
       al.changes, al.created_at
FROM audit_logs al LEFT JOIN users u ON al.user_id = u.id
ORDER BY al.created_at DESC LIMIT 20;
```

---

### Performance Reviews
```sql
SELECT e.first_name, pr.rating, pr.strengths, pr.status,
       pr.review_period_start, pr.review_period_end
FROM performance_reviews pr JOIN employees e ON pr.employee_id = e.id;
```

---

### Goals
```sql
SELECT e.first_name, g.title, g.status, g.progress, g.target_date
FROM goals g JOIN employees e ON g.employee_id = e.id
ORDER BY e.id, g.target_date;
```

---

## 4. Useful Queries for Your API Endpoints

### Dashboard: Today's attendance count
```sql
SELECT
  COUNT(*) FILTER (WHERE status = 'present')  AS present_today,
  COUNT(*) FILTER (WHERE status = 'absent')   AS absent_today,
  COUNT(*) FILTER (WHERE status = 'on_leave') AS on_leave_today
FROM attendance
WHERE date = CURRENT_DATE
  AND employee_id IN (
    SELECT id FROM employees WHERE company_id = 1 AND status = 'active'
  );
```

### Payroll: Calculate per-day wage
```sql
SELECT
  e.first_name,
  e.basic_wage,
  ROUND(e.basic_wage / 22.0, 2) AS per_day_wage,
  -- 22 = working days in April 2026, fetch dynamically in app
  ROUND((e.basic_wage / 22.0) * ps.days_worked, 2) AS gross_check
FROM employees e JOIN payslips ps ON e.id = ps.employee_id
WHERE ps.payroll_run_id = 3;
```

### Leave: Check for overlap before applying
```sql
SELECT COUNT(*) FROM leave_requests
WHERE employee_id = 4
  AND status IN ('pending', 'approved')
  AND from_date <= '2026-05-07'
  AND to_date   >= '2026-05-05';
-- Returns > 0 means overlap exists → block submission
```

### Attendance: Check if already checked in today
```sql
SELECT id, check_in_time, check_out_time, status
FROM attendance
WHERE employee_id = 4 AND date = CURRENT_DATE;
-- If row exists with check_in_time NOT NULL and check_out_time IS NULL → show Check Out button
-- If both are set → show "Already marked"
-- If no row → show Check In button
```

---

## 5. Re-seeding During Development

If you want to wipe and re-seed during development:
```sql
-- The TRUNCATE at the top of mock_data.sql handles this.
-- Just re-run:
psql -U postgres -d empay_db -f empay_mock_data.sql
```

Or add a script in your package.json:
```json
"scripts": {
  "db:seed": "psql -U postgres -d empay_db -f empay_mock_data.sql",
  "db:reset": "psql -U postgres -d empay_db -f schema.sql && npm run db:seed"
}
```

---

## 6. Sequence Fix (Important!)

After inserting with explicit IDs, PostgreSQL sequences get out of sync.
The mock data file already includes this at the bottom, but run it manually if needed:
```sql
SELECT setval('companies_id_seq',  (SELECT MAX(id) FROM companies));
SELECT setval('users_id_seq',      (SELECT MAX(id) FROM users));
SELECT setval('employees_id_seq',  (SELECT MAX(id) FROM employees));
SELECT setval('leave_types_id_seq',(SELECT MAX(id) FROM leave_types));
SELECT setval('leave_requests_id_seq', (SELECT MAX(id) FROM leave_requests));
SELECT setval('payroll_runs_id_seq',(SELECT MAX(id) FROM payroll_runs));
SELECT setval('payslips_id_seq',   (SELECT MAX(id) FROM payslips));
```
Without this, your next `INSERT` without explicit ID will crash with a duplicate key error.
