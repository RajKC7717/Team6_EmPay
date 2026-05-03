-- Companies Table
CREATE TABLE companies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  company_code VARCHAR(10) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20),
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users Table (Admin, HR, Payroll, Employee)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  login_id VARCHAR(50) UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'hr_officer', 'payroll_officer', 'employee')),
  is_active BOOLEAN DEFAULT true,
  first_login BOOLEAN DEFAULT true,
  failed_login_attempts INTEGER DEFAULT 0,
  account_locked_until TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Employees Table
CREATE TABLE employees (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  date_of_birth DATE,
  gender VARCHAR(20),
  phone VARCHAR(20),
  address TEXT,
  emergency_contact_name VARCHAR(100),
  emergency_contact_phone VARCHAR(20),
  department VARCHAR(100),
  designation VARCHAR(100) NOT NULL,
  date_of_joining DATE NOT NULL,
  employment_type VARCHAR(20) CHECK (employment_type IN ('full_time', 'part_time', 'contract', 'intern')),
  reporting_manager_id INTEGER REFERENCES employees(id),
  basic_wage DECIMAL(10, 2) NOT NULL,
  pf_applicable BOOLEAN DEFAULT false,
  professional_tax_applicable BOOLEAN DEFAULT false,
  profile_photo_url TEXT,
  bank_account_number VARCHAR(50),
  bank_ifsc_code VARCHAR(20),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'terminated')),
  serial_number INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Attendance Table
CREATE TABLE attendance (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  check_in_time TIMESTAMP,
  check_out_time TIMESTAMP,
  duration_minutes INTEGER,
  status VARCHAR(20) CHECK (status IN ('present', 'absent', 'half_day', 'on_leave', 'holiday')),
  location VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(employee_id, date)
);

-- Leave Types Table
CREATE TABLE leave_types (
  id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  is_paid BOOLEAN DEFAULT true,
  default_days INTEGER DEFAULT 0,
  carry_forward BOOLEAN DEFAULT false,
  max_carry_forward_days INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Leave Allocations Table
CREATE TABLE leave_allocations (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  leave_type_id INTEGER NOT NULL REFERENCES leave_types(id) ON DELETE CASCADE,
  total_days INTEGER NOT NULL,
  used_days INTEGER DEFAULT 0,
  remaining_days INTEGER NOT NULL,
  validity_year INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(employee_id, leave_type_id, validity_year)
);

-- Leave Requests Table
CREATE TABLE leave_requests (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  leave_type_id INTEGER NOT NULL REFERENCES leave_types(id) ON DELETE CASCADE,
  from_date DATE NOT NULL,
  to_date DATE NOT NULL,
  days_requested INTEGER NOT NULL,
  reason TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  approved_by INTEGER REFERENCES users(id),
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payroll Runs Table
CREATE TABLE payroll_runs (
  id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  pay_period_month INTEGER NOT NULL CHECK (pay_period_month BETWEEN 1 AND 12),
  pay_period_year INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'generated' CHECK (status IN ('generated', 'paid')),
  total_gross DECIMAL(12, 2),
  total_deductions DECIMAL(12, 2),
  total_net DECIMAL(12, 2),
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(company_id, pay_period_month, pay_period_year)
);

-- Payslips Table
CREATE TABLE payslips (
  id SERIAL PRIMARY KEY,
  payroll_run_id INTEGER NOT NULL REFERENCES payroll_runs(id) ON DELETE CASCADE,
  employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  basic_wage DECIMAL(10, 2) NOT NULL,
  working_days INTEGER NOT NULL,
  days_worked INTEGER NOT NULL,
  gross_salary DECIMAL(10, 2) NOT NULL,
  pf_employee DECIMAL(10, 2) DEFAULT 0,
  pf_employer DECIMAL(10, 2) DEFAULT 0,
  professional_tax DECIMAL(10, 2) DEFAULT 0,
  other_deductions DECIMAL(10, 2) DEFAULT 0,
  total_deductions DECIMAL(10, 2) NOT NULL,
  net_pay DECIMAL(10, 2) NOT NULL,
  bonus DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
