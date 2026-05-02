-- EmPay HRMS Mock Data
-- Insert sample data for testing and demonstration

-- Insert Company
INSERT INTO companies (name, company_code, email, phone, address) 
VALUES ('Odoo India', 'OI', 'admin@odoo-india.com', '+91-9876543210', '123 Tech Park, Bangalore');

-- Insert Users (Admin, HR, Payroll, Employees)
INSERT INTO users (company_id, login_id, email, password_hash, role, is_active, first_login) 
VALUES 
(1, 'OIADM000001', 'admin@odoo-india.com', '$2b$10$YourHashedPasswordHere', 'admin', true, false),
(1, 'OIHR0000001', 'hr@odoo-india.com', '$2b$10$YourHashedPasswordHere', 'hr_officer', true, false),
(1, 'OIPR0000001', 'payroll@odoo-india.com', '$2b$10$YourHashedPasswordHere', 'payroll_officer', true, false);

-- Insert Employees
INSERT INTO employees (user_id, company_id, first_name, last_name, date_of_birth, gender, phone, address, emergency_contact_name, emergency_contact_phone, department, designation, date_of_joining, employment_type, reporting_manager_id, basic_wage, pf_applicable, professional_tax_applicable, status, serial_number) 
VALUES 
(2, 1, 'Rajesh', 'Kumar', '1990-05-15', 'Male', '9876543210', '123 Main St, Bangalore', 'Priya Kumar', '9876543211', 'Engineering', 'Senior Developer', '2020-01-15', 'full_time', NULL, 75000, true, true, 'active', 1),
(3, 1, 'Priya', 'Singh', '1992-08-20', 'Female', '9876543212', '456 Oak Ave, Bangalore', 'Amit Singh', '9876543213', 'HR', 'HR Manager', '2019-06-01', 'full_time', NULL, 60000, true, true, 'active', 2);

-- Insert Leave Types
INSERT INTO leave_types (company_id, name, is_paid, default_days, carry_forward, max_carry_forward_days) 
VALUES 
(1, 'Paid Time Off', true, 18, true, 5),
(1, 'Sick Leave', true, 6, false, 0),
(1, 'Unpaid Leave', false, 0, false, 0);

-- Insert Leave Allocations
INSERT INTO leave_allocations (employee_id, leave_type_id, total_days, used_days, remaining_days, validity_year) 
VALUES 
(1, 1, 18, 2, 16, 2026),
(1, 2, 6, 0, 6, 2026),
(2, 1, 18, 1, 17, 2026),
(2, 2, 6, 0, 6, 2026);

-- Insert Attendance Records
INSERT INTO attendance (employee_id, date, check_in_time, check_out_time, duration_minutes, status) 
VALUES 
(1, '2026-05-01', '2026-05-01 09:00:00', '2026-05-01 17:30:00', 510, 'present'),
(1, '2026-04-30', '2026-04-30 09:15:00', '2026-04-30 17:45:00', 510, 'present'),
(2, '2026-05-01', '2026-05-01 09:30:00', '2026-05-01 18:00:00', 510, 'present'),
(2, '2026-04-30', '2026-04-30 09:00:00', '2026-04-30 17:30:00', 510, 'present');

-- Insert Leave Requests
INSERT INTO leave_requests (employee_id, leave_type_id, from_date, to_date, days_requested, reason, status, approved_by) 
VALUES 
(1, 1, '2026-05-10', '2026-05-12', 3, 'Personal work', 'approved', 3),
(2, 2, '2026-05-15', '2026-05-15', 1, 'Medical appointment', 'pending', NULL);

-- Insert Payroll Runs
INSERT INTO payroll_runs (company_id, pay_period_month, pay_period_year, status, total_gross, total_deductions, total_net, created_by) 
VALUES 
(1, 4, 2026, 'paid', 135000, 25000, 110000, 3);

-- Insert Payslips
INSERT INTO payslips (payroll_run_id, employee_id, basic_wage, working_days, days_worked, gross_salary, pf_employee, pf_employer, professional_tax, other_deductions, total_deductions, net_pay) 
VALUES 
(1, 1, 75000, 22, 20, 68181, 9000, 9000, 200, 0, 9200, 58981),
(1, 2, 60000, 22, 21, 63636, 7200, 7200, 200, 0, 7400, 56236);

-- Insert Performance Reviews
INSERT INTO performance_reviews (employee_id, reviewer_id, review_period_start, review_period_end, rating, strengths, areas_for_improvement, goals, status) 
VALUES 
(1, 2, '2026-01-01', '2026-03-31', 4, 'Strong technical skills, good team player', 'Communication could be improved', 'Lead a major project', 'completed'),
(2, 2, '2026-01-01', '2026-03-31', 5, 'Excellent leadership, great initiative', 'None', 'Mentor junior staff', 'completed');

-- Insert Goals
INSERT INTO goals (employee_id, title, description, target_date, status, progress, created_by) 
VALUES 
(1, 'Complete AWS Certification', 'Get AWS Solutions Architect certification', '2026-06-30', 'in_progress', 50, 2),
(2, 'Implement new HR system', 'Deploy new HRMS platform', '2026-07-31', 'in_progress', 75, 2);

-- Insert Policies
INSERT INTO policies (company_id, title, category, content, is_active, created_by) 
VALUES 
(1, 'Attendance Policy', 'Attendance Policy', 'Employees must mark attendance daily. Working hours are 9 AM to 6 PM.', true, 1),
(1, 'Leave Policy', 'Leave Policy', 'Employees are entitled to 18 days of paid leave per year.', true, 1),
(1, 'Code of Conduct', 'Code of Conduct', 'All employees must follow professional conduct guidelines.', true, 1);
