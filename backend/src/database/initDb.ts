import pool from '../config/database';
import bcrypt from 'bcrypt';

const db = (pool as any)._db;

/**
 * Initialize the SQLite database: create tables and seed demo data.
 */
export async function initializeDatabase() {
  console.log('Initializing SQLite database...');

  // Create all tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS companies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      company_code TEXT NOT NULL UNIQUE,
      email TEXT,
      phone TEXT,
      address TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      login_id TEXT UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'employee' CHECK (role IN ('admin', 'hr_officer', 'payroll_officer', 'employee')),
      is_active INTEGER DEFAULT 1,
      first_login INTEGER DEFAULT 1,
      failed_login_attempts INTEGER DEFAULT 0,
      account_locked_until TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      date_of_birth TEXT,
      gender TEXT CHECK (gender IN ('male', 'female', 'other')),
      phone TEXT,
      address TEXT,
      emergency_contact_name TEXT,
      emergency_contact_phone TEXT,
      department TEXT,
      designation TEXT NOT NULL,
      date_of_joining TEXT NOT NULL,
      employment_type TEXT NOT NULL DEFAULT 'full_time' CHECK (employment_type IN ('full_time', 'part_time', 'contract')),
      reporting_manager_id INTEGER REFERENCES employees(id),
      basic_wage REAL NOT NULL DEFAULT 0,
      pf_applicable INTEGER DEFAULT 0,
      professional_tax_applicable INTEGER DEFAULT 0,
      profile_photo_url TEXT,
      bank_account_number TEXT,
      bank_ifsc_code TEXT,
      status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'terminated')),
      serial_number INTEGER NOT NULL DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
      date TEXT NOT NULL,
      check_in_time TEXT,
      check_out_time TEXT,
      duration_minutes INTEGER,
      status TEXT DEFAULT 'present' CHECK (status IN ('present', 'absent', 'half_day', 'on_leave', 'holiday')),
      location TEXT,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE(employee_id, date)
    );

    CREATE TABLE IF NOT EXISTS leave_types (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      is_paid INTEGER DEFAULT 1,
      default_days INTEGER DEFAULT 0,
      carry_forward INTEGER DEFAULT 0,
      max_carry_forward_days INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS leave_allocations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
      leave_type_id INTEGER NOT NULL REFERENCES leave_types(id) ON DELETE CASCADE,
      total_days INTEGER NOT NULL DEFAULT 0,
      used_days INTEGER NOT NULL DEFAULT 0,
      remaining_days INTEGER NOT NULL DEFAULT 0,
      validity_year INTEGER NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE(employee_id, leave_type_id, validity_year)
    );

    CREATE TABLE IF NOT EXISTS leave_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
      leave_type_id INTEGER NOT NULL REFERENCES leave_types(id),
      from_date TEXT NOT NULL,
      to_date TEXT NOT NULL,
      days_requested INTEGER NOT NULL,
      reason TEXT NOT NULL,
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
      approved_by INTEGER REFERENCES users(id),
      rejection_reason TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS payroll_runs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      pay_period_month INTEGER NOT NULL CHECK (pay_period_month BETWEEN 1 AND 12),
      pay_period_year INTEGER NOT NULL,
      status TEXT DEFAULT 'generated' CHECK (status IN ('draft', 'generated', 'paid')),
      total_gross REAL DEFAULT 0,
      total_deductions REAL DEFAULT 0,
      total_net REAL DEFAULT 0,
      generated_by INTEGER REFERENCES users(id),
      paid_at TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE(company_id, pay_period_month, pay_period_year)
    );

    CREATE TABLE IF NOT EXISTS payslips (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      payroll_run_id INTEGER NOT NULL REFERENCES payroll_runs(id) ON DELETE CASCADE,
      employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
      basic_wage REAL NOT NULL DEFAULT 0,
      working_days INTEGER NOT NULL DEFAULT 0,
      days_present INTEGER NOT NULL DEFAULT 0,
      paid_leave_days INTEGER NOT NULL DEFAULT 0,
      gross_salary REAL NOT NULL DEFAULT 0,
      pf_employee REAL DEFAULT 0,
      pf_employer REAL DEFAULT 0,
      professional_tax REAL DEFAULT 0,
      other_deductions REAL DEFAULT 0,
      other_deduction_reason TEXT,
      bonus REAL DEFAULT 0,
      total_deductions REAL NOT NULL DEFAULT 0,
      net_pay REAL NOT NULL DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS performance_reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
      reviewer_id INTEGER NOT NULL REFERENCES users(id),
      review_period_start TEXT NOT NULL,
      review_period_end TEXT NOT NULL,
      rating INTEGER CHECK (rating BETWEEN 1 AND 5),
      strengths TEXT,
      areas_for_improvement TEXT,
      goals TEXT,
      comments TEXT,
      status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'completed')),
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      target_date TEXT,
      status TEXT DEFAULT 'in_progress' CHECK (status IN ('not_started', 'in_progress', 'completed', 'cancelled')),
      progress INTEGER DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
      created_by INTEGER REFERENCES users(id),
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS policies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      content TEXT NOT NULL,
      file_url TEXT,
      is_active INTEGER DEFAULT 1,
      created_by INTEGER REFERENCES users(id),
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id),
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id INTEGER,
      changes TEXT,
      ip_address TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS holidays (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      date TEXT NOT NULL,
      is_optional INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // Create indexes
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_company_id ON users(company_id);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_login_id ON users(login_id);
    CREATE INDEX IF NOT EXISTS idx_employees_user_id ON employees(user_id);
    CREATE INDEX IF NOT EXISTS idx_employees_company_id ON employees(company_id);
    CREATE INDEX IF NOT EXISTS idx_attendance_employee_date ON attendance(employee_id, date);
    CREATE INDEX IF NOT EXISTS idx_leave_requests_employee ON leave_requests(employee_id);
    CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON leave_requests(status);
    CREATE INDEX IF NOT EXISTS idx_payslips_employee ON payslips(employee_id);
    CREATE INDEX IF NOT EXISTS idx_payslips_payroll_run ON payslips(payroll_run_id);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
  `);

  console.log('Tables and indexes created successfully.');

  // Check if data already seeded
  const existingCompany = db.prepare('SELECT id FROM companies WHERE company_code = ?').get('EMPAY');
  if (existingCompany) {
    console.log('Database already seeded. Skipping seed step.');
    return;
  }

  // ============= SEED DATA =============
  console.log('Seeding demo data...');

  const PASSWORD = 'password123';
  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  // 1. Create Company
  const companyStmt = db.prepare(
    'INSERT INTO companies (name, company_code, email, phone, address) VALUES (?, ?, ?, ?, ?)'
  );
  const companyResult = companyStmt.run('EmPay Technologies', 'EMPAY', 'admin@empay.com', '9876543210', '123 Tech Park, Bangalore');
  const companyId = companyResult.lastInsertRowid;

  // 2. Create Users (one per role)
  const userStmt = db.prepare(
    'INSERT INTO users (company_id, login_id, email, password_hash, role, is_active, first_login) VALUES (?, ?, ?, ?, ?, 1, 0)'
  );

  const adminResult = userStmt.run(companyId, 'EMPAY-ADMIN-001', 'admin@empay.com', passwordHash, 'admin');
  const hrResult = userStmt.run(companyId, 'EMPAY-HR-001', 'hr@empay.com', passwordHash, 'hr_officer');
  const payrollResult = userStmt.run(companyId, 'EMPAY-PAY-001', 'payroll@empay.com', passwordHash, 'payroll_officer');
  const empResult = userStmt.run(companyId, 'EMPAY-EMP-001', 'john@empay.com', passwordHash, 'employee');

  // 3. Create Employee profiles
  const empStmt = db.prepare(
    `INSERT INTO employees (user_id, company_id, first_name, last_name, date_of_birth, gender, phone, department, designation, date_of_joining, employment_type, basic_wage, serial_number)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  empStmt.run(adminResult.lastInsertRowid, companyId, 'Raj', 'Kumar', '1985-06-15', 'male', '9876543210', 'Management', 'CEO & Admin', '2022-01-01', 'full_time', 120000, 1);
  empStmt.run(hrResult.lastInsertRowid, companyId, 'Priya', 'Sharma', '1990-03-22', 'female', '9876543211', 'Human Resources', 'HR Manager', '2022-02-15', 'full_time', 85000, 2);
  empStmt.run(payrollResult.lastInsertRowid, companyId, 'Amit', 'Patel', '1988-11-10', 'male', '9876543212', 'Finance', 'Payroll Manager', '2022-03-01', 'full_time', 75000, 3);
  empStmt.run(empResult.lastInsertRowid, companyId, 'John', 'Doe', '1995-07-08', 'male', '9876543213', 'Engineering', 'Software Developer', '2023-06-01', 'full_time', 60000, 4);

  // 4. Create Leave Types
  const leaveTypeStmt = db.prepare(
    'INSERT INTO leave_types (company_id, name, is_paid, default_days, carry_forward, max_carry_forward_days) VALUES (?, ?, ?, ?, ?, ?)'
  );
  const pto = leaveTypeStmt.run(companyId, 'Paid Time Off', 1, 18, 1, 5);
  const sick = leaveTypeStmt.run(companyId, 'Sick Leave', 1, 6, 0, 0);
  const unpaid = leaveTypeStmt.run(companyId, 'Unpaid Leave', 0, 0, 0, 0);

  // 5. Allocate leaves for all employees
  const allocStmt = db.prepare(
    'INSERT INTO leave_allocations (employee_id, leave_type_id, total_days, used_days, remaining_days, validity_year) VALUES (?, ?, ?, ?, ?, ?)'
  );
  const currentYear = new Date().getFullYear();

  for (let empId = 1; empId <= 4; empId++) {
    allocStmt.run(empId, pto.lastInsertRowid, 18, 0, 18, currentYear);
    allocStmt.run(empId, sick.lastInsertRowid, 6, 0, 6, currentYear);
    allocStmt.run(empId, unpaid.lastInsertRowid, 0, 0, 0, currentYear);
  }

  // 6. Create a sample policy
  db.prepare(
    'INSERT INTO policies (company_id, title, category, content, is_active, created_by) VALUES (?, ?, ?, ?, 1, ?)'
  ).run(companyId, 'Work From Home Policy', 'General', 'Employees may work from home up to 2 days per week with prior manager approval. A stable internet connection and availability during core hours (10 AM - 6 PM) are required.', adminResult.lastInsertRowid);

  db.prepare(
    'INSERT INTO policies (company_id, title, category, content, is_active, created_by) VALUES (?, ?, ?, ?, 1, ?)'
  ).run(companyId, 'Leave Policy', 'HR', 'All full-time employees are entitled to 18 days of Paid Time Off and 6 days of Sick Leave per year. Leave must be applied at least 3 days in advance for planned absences.', adminResult.lastInsertRowid);

  console.log('===========================================');
  console.log('   DATABASE SEEDED SUCCESSFULLY!');
  console.log('===========================================');
  console.log('');
  console.log('   Login Credentials (password: password123)');
  console.log('   -----------------------------------------');
  console.log('   Admin:           admin@empay.com');
  console.log('   HR Officer:      hr@empay.com');
  console.log('   Payroll Officer:  payroll@empay.com');
  console.log('   Employee:        john@empay.com');
  console.log('');
  console.log('===========================================');
}
