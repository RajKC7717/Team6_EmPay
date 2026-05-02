export interface User {
  id: number;
  company_id: number;
  login_id: string;
  email: string;
  password_hash: string;
  role: 'admin' | 'hr_officer' | 'payroll_officer' | 'employee';
  is_active: boolean;
  first_login: boolean;
  failed_login_attempts: number;
  account_locked_until?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface Employee {
  id: number;
  user_id: number;
  company_id: number;
  first_name: string;
  last_name: string;
  date_of_birth?: Date;
  gender?: string;
  phone?: string;
  address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  department?: string;
  designation: string;
  date_of_joining: Date;
  employment_type: 'full_time' | 'part_time' | 'contract';
  reporting_manager_id?: number;
  basic_wage: number;
  pf_applicable: boolean;
  professional_tax_applicable: boolean;
  profile_photo_url?: string;
  bank_account_number?: string;
  bank_ifsc_code?: string;
  status: 'active' | 'inactive' | 'terminated';
  serial_number: number;
  created_at: Date;
  updated_at: Date;
}

export interface Company {
  id: number;
  name: string;
  company_code: string;
  email: string;
  phone?: string;
  address?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Attendance {
  id: number;
  employee_id: number;
  date: Date;
  check_in_time?: Date;
  check_out_time?: Date;
  duration_minutes?: number;
  status: 'present' | 'absent' | 'half_day' | 'on_leave' | 'holiday';
  location?: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface LeaveRequest {
  id: number;
  employee_id: number;
  leave_type_id: number;
  from_date: Date;
  to_date: Date;
  days_requested: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  approved_by?: number;
  rejection_reason?: string;
  created_at: Date;
  updated_at: Date;
}
