-- ============================================================
-- EmPay HRMS - Complete Mock Data
-- Compatible with PostgreSQL
-- Run AFTER schema creation (schema.sql)
-- ============================================================

-- ============================================================
-- 0. RESET (Safe clean slate for re-runs during dev)
-- ============================================================
TRUNCATE TABLE audit_logs, goals, performance_reviews, policies,
  payslips, payroll_runs, leave_requests, leave_allocations,
  leave_types, holidays, attendance, employees, users, companies
RESTART IDENTITY CASCADE;

-- ============================================================
-- 1. COMPANIES
-- ============================================================
INSERT INTO companies (id, name, company_code, email, phone, address) VALUES
(1, 'TechNova Solutions Pvt Ltd',  'TCNV01', 'admin@technova.com',    '+91-9800001111', '5th Floor, Hinjawadi IT Park, Pune, Maharashtra 411057'),
(2, 'BrightMind Edu Systems',      'BRMD02', 'admin@brightmind.com',  '+91-9800002222', '2nd Floor, Koramangala, Bengaluru, Karnataka 560034');

-- ============================================================
-- 2. USERS
-- NOTE: Passwords below are bcrypt hashes of "Password@123"
-- Use this in your auth service for testing login
-- ============================================================
INSERT INTO users (id, company_id, login_id, email, password_hash, role, is_active, first_login, failed_login_attempts, account_locked_until) VALUES
-- TechNova (company_id = 1)
(1,  1, 'TCNV-ADM-001', 'admin@technova.com',       '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin',           true,  false, 0, NULL),
(2,  1, 'TCNV-HR-001',  'priya.sharma@technova.com','$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'hr_officer',      true,  false, 0, NULL),
(3,  1, 'TCNV-HR-002',  'karan.mehta@technova.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'hr_officer',      true,  false, 0, NULL),
(4,  1, 'TCNV-PAY-001', 'finance@technova.com',     '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'payroll_officer', true,  false, 0, NULL),
(5,  1, 'TCNV-EMP-001', 'arjun.kapoor@technova.com','$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'employee',        true,  false, 0, NULL),
(6,  1, 'TCNV-EMP-002', 'neha.joshi@technova.com',  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'employee',        true,  false, 0, NULL),
(7,  1, 'TCNV-EMP-003', 'rohan.verma@technova.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'employee',        true,  false, 0, NULL),
(8,  1, 'TCNV-EMP-004', 'ananya.singh@technova.com','$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'employee',        true,  true,  0, NULL),  -- first_login=true for onboarding flow test
(9,  1, 'TCNV-EMP-005', 'dev.null@technova.com',    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'employee',        false, false, 0, NULL),  -- inactive user
(10, 1, 'TCNV-EMP-006', 'locked.user@technova.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'employee',        true,  false, 5, NOW() + INTERVAL '15 minutes'), -- locked account test
-- BrightMind (company_id = 2)
(11, 2, 'BRMD-ADM-001', 'admin@brightmind.com',     '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin',           true,  false, 0, NULL),
(12, 2, 'BRMD-HR-001',  'hr@brightmind.com',        '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'hr_officer',      true,  false, 0, NULL),
(13, 2, 'BRMD-EMP-001', 'teacher1@brightmind.com',  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'employee',        true,  false, 0, NULL);

-- ============================================================
-- 3. EMPLOYEES
-- ============================================================
-- TechNova Employees
-- Note: serial_number is company-scoped sequence (e.g., 1,2,3...)
INSERT INTO employees (
  id, user_id, company_id, first_name, last_name, date_of_birth, gender,
  phone, address, emergency_contact_name, emergency_contact_phone,
  department, designation, date_of_joining, employment_type,
  reporting_manager_id, basic_wage, pf_applicable, professional_tax_applicable,
  profile_photo_url, bank_account_number, bank_ifsc_code, status, serial_number
) VALUES
-- HR Officers as employees (they also have employee records)
(1,  2, 1, 'Priya',   'Sharma',  '1991-03-14', 'female', '9811100001', '12 Baner Road, Pune',          'Ramesh Sharma',  '9811100099', 'Human Resources', 'HR Manager',        '2022-01-10', 'full_time', NULL, 75000.00, true,  true,  NULL, '1234567890123401', 'HDFC0001234', 'active', 1),
(2,  3, 1, 'Karan',   'Mehta',   '1993-07-22', 'male',   '9811100002', '45 Wakad, Pune',               'Sunita Mehta',   '9811100098', 'Human Resources', 'HR Executive',      '2023-03-01', 'full_time', 1,    55000.00, true,  true,  NULL, '1234567890123402', 'HDFC0001234', 'active', 2),
-- Payroll Officer as employee
(3,  4, 1, 'Sneha',   'Patil',   '1989-11-05', 'female', '9811100003', '78 Kothrud, Pune',             'Vijay Patil',    '9811100097', 'Finance',         'Payroll Officer',   '2021-06-15', 'full_time', NULL, 70000.00, true,  true,  NULL, '1234567890123403', 'ICIC0001234', 'active', 3),
-- Regular Employees
(4,  5, 1, 'Arjun',   'Kapoor',  '1995-04-18', 'male',   '9811100004', '23 Aundh, Pune',               'Meena Kapoor',   '9811100096', 'Engineering',     'Software Engineer', '2023-07-01', 'full_time', NULL, 80000.00, true,  true,  NULL, '1234567890123404', 'SBI00001234', 'active', 4),
(5,  6, 1, 'Neha',    'Joshi',   '1997-09-30', 'female', '9811100005', '5 Viman Nagar, Pune',          'Ashok Joshi',    '9811100095', 'Engineering',     'Junior Developer',  '2024-01-15', 'full_time', 4,    50000.00, true,  true,  NULL, '1234567890123405', 'AXIS0001234', 'active', 5),
(6,  7, 1, 'Rohan',   'Verma',   '1994-12-11', 'male',   '9811100006', '88 Koregaon Park, Pune',       'Kavita Verma',   '9811100094', 'Design',          'UI/UX Designer',    '2022-09-20', 'full_time', NULL, 65000.00, true,  true,  NULL, '1234567890123406', 'HDFC0005678', 'active', 6),
(7,  8, 1, 'Ananya',  'Singh',   '1999-02-28', 'female', '9811100007', '34 Hadapsar, Pune',            'Rajesh Singh',   '9811100093', 'Marketing',       'Marketing Analyst', '2025-03-10', 'full_time', NULL, 45000.00, false, true,  NULL, '1234567890123407', 'KOTAK001234', 'active', 7),  -- new joiner, first_login test
(8,  9, 1, 'Vikram',  'Nair',    '1990-06-17', 'male',   '9811100008', '67 Shivajinagar, Pune',        'Lata Nair',      '9811100092', 'Engineering',     'Senior Developer',  '2020-11-01', 'full_time', NULL, 95000.00, true,  true,  NULL, '1234567890123408', 'HDFC0009012', 'inactive', 8),  -- inactive
(9, 10, 1, 'Locked',  'UserTest','1995-01-01', 'male',   '9811100009', 'Test Address',                 'Test Contact',   '9811100091', 'QA',              'QA Engineer',       '2024-06-01', 'full_time', NULL, 55000.00, true,  true,  NULL, '1234567890123409', 'HDFC0003456', 'active', 9),
-- BrightMind Employee
(10,12, 2, 'Ramya',   'Iyer',    '1988-08-09', 'female', '9911100001', '10 Koramangala, Bengaluru',    'Suresh Iyer',    '9911100099', 'Human Resources', 'HR Manager',        '2021-04-01', 'full_time', NULL, 68000.00, true,  true,  NULL, '9876543210987601', 'SBIN0001234', 'active', 1),
(11,13, 2, 'Thomas',  'Mathew',  '1992-05-25', 'male',   '9911100002', '22 BTM Layout, Bengaluru',     'Mary Mathew',    '9911100098', 'Teaching',        'Senior Teacher',    '2022-06-01', 'full_time', 10,   58000.00, true,  true,  NULL, '9876543210987602', 'SBIN0005678', 'active', 2);

-- ============================================================
-- 4. LEAVE TYPES
-- ============================================================
INSERT INTO leave_types (id, company_id, name, is_paid, default_days, carry_forward, max_carry_forward_days) VALUES
-- TechNova leave types
(1, 1, 'Paid Time Off',  true,  18, true,  5),
(2, 1, 'Sick Leave',     true,  6,  false, 0),
(3, 1, 'Unpaid Leave',   false, 0,  false, 0),
-- BrightMind leave types
(4, 2, 'Paid Time Off',  true,  15, true,  3),
(5, 2, 'Sick Leave',     true,  8,  false, 0),
(6, 2, 'Unpaid Leave',   false, 0,  false, 0);

-- ============================================================
-- 5. HOLIDAYS
-- ============================================================
INSERT INTO holidays (company_id, name, date, is_optional) VALUES
-- TechNova 2026 Holidays
(1, 'New Year''s Day',        '2026-01-01', false),
(1, 'Makar Sankranti',        '2026-01-14', false),
(1, 'Republic Day',           '2026-01-26', false),
(1, 'Holi',                   '2026-03-25', false),
(1, 'Good Friday',            '2026-04-03', true),
(1, 'Ambedkar Jayanti',       '2026-04-14', false),
(1, 'Maharashtra Day',        '2026-05-01', false),
(1, 'Independence Day',       '2026-08-15', false),
(1, 'Ganesh Chaturthi',       '2026-08-22', false),
(1, 'Gandhi Jayanti',         '2026-10-02', false),
(1, 'Diwali (Lakshmi Puja)',  '2026-10-27', false),
(1, 'Diwali (Balipratipada)', '2026-10-28', false),
(1, 'Christmas Day',          '2026-12-25', false),
-- BrightMind 2026 Holidays
(2, 'New Year''s Day',        '2026-01-01', false),
(2, 'Republic Day',           '2026-01-26', false),
(2, 'Independence Day',       '2026-08-15', false),
(2, 'Gandhi Jayanti',         '2026-10-02', false),
(2, 'Christmas Day',          '2026-12-25', false);

-- ============================================================
-- 6. LEAVE ALLOCATIONS (for TechNova employees, year 2026)
-- ============================================================
-- Format: employee_id, leave_type_id, total_days, used_days, remaining_days, validity_year
INSERT INTO leave_allocations (employee_id, leave_type_id, total_days, used_days, remaining_days, validity_year) VALUES
-- Priya Sharma (emp 1)
(1, 1, 18, 3,  15, 2026),
(1, 2, 6,  1,  5,  2026),
(1, 3, 0,  0,  0,  2026),
-- Karan Mehta (emp 2)
(2, 1, 18, 0,  18, 2026),
(2, 2, 6,  2,  4,  2026),
(2, 3, 0,  0,  0,  2026),
-- Sneha Patil (emp 3)
(3, 1, 18, 5,  13, 2026),
(3, 2, 6,  0,  6,  2026),
(3, 3, 0,  2,  0,  2026),  -- 2 days unpaid taken
-- Arjun Kapoor (emp 4)
(4, 1, 18, 2,  16, 2026),
(4, 2, 6,  1,  5,  2026),
(4, 3, 0,  0,  0,  2026),
-- Neha Joshi (emp 5)
(5, 1, 18, 0,  18, 2026),
(5, 2, 6,  0,  6,  2026),
(5, 3, 0,  0,  0,  2026),
-- Rohan Verma (emp 6)
(6, 1, 18, 4,  14, 2026),
(6, 2, 6,  2,  4,  2026),
(6, 3, 0,  0,  0,  2026),
-- Ananya Singh (emp 7) - new joiner March 2025, pro-rated
(7, 1, 14, 0,  14, 2026),
(7, 2, 6,  0,  6,  2026),
(7, 3, 0,  0,  0,  2026),
-- BrightMind
(10, 4, 15, 2, 13, 2026),
(10, 5, 8,  0, 8,  2026),
(11, 4, 15, 0, 15, 2026),
(11, 5, 8,  1, 7,  2026);

-- ============================================================
-- 7. ATTENDANCE — April 2026 (Mon 1 Apr – Thu 30 Apr)
-- Working days in April 2026 = 22 (excluding Sat/Sun + no holidays)
-- We'll seed for employees 4,5,6,7 (Arjun, Neha, Rohan, Ananya)
-- ============================================================

-- Helper: April 2026 weekdays to insert = 1,2,3,6,7,8,9,10,13,14,15,16,17,20,21,22,23,24,27,28,29,30
-- Arjun Kapoor (emp 4) — 20 present, 1 on_leave, 1 absent
INSERT INTO attendance (employee_id, date, check_in_time, check_out_time, duration_minutes, status, notes) VALUES
(4, '2026-04-01', '2026-04-01 09:02:00', '2026-04-01 18:05:00', 543, 'present',  NULL),
(4, '2026-04-02', '2026-04-02 09:10:00', '2026-04-02 18:00:00', 530, 'present',  NULL),
(4, '2026-04-03', '2026-04-03 09:05:00', '2026-04-03 18:10:00', 545, 'present',  NULL),
(4, '2026-04-06', '2026-04-06 09:00:00', '2026-04-06 18:00:00', 540, 'present',  NULL),
(4, '2026-04-07', '2026-04-07 09:15:00', '2026-04-07 18:30:00', 555, 'present',  NULL),
(4, '2026-04-08', '2026-04-08 09:00:00', '2026-04-08 18:00:00', 540, 'present',  NULL),
(4, '2026-04-09', '2026-04-09 09:20:00', '2026-04-09 18:00:00', 520, 'present',  NULL),
(4, '2026-04-10', '2026-04-10 09:00:00', '2026-04-10 18:15:00', 555, 'present',  NULL),
(4, '2026-04-13', '2026-04-13 09:05:00', '2026-04-13 18:00:00', 535, 'present',  NULL),
(4, '2026-04-14', NULL,                  NULL,                  NULL, 'on_leave', 'Approved Paid Time Off'),
(4, '2026-04-15', '2026-04-15 09:00:00', '2026-04-15 18:00:00', 540, 'present',  NULL),
(4, '2026-04-16', '2026-04-16 09:10:00', '2026-04-16 18:05:00', 535, 'present',  NULL),
(4, '2026-04-17', '2026-04-17 09:00:00', '2026-04-17 13:30:00', 270, 'half_day', 'Left early - personal errand'),
(4, '2026-04-20', '2026-04-20 09:05:00', '2026-04-20 18:00:00', 535, 'present',  NULL),
(4, '2026-04-21', '2026-04-21 09:00:00', '2026-04-21 18:00:00', 540, 'present',  NULL),
(4, '2026-04-22', '2026-04-22 09:15:00', '2026-04-22 18:10:00', 535, 'present',  NULL),
(4, '2026-04-23', '2026-04-23 09:00:00', '2026-04-23 18:00:00', 540, 'present',  NULL),
(4, '2026-04-24', NULL,                  NULL,                  NULL, 'absent',   'No show - unplanned absence'),
(4, '2026-04-27', '2026-04-27 09:05:00', '2026-04-27 18:05:00', 540, 'present',  NULL),
(4, '2026-04-28', '2026-04-28 09:00:00', '2026-04-28 18:00:00', 540, 'present',  NULL),
(4, '2026-04-29', '2026-04-29 09:10:00', '2026-04-29 18:00:00', 530, 'present',  NULL),
(4, '2026-04-30', '2026-04-30 09:00:00', '2026-04-30 18:05:00', 545, 'present',  NULL);

-- Neha Joshi (emp 5) — 21 present, 1 sick leave
INSERT INTO attendance (employee_id, date, check_in_time, check_out_time, duration_minutes, status, notes) VALUES
(5, '2026-04-01', '2026-04-01 09:30:00', '2026-04-01 18:30:00', 540, 'present',  NULL),
(5, '2026-04-02', '2026-04-02 09:25:00', '2026-04-02 18:00:00', 515, 'present',  NULL),
(5, '2026-04-03', '2026-04-03 09:30:00', '2026-04-03 18:30:00', 540, 'present',  NULL),
(5, '2026-04-06', '2026-04-06 09:00:00', '2026-04-06 18:00:00', 540, 'present',  NULL),
(5, '2026-04-07', NULL,                  NULL,                  NULL, 'on_leave', 'Sick Leave - Approved'),
(5, '2026-04-08', '2026-04-08 09:35:00', '2026-04-08 18:05:00', 510, 'present',  NULL),
(5, '2026-04-09', '2026-04-09 09:00:00', '2026-04-09 18:00:00', 540, 'present',  NULL),
(5, '2026-04-10', '2026-04-10 09:20:00', '2026-04-10 18:20:00', 540, 'present',  NULL),
(5, '2026-04-13', '2026-04-13 09:00:00', '2026-04-13 18:00:00', 540, 'present',  NULL),
(5, '2026-04-14', '2026-04-14 09:15:00', '2026-04-14 18:10:00', 535, 'present',  NULL),
(5, '2026-04-15', '2026-04-15 09:00:00', '2026-04-15 18:00:00', 540, 'present',  NULL),
(5, '2026-04-16', '2026-04-16 09:10:00', '2026-04-16 18:05:00', 535, 'present',  NULL),
(5, '2026-04-17', '2026-04-17 09:00:00', '2026-04-17 18:00:00', 540, 'present',  NULL),
(5, '2026-04-20', '2026-04-20 09:05:00', '2026-04-20 18:00:00', 535, 'present',  NULL),
(5, '2026-04-21', '2026-04-21 09:00:00', '2026-04-21 18:00:00', 540, 'present',  NULL),
(5, '2026-04-22', '2026-04-22 09:30:00', '2026-04-22 18:30:00', 540, 'present',  NULL),
(5, '2026-04-23', '2026-04-23 09:00:00', '2026-04-23 18:00:00', 540, 'present',  NULL),
(5, '2026-04-24', '2026-04-24 09:10:00', '2026-04-24 18:00:00', 530, 'present',  NULL),
(5, '2026-04-27', '2026-04-27 09:00:00', '2026-04-27 18:00:00', 540, 'present',  NULL),
(5, '2026-04-28', '2026-04-28 09:25:00', '2026-04-28 18:20:00', 535, 'present',  NULL),
(5, '2026-04-29', '2026-04-29 09:00:00', '2026-04-29 18:00:00', 540, 'present',  NULL),
(5, '2026-04-30', '2026-04-30 09:15:00', '2026-04-30 18:10:00', 535, 'present',  NULL);

-- Rohan Verma (emp 6) — 19 present, 2 on_leave, 1 absent
INSERT INTO attendance (employee_id, date, check_in_time, check_out_time, duration_minutes, status, notes) VALUES
(6, '2026-04-01', '2026-04-01 09:00:00', '2026-04-01 18:00:00', 540, 'present',  NULL),
(6, '2026-04-02', '2026-04-02 09:00:00', '2026-04-02 18:00:00', 540, 'present',  NULL),
(6, '2026-04-03', '2026-04-03 09:00:00', '2026-04-03 18:00:00', 540, 'present',  NULL),
(6, '2026-04-06', NULL,                  NULL,                  NULL, 'on_leave', 'Approved Paid Time Off'),
(6, '2026-04-07', NULL,                  NULL,                  NULL, 'on_leave', 'Approved Paid Time Off'),
(6, '2026-04-08', '2026-04-08 09:10:00', '2026-04-08 18:00:00', 530, 'present',  NULL),
(6, '2026-04-09', '2026-04-09 09:00:00', '2026-04-09 18:00:00', 540, 'present',  NULL),
(6, '2026-04-10', '2026-04-10 09:00:00', '2026-04-10 18:00:00', 540, 'present',  NULL),
(6, '2026-04-13', '2026-04-13 09:00:00', '2026-04-13 18:00:00', 540, 'present',  NULL),
(6, '2026-04-14', '2026-04-14 09:00:00', '2026-04-14 18:00:00', 540, 'present',  NULL),
(6, '2026-04-15', '2026-04-15 09:00:00', '2026-04-15 18:00:00', 540, 'present',  NULL),
(6, '2026-04-16', '2026-04-16 09:00:00', '2026-04-16 18:00:00', 540, 'present',  NULL),
(6, '2026-04-17', '2026-04-17 09:00:00', '2026-04-17 18:00:00', 540, 'present',  NULL),
(6, '2026-04-20', '2026-04-20 09:00:00', '2026-04-20 18:00:00', 540, 'present',  NULL),
(6, '2026-04-21', NULL,                  NULL,                  NULL, 'absent',   'Auto-marked absent by system'),
(6, '2026-04-22', '2026-04-22 09:00:00', '2026-04-22 18:00:00', 540, 'present',  NULL),
(6, '2026-04-23', '2026-04-23 09:05:00', '2026-04-23 18:05:00', 540, 'present',  NULL),
(6, '2026-04-24', '2026-04-24 09:00:00', '2026-04-24 18:00:00', 540, 'present',  NULL),
(6, '2026-04-27', '2026-04-27 09:00:00', '2026-04-27 18:00:00', 540, 'present',  NULL),
(6, '2026-04-28', '2026-04-28 09:00:00', '2026-04-28 18:00:00', 540, 'present',  NULL),
(6, '2026-04-29', '2026-04-29 09:10:00', '2026-04-29 18:05:00', 535, 'present',  NULL),
(6, '2026-04-30', '2026-04-30 09:00:00', '2026-04-30 18:00:00', 540, 'present',  NULL);

-- Ananya Singh (emp 7) — 22 present (full attendance — test perfect record)
INSERT INTO attendance (employee_id, date, check_in_time, check_out_time, duration_minutes, status, notes) VALUES
(7, '2026-04-01', '2026-04-01 08:55:00', '2026-04-01 17:58:00', 543, 'present', NULL),
(7, '2026-04-02', '2026-04-02 09:00:00', '2026-04-02 18:00:00', 540, 'present', NULL),
(7, '2026-04-03', '2026-04-03 08:58:00', '2026-04-03 18:02:00', 544, 'present', NULL),
(7, '2026-04-06', '2026-04-06 09:00:00', '2026-04-06 18:00:00', 540, 'present', NULL),
(7, '2026-04-07', '2026-04-07 09:01:00', '2026-04-07 18:01:00', 540, 'present', NULL),
(7, '2026-04-08', '2026-04-08 09:00:00', '2026-04-08 18:00:00', 540, 'present', NULL),
(7, '2026-04-09', '2026-04-09 08:55:00', '2026-04-09 17:55:00', 540, 'present', NULL),
(7, '2026-04-10', '2026-04-10 09:00:00', '2026-04-10 18:00:00', 540, 'present', NULL),
(7, '2026-04-13', '2026-04-13 09:00:00', '2026-04-13 18:00:00', 540, 'present', NULL),
(7, '2026-04-14', '2026-04-14 09:02:00', '2026-04-14 18:02:00', 540, 'present', NULL),
(7, '2026-04-15', '2026-04-15 09:00:00', '2026-04-15 18:00:00', 540, 'present', NULL),
(7, '2026-04-16', '2026-04-16 09:00:00', '2026-04-16 18:00:00', 540, 'present', NULL),
(7, '2026-04-17', '2026-04-17 09:00:00', '2026-04-17 18:00:00', 540, 'present', NULL),
(7, '2026-04-20', '2026-04-20 09:00:00', '2026-04-20 18:00:00', 540, 'present', NULL),
(7, '2026-04-21', '2026-04-21 09:05:00', '2026-04-21 18:05:00', 540, 'present', NULL),
(7, '2026-04-22', '2026-04-22 09:00:00', '2026-04-22 18:00:00', 540, 'present', NULL),
(7, '2026-04-23', '2026-04-23 09:00:00', '2026-04-23 18:00:00', 540, 'present', NULL),
(7, '2026-04-24', '2026-04-24 09:00:00', '2026-04-24 18:00:00', 540, 'present', NULL),
(7, '2026-04-27', '2026-04-27 09:00:00', '2026-04-27 18:00:00', 540, 'present', NULL),
(7, '2026-04-28', '2026-04-28 09:00:00', '2026-04-28 18:00:00', 540, 'present', NULL),
(7, '2026-04-29', '2026-04-29 09:00:00', '2026-04-29 18:00:00', 540, 'present', NULL),
(7, '2026-04-30', '2026-04-30 09:00:00', '2026-04-30 18:00:00', 540, 'present', NULL);

-- ============================================================
-- 8. LEAVE REQUESTS
-- ============================================================
INSERT INTO leave_requests (id, employee_id, leave_type_id, from_date, to_date, days_requested, reason, status, approved_by, rejection_reason) VALUES
-- Arjun's approved leave (April 14)
(1, 4, 1, '2026-04-14', '2026-04-14', 1, 'Family function at home town', 'approved', 4, NULL),
-- Neha's approved sick leave (April 7)
(2, 5, 2, '2026-04-07', '2026-04-07', 1, 'Fever and cold', 'approved', 4, NULL),
-- Rohan's approved 2-day leave (April 6-7)
(3, 6, 1, '2026-04-06', '2026-04-07', 2, 'Personal work — travel', 'approved', 4, NULL),
-- Pending leave request from Arjun for May
(4, 4, 1, '2026-05-05', '2026-05-07', 3, 'Vacation trip to Goa', 'pending', NULL, NULL),
-- Rejected leave request from Neha
(5, 5, 1, '2026-04-28', '2026-04-30', 3, 'Extended weekend break', 'rejected', 4, 'Peak delivery period — team cannot spare absence.'),
-- Ananya's pending sick leave
(6, 7, 2, '2026-05-02', '2026-05-02', 1, 'Doctor appointment', 'pending', NULL, NULL),
-- Rohan's cancelled leave
(7, 6, 1, '2026-05-12', '2026-05-13', 2, 'Personal trip', 'cancelled', NULL, NULL);

-- ============================================================
-- 9. PAYROLL RUNS
-- ============================================================
-- March 2026 — Paid (older, for history/chart)
INSERT INTO payroll_runs (id, company_id, pay_period_month, pay_period_year, status, total_gross, total_deductions, total_net, created_by) VALUES
(1, 1, 2, 2026, 'paid',      247000.00, 32800.00, 214200.00, 4),  -- Feb paid
(2, 1, 3, 2026, 'paid',      270000.00, 35500.00, 234500.00, 4),  -- Mar paid
(3, 1, 4, 2026, 'generated', 261250.00, 34400.00, 226850.00, 4);  -- Apr generated (not yet paid)

-- ============================================================
-- 10. PAYSLIPS — April 2026 (payroll_run_id = 3)
-- Formulas applied:
--   Working days April 2026 = 22
--   Per Day = basic_wage / 22
--   Gross = per_day × days_worked
--   PF Employee = 12% of basic (capped at 15000 basic for PF ceiling = ₹1800 max)
--   Prof Tax: >10000 gross = ₹200
--   Net = Gross - PF_emp - Prof_Tax
-- ============================================================
INSERT INTO payslips (
  id, payroll_run_id, employee_id,
  basic_wage, working_days, days_worked,
  gross_salary,
  pf_employee, pf_employer,
  professional_tax, other_deductions, total_deductions,
  net_pay, bonus
) VALUES
-- Arjun (emp 4): 80000 basic, 22 working, 20 days paid (19 present + 1 leave = 20), 1 half_day=0.5
-- days_worked = 19 present + 1 on_leave(paid) + 0.5 half_day = 20.5
-- gross = (80000/22) * 20.5 = 3636.36 * 20.5 = 74545.45 ~ 74545
-- PF = 12% of 15000 (PF ceiling) = 1800
-- Prof Tax = 200 (>10000)
-- Net = 74545 - 1800 - 200 = 72545
(1, 3, 4, 80000.00, 22, 20, 74545.00, 1800.00, 1800.00, 200.00, 0.00, 2000.00, 72545.00, 0.00),

-- Neha (emp 5): 50000 basic, 22 working, 21 days paid (21 present + 1 on_leave(sick-paid))
-- days_worked = 21 + 1 = 22 (full month - sick leave is paid)
-- gross = (50000/22) * 22 = 50000
-- PF = 12% of 15000 = 1800
-- Prof Tax = 200
-- Net = 50000 - 1800 - 200 = 48000
(2, 3, 5, 50000.00, 22, 22, 50000.00, 1800.00, 1800.00, 200.00, 0.00, 2000.00, 48000.00, 0.00),

-- Rohan (emp 6): 65000 basic, 22 working, 19 present + 2 on_leave(paid) + 1 absent = 21 paid
-- gross = (65000/22) * 21 = 2954.54 * 21 = 62045.45 ~ 62045
-- PF = 1800, Prof Tax = 200
-- Net = 62045 - 1800 - 200 = 60045
(3, 3, 6, 65000.00, 22, 21, 62045.00, 1800.00, 1800.00, 200.00, 0.00, 2000.00, 60045.00, 0.00),

-- Ananya (emp 7): 45000 basic, 22 working, 22 days (full attendance)
-- gross = 45000
-- PF = not applicable (pf_applicable=false)
-- Prof Tax = 200
-- Net = 45000 - 0 - 200 = 44800
(4, 3, 7, 45000.00, 22, 22, 45000.00, 0.00, 0.00, 200.00, 0.00, 200.00, 44800.00, 0.00);

-- ============================================================
-- 11. PERFORMANCE REVIEWS
-- ============================================================
INSERT INTO performance_reviews (employee_id, reviewer_id, review_period_start, review_period_end, rating, strengths, areas_for_improvement, goals, comments, status) VALUES
(4, 2, '2026-01-01', '2026-03-31', 4, 'Strong technical skills, delivers on time, good team player', 'Can improve documentation, needs to participate more in code reviews', 'Lead a module independently in Q2, mentor 1 junior', 'Arjun has shown consistent improvement. Recommended for senior track.', 'completed'),
(5, 2, '2026-01-01', '2026-03-31', 3, 'Quick learner, eager to take on tasks', 'Needs to work on debugging skills, improve code quality', 'Complete advanced React training by June', 'Shows good progress for a junior dev. Keep monitoring.', 'completed'),
(6, 2, '2026-01-01', '2026-03-31', 5, 'Excellent design output, deep Figma expertise, client loved Q1 work', 'Time management during crunch periods', 'Own full product design for next release', 'Rohan is one of our best performers. Raise recommended.', 'completed'),
(7, 2, '2026-01-01', '2026-03-31', 3, 'Energetic, meets deadlines, good attitude', 'Still learning domain knowledge', 'Shadow senior team for 1 quarter', 'New joiner — on track for growth.', 'submitted');

-- ============================================================
-- 12. GOALS
-- ============================================================
INSERT INTO goals (employee_id, title, description, target_date, status, progress, created_by) VALUES
(4, 'Complete AWS Certification',              'Obtain AWS Solutions Architect Associate certification', '2026-06-30', 'in_progress', 60, 2),
(4, 'Lead Payment Module Development',         'Own architecture and delivery of new payment gateway integration', '2026-07-31', 'in_progress', 35, 2),
(5, 'Complete Advanced React Training',        'Finish Udemy advanced React + TypeScript course', '2026-06-30', 'in_progress', 45, 2),
(5, 'Improve Test Coverage to 80%',            'Write unit tests to bring coverage from 50% to 80% on assigned modules', '2026-08-31', 'not_started', 0, 2),
(6, 'Design System Documentation',            'Document full component library for EmPay design system', '2026-05-31', 'in_progress', 80, 2),
(6, 'Figma to Dev Handoff Process',           'Create and implement a standard Figma-to-dev handoff checklist', '2026-06-15', 'in_progress', 50, 2),
(7, 'Complete Domain Knowledge Training',     'Attend HR domain training sessions for 3 months', '2026-06-30', 'in_progress', 20, 2),
(7, 'Create First Marketing Campaign Report', 'Independently prepare Q2 campaign performance report', '2026-07-15', 'not_started', 0, 2);

-- ============================================================
-- 13. POLICIES
-- ============================================================
INSERT INTO policies (company_id, title, category, content, is_active, created_by) VALUES
(1, 'Work From Home Policy', 'remote_work',
 'Employees may work from home up to 2 days per week with prior manager approval. Core hours 10am–4pm must be maintained. Any WFH day with missed standup will be treated as absent unless HR is notified.',
 true, 1),
(1, 'Leave & Attendance Policy', 'leave',
 'All leave requests must be submitted at least 48 hours in advance except for sick leave. Sick leave requires a medical certificate for absences exceeding 2 consecutive days. Unapproved absences are treated as Loss of Pay.',
 true, 1),
(1, 'Code of Conduct', 'conduct',
 'All employees are expected to maintain professional conduct. Harassment of any kind will result in immediate disciplinary action. Employees must not share confidential company information with third parties.',
 true, 1),
(1, 'Payroll & Salary Policy', 'payroll',
 'Salaries are processed on the 28th of every month for the current month. Advance salary requests require Finance approval. Salary information is strictly confidential.',
 true, 1),
(1, 'IT & Data Security Policy', 'security',
 'All employees must use company-provided accounts for work communication. Personal devices must not be used to store client data. Passwords must be changed every 90 days.',
 true, 1);

-- ============================================================
-- 14. AUDIT LOGS
-- ============================================================
INSERT INTO audit_logs (user_id, action, entity_type, entity_id, changes, ip_address) VALUES
(1, 'CREATE_USER',        'users',            2,  '{"email": "priya.sharma@technova.com", "role": "hr_officer"}',                    '192.168.1.10'),
(1, 'CREATE_USER',        'users',            4,  '{"email": "finance@technova.com", "role": "payroll_officer"}',                    '192.168.1.10'),
(2, 'CREATE_EMPLOYEE',    'employees',        4,  '{"name": "Arjun Kapoor", "department": "Engineering", "wage": 80000}',            '192.168.1.12'),
(2, 'CREATE_EMPLOYEE',    'employees',        5,  '{"name": "Neha Joshi", "department": "Engineering", "wage": 50000}',              '192.168.1.12'),
(2, 'CREATE_EMPLOYEE',    'employees',        7,  '{"name": "Ananya Singh", "department": "Marketing", "wage": 45000}',              '192.168.1.12'),
(2, 'ALLOCATE_LEAVE',     'leave_allocations',4,  '{"employee_id": 4, "leave_type": "Paid Time Off", "days": 18}',                  '192.168.1.12'),
(4, 'APPROVE_LEAVE',      'leave_requests',   1,  '{"employee_id": 4, "status": "approved", "days": 1}',                            '192.168.1.15'),
(4, 'APPROVE_LEAVE',      'leave_requests',   2,  '{"employee_id": 5, "status": "approved", "days": 1}',                            '192.168.1.15'),
(4, 'REJECT_LEAVE',       'leave_requests',   5,  '{"employee_id": 5, "status": "rejected", "reason": "Peak delivery period"}',     '192.168.1.15'),
(4, 'GENERATE_PAYROLL',   'payroll_runs',     3,  '{"period": "April 2026", "total_net": 226850}',                                  '192.168.1.15'),
(1, 'DEACTIVATE_USER',    'users',            9,  '{"user_id": 9, "action": "deactivated", "reason": "Employee resigned"}',         '192.168.1.10'),
(2, 'UPDATE_EMPLOYEE',    'employees',        6,  '{"field": "designation", "old": "Designer", "new": "UI/UX Designer"}',           '192.168.1.12'),
(5, 'MARK_ATTENDANCE',    'attendance',       NULL,'{"employee_id": 4, "date": "2026-04-01", "status": "present"}',                 '192.168.1.20'),
(5, 'APPLY_LEAVE',        'leave_requests',   4,  '{"employee_id": 4, "from": "2026-05-05", "to": "2026-05-07", "days": 3}',        '192.168.1.20');

-- ============================================================
-- SEQUENCE SYNC (important after explicit ID inserts)
-- ============================================================
SELECT setval('companies_id_seq',  (SELECT MAX(id) FROM companies));
SELECT setval('users_id_seq',      (SELECT MAX(id) FROM users));
SELECT setval('employees_id_seq',  (SELECT MAX(id) FROM employees));
SELECT setval('leave_types_id_seq',(SELECT MAX(id) FROM leave_types));
SELECT setval('leave_requests_id_seq', (SELECT MAX(id) FROM leave_requests));
SELECT setval('payroll_runs_id_seq',(SELECT MAX(id) FROM payroll_runs));
SELECT setval('payslips_id_seq',   (SELECT MAX(id) FROM payslips));
