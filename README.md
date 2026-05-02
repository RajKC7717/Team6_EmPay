# EmPay HRMS

Smart HR & Payroll Management System

## Project Structure

```
Team6_EmPay/
├── backend/          # Node.js + Express + PostgreSQL API
├── frontend/         # React + TypeScript + Bootstrap UI
├── index.html        # Landing page
├── styles.css        # Landing page styles
└── script.js         # Landing page scripts
```

## Setup Instructions

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Configure database credentials in .env
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## Features
- Auto-generated employee login IDs
- One-click attendance check-in/out
- Resume parsing for employee onboarding
- Income tax computation
- Performance management
- Policy documents
- Role-based access control






# EmPay – Smart HRMS: Complete Workflow Documentation

> **Purpose:** This document defines all role-based workflows, feature flows, error scenarios, and edge cases for the EmPay HRMS system. Use this as the single source of truth during development.

---

## Table of Contents

1. [System Architecture & Role Hierarchy](#1-system-architecture--role-hierarchy)
2. [Authentication Workflows](#2-authentication-workflows)
3. [Admin Workflows](#3-admin-workflows)
4. [HR Officer Workflows](#4-hr-officer-workflows)
5. [Payroll Officer Workflows](#5-payroll-officer-workflows)
6. [Employee Workflows](#6-employee-workflows)
7. [Attendance Module Workflows](#7-attendance-module-workflows)
8. [Leave / Time-Off Module Workflows](#8-leave--time-off-module-workflows)
9. [Payroll Module Workflows](#9-payroll-module-workflows)
10. [Dashboard & Analytics Workflows](#10-dashboard--analytics-workflows)
11. [Cross-Module Data Dependencies](#11-cross-module-data-dependencies)
12. [Global Error Handling Matrix](#12-global-error-handling-matrix)
13. [Edge Cases & Business Rules](#13-edge-cases--business-rules)

---

## 1. System Architecture & Role Hierarchy

### 1.1 Role Hierarchy (Descending Authority)

```
Super Admin  (SaaS / Platform Level – not visible to clients)
     ↓
Admin        (Company-level authority – full access)
     ↓
HR Officer   (Employee lifecycle – no payroll/settings)
     ↓
Payroll Officer (Salary & time-off approvals – no employee creation)
     ↓
Employee     (Self-service only – own data only)
```

### 1.2 Permission Matrix

| Feature / Action             | Admin | HR Officer | Payroll Officer | Employee |
|------------------------------|:-----:|:----------:|:---------------:|:--------:|
| Manage user roles/settings   | ✅    | ❌         | ❌              | ❌       |
| Create/edit employee profile | ✅    | ✅         | ❌              | ❌       |
| View all employees           | ✅    | ✅         | ✅ (read-only)  | ❌       |
| View own profile             | ✅    | ✅         | ✅              | ✅       |
| Edit own profile             | ✅    | ✅         | ✅              | ✅       |
| Mark attendance              | ❌    | ❌         | ❌              | ✅       |
| View all attendance          | ✅    | ✅         | ✅              | ❌       |
| View own attendance          | ✅    | ✅         | ✅              | ✅       |
| Apply for leave              | ❌    | ❌         | ❌              | ✅       |
| Approve/reject leave         | ✅    | ✅*        | ✅              | ❌       |
| Allocate leave               | ✅    | ✅         | ❌              | ❌       |
| View payroll data            | ✅    | ❌         | ✅              | ❌       |
| View own payslip             | ✅    | ❌**       | ✅              | ✅       |
| Generate payroll/payslip     | ✅    | ❌         | ✅              | ❌       |
| View reports                 | ✅    | ❌         | ✅              | ❌       |
| View own leave status        | ✅    | ✅         | ✅              | ✅       |

> \* HR Officer can manage leaves but NOT approve/reject time-off (payroll does this per spec).  
> \*\* HR Officer cannot view salary/payroll data — they only see attendance and leave.

---

## 2. Authentication Workflows

### 2.1 Admin Registration (First-Time Setup)

```
START
  │
  ▼
Admin visits /register
  │
  ├─► Fill form: Name, Email, Password, Company Name
  │         │
  │         ├─ [Validation] Email format valid? → NO → Show: "Invalid email format"
  │         ├─ [Validation] Password >= 8 chars? → NO → Show: "Password too short"
  │         ├─ [Validation] Company name empty? → YES → Show: "Company name required"
  │         └─ [Validation] Email already exists? → YES → Show: "Email already registered"
  │
  ▼
All validations pass
  │
  ▼
Create User record (role = Admin)
Create Company record
Link User → Company (company_id)
  │
  ▼
Send verification email (optional but recommended)
  │
  ▼
Redirect to Admin Dashboard
  │
END
```

**Error Scenarios:**
| Error | Message | Action |
|-------|---------|--------|
| Duplicate email | "This email is already registered. Please login." | Redirect to /login |
| DB failure | "Registration failed. Please try again." | Retry or contact support |
| Weak password | "Password must be at least 8 characters." | Inline form error |

---

### 2.2 Login Flow (All Roles)

```
START
  │
  ▼
User visits /login
  │
  ├─► Enter Email + Password
  │
  ▼
[Validation] Email exists in DB?
  │
  ├─ NO → "Invalid email or password" (do NOT reveal which is wrong)
  │
  ▼
[Validation] Password matches hash?
  │
  ├─ NO → "Invalid email or password"
  │        Track failed attempt count
  │        ├─ 5 failed attempts → Lock account for 15 mins
  │        └─ Show: "Too many failed attempts. Try again after 15 minutes."
  │
  ▼
Credentials valid → Fetch user role
  │
  ▼
Role-based redirect:
  ├─ Admin         → /admin/dashboard
  ├─ HR Officer    → /hr/dashboard
  ├─ Payroll Officer → /payroll/dashboard
  └─ Employee      → /employee/dashboard
  │
END
```

**Error Scenarios:**
| Error | Message | Action |
|-------|---------|--------|
| Account locked | "Account locked. Try after 15 minutes." | Show countdown timer |
| Inactive account | "Your account has been deactivated. Contact admin." | No access granted |
| Session expired | "Session expired. Please login again." | Redirect to /login |

---

### 2.3 Logout Flow

```
User clicks Logout
  │
  ▼
Invalidate session/token (server-side)
Clear client-side cookies/localStorage tokens
  │
  ▼
Redirect to /login
  │
  ▼
[Guard] If user tries to navigate back → redirect to /login (session invalid)
```

---

### 2.4 Password Reset Flow

```
User clicks "Forgot Password"
  │
  ▼
Enter registered email
  │
  ▼
[Check] Email exists in DB?
  ├─ NO → Show same message: "If email exists, a reset link has been sent."
  │        (Do not reveal whether email exists — security)
  │
  ▼
Generate reset token (expires in 30 mins)
Send reset email with link: /reset-password?token=<token>
  │
  ▼
User clicks link
  │
  ├─ [Check] Token valid & not expired?
  │     ├─ NO → "Reset link expired or invalid. Request a new one."
  │
  ▼
User enters new password + confirm password
  │
  ├─ [Validation] Passwords match? → NO → "Passwords do not match."
  ├─ [Validation] Password strength? → WEAK → "Password does not meet requirements."
  │
  ▼
Update password hash in DB
Invalidate all existing sessions for this user
  │
  ▼
Show: "Password reset successfully." → Redirect to /login
```

---

## 3. Admin Workflows

### 3.1 Create New User (HR / Payroll Officer)

```
START
  │
  ▼
Admin → Settings → User Management → "Add User"
  │
  ▼
Fill form:
  - Full Name (required)
  - Email (required, unique)
  - Role: [HR Officer | Payroll Officer]
  - Department (optional)
  - Password (auto-generated or manual)
  │
  ▼
[Validation]
  ├─ Email already in use? → "Email already registered."
  ├─ Name empty? → "Name is required."
  ├─ No role selected? → "Please assign a role."
  │
  ▼
Create User record
Send welcome email with credentials (if auto-generated password)
  │
  ▼
User appears in User Management list
Admin can: Edit Role | Deactivate | Delete
  │
END
```

**Business Rules:**
- Admin cannot delete their own account.
- Admin can have multiple users per role (e.g., 2 HR Officers).
- Deactivating a user does NOT delete their data — it locks login only.

---

### 3.2 Edit / Deactivate User

```
Admin → User Management → Select User → Edit
  │
  ▼
Editable fields: Name, Role, Department, Active Status
  │
  ├─ Change Role → Immediately updates permissions on next login
  ├─ Deactivate → User can no longer login, data preserved
  └─ Delete → Soft delete (mark as deleted, preserve audit logs)
  │
  ▼
Save → Success toast: "User updated successfully."
  │
  ▼
[Edge Case] Admin deactivates last HR Officer:
  └─ Warning: "This is the only HR Officer. Are you sure?"
     ├─ Confirm → Deactivate
     └─ Cancel → Abort
```

---

### 3.3 Admin View: Full Employee Directory

```
Admin → Employees tab
  │
  ▼
View all employees (all departments, all statuses)
  │
  ▼
Filters available:
  - Department
  - Status (Active / Inactive)
  - Join Date range
  │
  ▼
Click employee → View full profile
  │
  ▼
Admin can: Edit any field | Deactivate | Reassign Department
  │
  ▼
[Guard] Cannot delete employee with existing payroll records
  └─ Show: "Deactivate instead of deleting — payroll records exist."
```

---

### 3.4 Admin: Reports Access

```
Admin → Reports
  │
  ▼
Available reports:
  - Attendance Summary (by employee / month)
  - Leave Report (by employee / type / period)
  - Payroll Summary (monthly)
  - Employee Headcount
  │
  ▼
Select report type + filters (date range, department)
  │
  ▼
[Validation] Date range valid? (start <= end) → NO → "Invalid date range."
  │
  ▼
Generate report → Display on screen
Export options: PDF | CSV
  │
  ▼
[Error] No data in range → "No records found for selected filters."
```

---

## 4. HR Officer Workflows

### 4.1 Create Employee Profile

```
START
  │
  ▼
HR Officer → Employees → "Add Employee"
  │
  ▼
Step 1: Basic Info
  - Full Name (required)
  - Email (required, unique — becomes login email)
  - Phone Number
  - Date of Birth
  - Gender
  - Address
  │
  ▼
Step 2: Job Info
  - Department (required)
  - Designation / Job Title (required)
  - Date of Joining (required, cannot be future date)
  - Employment Type: [Full-time | Part-time | Contract]
  - Reporting Manager (select from existing employees/admins)
  │
  ▼
Step 3: Salary Info  ← (HR fills basic structure; payroll manages actual payroll)
  - Basic Wage/Salary (required)
  - PF applicable? (Yes/No)
  - Professional Tax applicable? (Yes/No)
  │
  ▼
[Validations]
  ├─ Email duplicate → "Email already in use by another user."
  ├─ Joining date in future → "Joining date cannot be in the future."
  ├─ Required fields empty → Highlight with red border + message.
  ├─ Invalid phone format → "Enter valid 10-digit phone number."
  │
  ▼
Save Employee
  ├─ System creates User account (role = Employee) with the email
  ├─ Auto-generate temporary password
  ├─ Send welcome email to employee with login credentials
  │
  ▼
Employee appears in directory with status: Active
  │
END
```

**Business Rules:**
- HR cannot set salary structures beyond basic wage — payroll officer handles deduction config.
- HR cannot view what payroll is generated for this employee.

---

### 4.2 Edit Employee Profile

```
HR Officer → Employees → Select Employee → Edit
  │
  ▼
Editable by HR:
  ✅ Name, Phone, Address, DOB
  ✅ Department, Designation, Reporting Manager
  ✅ Employment Type
  ✅ Basic Wage
  ❌ Cannot edit: Payroll records, leave balances (only allocate new)
  │
  ▼
Save → Audit log entry created: "Updated by HR Officer [name] on [datetime]"
  │
  ▼
[Error] Concurrent edit (two users editing same record):
  └─ Last save wins + Warning: "This record was also modified by [user]. Review changes."
```

---

### 4.3 Leave Allocation

```
HR Officer → Time Off → Allocations → "New Allocation"
  │
  ▼
Select:
  - Employee (dropdown)
  - Leave Type: [Paid Time Off | Sick Leave | Unpaid Leave]
  - Number of Days (required, positive integer)
  - Validity Period (optional — defaults to current year)
  │
  ▼
[Validation]
  ├─ Days <= 0 → "Days must be a positive number."
  ├─ No employee selected → "Please select an employee."
  ├─ Duplicate allocation for same type in same period?
  │     └─ Warning: "Allocation already exists. Add more days instead?"
  │           ├─ Yes → Increment existing
  │           └─ No → Abort
  │
  ▼
Save → Employee's leave balance updated
  │
  ▼
[Notification] Employee notified: "X days of [Leave Type] have been allocated to you."
```

---

### 4.4 Monitor Attendance (HR View)

```
HR Officer → Attendance
  │
  ▼
Default view: All employees, current month
  │
  ▼
Filters:
  - Employee name / ID
  - Date range
  - Status: [Present | Absent | On Leave | Half Day]
  │
  ▼
View attendance table:
  Columns: Employee | Date | Check-In | Check-Out | Duration | Status
  │
  ▼
[Feature] Export attendance as CSV
  │
  ▼
[Edge Case] Employee has no attendance record for a day:
  └─ Display as "Absent" (auto-marked by EOD system job)
```

---

## 5. Payroll Officer Workflows

### 5.1 Approve / Reject Time-Off Requests

```
START
  │
  ▼
Payroll Officer → Time Off → Pending Requests
  │
  ▼
View list: Employee | Leave Type | From | To | Days | Reason
  │
  ▼
Click request → View details
  │
  ▼
Check:
  ├─ Does employee have sufficient leave balance?
  │     └─ NO → Flag warning: "Insufficient balance (X days available, Y days requested)"
  ├─ Is period conflicting with payrun processing dates?
  │     └─ Warn: "Leave overlaps with payrun period."
  │
  ▼
Action:
  ├─ APPROVE → Leave status: Approved
  │             Deduct from leave balance
  │             Mark attendance as "On Leave" for those dates
  │             Notify employee: "Your leave request has been approved."
  │
  └─ REJECT → Prompt: Enter rejection reason (required)
               Leave status: Rejected
               Leave balance: No change
               Notify employee: "Your leave request was rejected. Reason: [reason]"
  │
END
```

**Error Scenarios:**
| Error | Handling |
|-------|---------|
| Employee balance = 0 | Show warning but allow approval (will be unpaid leave) |
| Request already approved by someone else | "This request has already been processed." |
| Dates in past | Show note: "This is a backdated leave request." |

---

### 5.2 Generate Payroll (Payrun)

```
START
  │
  ▼
Payroll Officer → Payroll → "New Payrun"
  │
  ▼
Select:
  - Pay Period Month (e.g., April 2026)
  - Department (All or specific)
  │
  ▼
[Guard] Payrun already exists for this period?
  └─ YES → "Payrun for April 2026 already exists. Edit existing or delete to regenerate."
  │
  ▼
System fetches for each employee:
  1. Basic Wage (from employee profile)
  2. Attendance data for period:
     - Working days in month
     - Days present
     - Approved leaves (paid → count as present)
     - Unapproved absences (unpaid)
  3. Calculate:
     - Gross Salary = (Basic Wage / Working Days) × (Days Present + Paid Leave Days)
     - PF Deduction = 12% of Basic Wage (if applicable)
     - Professional Tax = as per state slab (fixed or calculated)
     - Other Deductions (if any)
     - Net Pay = Gross – PF – Professional Tax – Other Deductions
  │
  ▼
[Validation]
  ├─ Employee has no attendance record → Warn: "No attendance for [Employee]. Mark as 0 days?"
  ├─ Basic wage = 0 or null → Error: "Wage not set for [Employee]. Cannot generate payslip."
  ├─ Negative net pay → Error: "Net pay is negative for [Employee]. Review deductions."
  │
  ▼
Preview payroll table:
  Columns: Employee | Gross | PF | Prof. Tax | Other Ded. | Net Pay
  │
  ▼
Payroll Officer reviews → "Confirm & Generate"
  │
  ▼
System generates individual payslips for each employee
Status: Payrun = "Generated" (not yet paid)
  │
  ▼
[Optional] Mark as Paid → Status: "Paid"
Employees can now view their payslip
  │
END
```

**Payroll Formula Reference:**
```
Working Days in Month    = Calendar days − Weekends − Holidays
Per Day Wage             = Basic Wage ÷ Working Days in Month
Days to Pay             = Days Present + Paid Leave Days
Gross Salary            = Per Day Wage × Days to Pay
PF (Employee)           = 12% × Basic Wage  [if PF enabled]
PF (Employer)           = 12% × Basic Wage  [shown in payslip, not deducted]
Professional Tax        = As per state slab (e.g., ≤ ₹10k → ₹0, >₹10k → ₹200/month)
Net Pay                 = Gross Salary − PF (Employee) − Professional Tax − Other Deductions
```

---

### 5.3 Edit Payrun (Before Marking as Paid)

```
Payroll Officer → Payroll → Select Payrun (Status: Generated)
  │
  ▼
Click "Edit"
  │
  ▼
Editable fields per employee:
  - Bonus / Incentive (add)
  - Additional Deductions (add reason)
  - Override days present (with reason required)
  │
  ▼
[Guard] Payrun status = "Paid"?
  └─ YES → Edit button disabled. Show: "Paid payruns cannot be edited."
  │
  ▼
Recalculate → Save → Payslips regenerated
  │
  ▼
Audit log: "Payrun modified by [Officer] on [datetime]. Reason: [reason]"
```

---

### 5.4 Generate Leave Report

```
Payroll Officer → Reports → Leave Report
  │
  ▼
Filters: Month | Year | Department | Leave Type
  │
  ▼
[Validation] Date range valid? → NO → "Invalid date range."
  │
  ▼
Report shows:
  - Employee | Leave Type | Days Taken | Days Remaining | Status
  │
  ▼
Export: PDF | CSV
  │
  ▼
[Empty state] No leaves in period → "No leave records found for selected filters."
```

---

## 6. Employee Workflows

### 6.1 Employee First Login & Profile Setup

```
Employee receives welcome email with credentials
  │
  ▼
Employee visits /login → enters credentials
  │
  ▼
[First login flag set?]
  └─ YES → Redirect to /change-password
              Force password change before proceeding
              [Validation] New password ≠ temp password
              Save → Redirect to /employee/dashboard
  │
  ▼
[Prompt] Complete your profile
  - Profile photo (optional)
  - Emergency contact
  - Bank account details (for payslip reference)
  │
  ▼
Dashboard visible → employee can now use system
```

---

### 6.2 Mark Attendance

```
START
  │
  ▼
Employee → Attendance → "Check In"
  │
  ▼
[Guard] Already checked in today?
  └─ YES → Show Check-Out button only (no duplicate check-in)
  │
  ▼
[Guard] Already checked out today?
  └─ YES → Show: "Attendance already marked for today."
            (Allow admin/HR to override if needed)
  │
  ▼
[Guard] Is today a holiday? (System holiday calendar)
  └─ YES → Warn: "Today is a public holiday. Mark attendance?"
              ├─ Confirm → Mark (overtime scenario)
              └─ Cancel → Do nothing
  │
  ▼
[Guard] Is employee on approved leave today?
  └─ YES → "You are on approved leave today. Cannot mark attendance."
  │
  ▼
Record: Employee ID | Date | Check-In Time | Location (optional)
  │
  ▼
Employee → "Check Out"
  │
  ▼
[Guard] Check-in exists for today?
  └─ NO → "Cannot check out without checking in."
  │
  ▼
Record: Check-Out Time
Calculate: Duration = Check-Out − Check-In
  │
  ▼
Status auto-assigned:
  ├─ Duration >= 4h && < 8h → "Half Day"
  ├─ Duration >= 8h → "Present"
  └─ No check-in by EOD → Automated job marks as "Absent"
  │
END
```

**Business Rules:**
- One check-in and one check-out per day maximum.
- Attendance can only be marked for the current day (no backdating by employee).
- HR/Admin can edit attendance records if there's an error.

---

### 6.3 Apply for Leave

```
START
  │
  ▼
Employee → Time Off → "New Request"
  │
  ▼
Fill form:
  - Leave Type: [Paid Time Off | Sick Leave | Unpaid Leave] (from allocated types)
  - From Date (required)
  - To Date (required)
  - Reason (required)
  │
  ▼
[Validation]
  ├─ From date < today? → "Cannot apply for leave in the past." (unless backdated grace period)
  ├─ From date > To date? → "End date must be after start date."
  ├─ Requested days > Available balance?
  │     ├─ Leave Type = Unpaid → Allowed, warn: "This will be unpaid leave."
  │     └─ Leave Type = Paid → "Insufficient balance. You have X days remaining."
  ├─ Overlapping leave request exists?
  │     └─ "You have an existing leave request for overlapping dates."
  ├─ Attendance already marked on those dates?
  │     └─ "You have attendance records on some of these dates. Contact HR."
  ├─ Reason empty? → "Please provide a reason for your leave."
  │
  ▼
Submit → Status: "Pending"
  │
  ▼
[Notification] Payroll Officer notified of new leave request
  │
  ▼
Employee can see request in "My Leave Requests" with status:
  [Pending | Approved | Rejected]
  │
  ▼
[Notification] Employee notified on status change (Approved/Rejected)
  │
END
```

---

### 6.4 View Payslip

```
Employee → Payroll → My Payslips
  │
  ▼
[Guard] Payrun status for that period = "Paid"?
  └─ NO → Payslip not visible. Show: "Payslip not yet processed for this period."
  │
  ▼
Select month
  │
  ▼
Payslip displays:
  ┌────────────────────────────────────┐
  │  EmPay Payslip                     │
  │  Employee: [Name]    ID: [ID]      │
  │  Department: [Dept]  Month: [Mon]  │
  ├────────────────────────────────────┤
  │  EARNINGS              AMOUNT      │
  │  Basic Wage          ₹XX,XXX       │
  │  Days Worked: X / Y                │
  │  Gross Salary        ₹XX,XXX       │
  ├────────────────────────────────────┤
  │  DEDUCTIONS            AMOUNT      │
  │  PF (Employee 12%)   ₹X,XXX        │
  │  Professional Tax    ₹XXX          │
  │  Other Deductions    ₹XXX          │
  │  Total Deductions    ₹X,XXX        │
  ├────────────────────────────────────┤
  │  NET PAY             ₹XX,XXX       │
  └────────────────────────────────────┘
  │
  ▼
Download as PDF button available
  │
  ▼
[Error] Payslip PDF generation fails:
  └─ "PDF generation failed. Please try again or contact admin."
```

---

### 6.5 View Attendance History

```
Employee → Attendance → My Attendance
  │
  ▼
Default: Current month calendar view
  │
  ▼
Each day color-coded:
  🟢 Present | 🔴 Absent | 🟡 Half Day | 🔵 On Leave | ⚪ Holiday / Weekend
  │
  ▼
Click on day → See: Check-In Time | Check-Out Time | Duration | Status
  │
  ▼
Switch to List View for detailed table
Filter by: Month | Year | Status
  │
  ▼
Summary cards at top:
  - Total Days: X | Present: X | Absent: X | On Leave: X | Half Days: X
```

---

### 6.6 View Own Profile

```
Employee → My Profile (top-right avatar)
  │
  ▼
View:
  - Personal info (Name, Email, Phone, DOB, Address)
  - Job info (Department, Designation, Joining Date, Manager)
  - Emergency Contact
  - Profile photo
  │
  ▼
Editable by Employee:
  ✅ Phone, Address, Emergency Contact, Profile Photo
  ❌ Cannot edit: Email, Department, Designation, Wage
  │
  ▼
Save → "Profile updated successfully."
  │
  ▼
[Error] Phone format invalid → "Enter valid 10-digit phone number."
[Error] File size > 2MB → "Image too large. Max size: 2MB."
[Error] Invalid file type → "Only JPG, PNG formats are supported."
```

---

## 7. Attendance Module Workflows

### 7.1 Automated Absence Marking (Background Job)

```
Scheduled Job: Runs at 11:59 PM daily
  │
  ▼
For each active employee:
  │
  ├─ Has check-in record for today? → YES → Skip (handled)
  │
  ├─ Is today a weekend? → YES → Skip
  │
  ├─ Is today a public holiday? → YES → Skip
  │
  ├─ Is employee on approved leave today? → YES → Mark as "On Leave" if not marked
  │
  └─ None of the above → Auto-mark as "Absent"
  │
  ▼
Log: "Auto-attendance job completed for [date]. X employees marked absent."
```

---

### 7.2 HR / Admin Override Attendance

```
HR/Admin → Attendance → Select Employee → Select Date
  │
  ▼
Edit options:
  - Change status (Present / Absent / Half Day / On Leave)
  - Edit check-in / check-out times
  │
  ▼
[Validation]
  ├─ Date in future? → "Cannot modify future attendance."
  ├─ Payrun for this month already marked as Paid?
  │     └─ Warning: "Attendance for a paid payrun period. Changes won't affect processed payroll."
  │
  ▼
Save → Audit log: "Attendance modified by [user] on [datetime]"
       Reason field required for override
```

---

## 8. Leave / Time-Off Module Workflows

### 8.1 Leave Balance Logic

```
Leave Balance Calculation:
  ─────────────────────────────────────────────
  Total Allocated Days  (set by HR at start of year / joining)
  − Days Used           (approved leaves taken)
  = Remaining Balance   (shown to employee and payroll officer)
  ─────────────────────────────────────────────

Rules:
  - Approved leave → balance decremented
  - Rejected / Cancelled leave → balance restored
  - Unpaid leave → does NOT decrement paid leave balance
  - Leave can be approved even with 0 balance (unpaid scenario)
```

### 8.2 Leave Cancellation

```
Employee → Time Off → My Requests → Select Approved Leave → "Cancel"
  │
  ▼
[Guard] Leave dates already started or passed?
  └─ YES → "Cannot cancel leave that has already started. Contact HR."
  │
  ▼
[Guard] Payrun for that period already processed?
  └─ YES → "Payroll has been processed for this period. Cancellation requires admin approval."
  │
  ▼
Status → "Cancelled"
Leave balance restored
Attendance records for those dates: reverted to "Absent"
  │
  ▼
[Notification] Payroll Officer notified of cancellation
```

---

### 8.3 Leave Types Reference

| Leave Type | Default Days | Paid? | Carry Forward? |
|------------|:-----------:|:-----:|:--------------:|
| Paid Time Off | 18/year | Yes | Yes (up to 5 days) |
| Sick Leave | 6/year | Yes | No |
| Unpaid Leave | Unlimited | No | N/A |

> Configurable by Admin in Settings.

---

## 9. Payroll Module Workflows

### 9.1 Payroll Lifecycle States

```
  [Draft] → [Generated] → [Paid]
     ↑                       │
     └───────── Cannot edit after "Paid" ──────┘

  State transitions:
  - New Payrun created → "Generated" (after preview & confirm)
  - Payroll Officer reviews → can edit while "Generated"
  - Mark as Paid → "Paid" (locked)
```

### 9.2 Payslip Generation Rules

```
Payslip is auto-created for each employee when payrun is confirmed.

Payslip includes:
  ┌─ Identification ───────────────────────────────┐
  │  Company Name, Logo                            │
  │  Employee Name, ID, Department, Designation    │
  │  Pay Period (Month & Year)                     │
  └────────────────────────────────────────────────┘
  ┌─ Earnings ─────────────────────────────────────┐
  │  Basic Wage (monthly)                          │
  │  Working Days in Period                        │
  │  Days Worked (present + paid leaves)           │
  │  Gross Salary = (Basic ÷ Working Days) × Days  │
  └────────────────────────────────────────────────┘
  ┌─ Deductions ───────────────────────────────────┐
  │  Employee PF (12% of basic, if applicable)     │
  │  Professional Tax (state slab)                 │
  │  Other deductions (if manually added)          │
  └────────────────────────────────────────────────┘
  ┌─ Summary ──────────────────────────────────────┐
  │  Total Deductions                              │
  │  Net Pay = Gross − Total Deductions            │
  └────────────────────────────────────────────────┘
  ┌─ Info Block ───────────────────────────────────┐
  │  Employer PF contribution (12% of basic)       │
  │  This is informational, not deducted           │
  └────────────────────────────────────────────────┘
```

### 9.3 Professional Tax Slabs (Maharashtra – default)

| Monthly Gross Salary | PT Deduction |
|----------------------|:------------:|
| Up to ₹7,500         | ₹0           |
| ₹7,501 – ₹10,000    | ₹175         |
| Above ₹10,000        | ₹200         |

> Admin can configure slabs in Settings based on the applicable state.

---

## 10. Dashboard & Analytics Workflows

### 10.1 Admin Dashboard

```
On load → fetch:
  - Total Employees (active)
  - Employees Present Today (%)
  - Pending Leave Requests count
  - Current Month Payroll Status (Generated / Not Generated / Paid)
  │
  ▼
Charts:
  - Attendance Rate: Last 30 days (line chart)
  - Department-wise Headcount (bar/pie chart)
  - Leave Type Distribution this month (donut chart)
  - Monthly Payroll Amount (last 6 months bar chart)
  │
  ▼
Quick Actions:
  - Add Employee
  - View Pending Leaves
  - Generate Payroll
  │
  ▼
[Error] Data fetch fails → "Unable to load dashboard. Retry."
[Empty State] No employees yet → "Get started: Add your first employee."
```

---

### 10.2 HR Officer Dashboard

```
On load → fetch:
  - Total employees managed
  - Attendance today: Present / Absent / On Leave counts
  - Pending leave allocations to review
  │
  ▼
Charts:
  - Today's Attendance Summary (donut: Present/Absent/Leave)
  - Monthly Attendance Trend (line chart)
  - Department-wise attendance (bar chart)
  │
  ▼
Quick Actions:
  - Add Employee
  - Allocate Leave
  - View Attendance
```

---

### 10.3 Payroll Officer Dashboard

```
On load → fetch:
  - Pending time-off requests count
  - Payrun status this month
  - Total payroll amount (if generated)
  │
  ▼
Charts:
  - Leave request status breakdown (Pending/Approved/Rejected)
  - Monthly payroll trend (last 6 months)
  │
  ▼
Quick Actions:
  - Review Leave Requests
  - Generate Payroll
  - View Reports
```

---

### 10.4 Employee Dashboard

```
On load → fetch:
  - Attendance status today (Checked In / Not Marked)
  - Leave balance (per type)
  - Latest payslip summary
  │
  ▼
Display:
  - Check In / Check Out button (contextual)
  - Leave balance cards (Paid / Sick / Unpaid)
  - Upcoming approved leaves
  - Recent attendance: last 7 days mini-calendar
  │
  ▼
Quick Actions:
  - Mark Attendance
  - Apply for Leave
  - View Payslip
```

---

## 11. Cross-Module Data Dependencies

```
┌─────────────────────────────────────────────────────────────┐
│                    DATA FLOW DIAGRAM                        │
│                                                             │
│  Employee Profile                                           │
│       │                                                     │
│       ├──► Attendance Module                                │
│       │         │                                           │
│       │         ├──► Days Present Count                     │
│       │         └──► Absent / Half Day flags                │
│       │                   │                                 │
│       ├──► Leave Module    │                                 │
│       │         │          │                                 │
│       │         └──► Approved Leave Days ──────────────┐    │
│       │                                                │    │
│       └──► Payroll Module ◄────────────────────────────┘    │
│                 │                                           │
│                 ├──► Reads: Basic Wage                      │
│                 ├──► Reads: Days Present + Paid Leaves      │
│                 ├──► Calculates: Gross, Deductions, Net     │
│                 └──► Outputs: Payslip (Employee can view)   │
│                                                             │
└─────────────────────────────────────────────────────────────┘

Critical Dependency Rules:
1. Payroll CANNOT be generated without employee profile (wage).
2. Payroll CANNOT be generated without attendance data for the period.
3. Leave approval MUST happen BEFORE payroll generation for the period.
4. Attendance for a day with approved leave = "On Leave" (counts as paid).
5. Attendance for a day with rejected/pending leave = counts as "Absent" if not marked.
```

---

## 12. Global Error Handling Matrix

| Scenario | Module | User Sees | System Action |
|----------|--------|-----------|---------------|
| Network timeout | Any | "Connection lost. Please try again." | Retry with exponential backoff |
| Unauthorized access attempt | Any | "You don't have permission to view this." | Log access attempt, redirect to dashboard |
| Session expired | Any | "Session expired. Please login again." | Clear tokens, redirect to /login |
| Duplicate record | Create forms | "Record already exists." | Highlight duplicate field |
| Required field empty | All forms | Red border + field-specific message | Block submission |
| Date range invalid | Reports, Leave | "End date must be after start date." | Block submission |
| File upload too large | Profile | "File exceeds 2MB limit." | Block upload |
| Invalid file type | Profile | "Only JPG/PNG allowed." | Block upload |
| DB connection failure | Any | "Service temporarily unavailable." | Log error, retry |
| Payslip PDF failure | Payroll | "PDF generation failed. Try again." | Log error, allow retry |
| Negative net pay | Payroll generation | "Net pay is negative for [Employee]." | Block payrun, show offending employee |
| Payrun already exists | Payroll | "Payrun already generated for this period." | Prompt edit or delete |
| Leave overlap | Leave apply | "Overlapping leave request exists." | Block submission |
| Concurrent edits | Employee edit | "Record modified by another user." | Show diff, ask to review |
| Account locked | Login | "Too many failed attempts. Try after 15 mins." | Lock account, set timer |
| Wage not set | Payroll | "Wage missing for [Employee]. Set before payrun." | Skip employee or block payrun |

---

## 13. Edge Cases & Business Rules

### 13.1 Attendance Edge Cases

| Situation | Rule |
|-----------|------|
| Employee checks in but never checks out | Status = "Present (Incomplete)" until EOD job runs; then HR prompted to resolve |
| Check-out before check-in (time mismatch) | Validation error: "Check-out time cannot be before check-in time" |
| Employee works on holiday | Marked as "Present (Holiday)" — overtime flag for payroll |
| New joiner mid-month | Working days calculated from joining date, not month start |
| Employee terminated mid-month | Payroll processed only up to last working day |

---

### 13.2 Leave Edge Cases

| Situation | Rule |
|-----------|------|
| Leave spans across months | Split at month boundary — affects two payruns |
| Leave falls on weekend/holiday | System auto-excludes those days from count |
| Employee has 0 leave balance | Can apply for Unpaid Leave; Paid/Sick blocked |
| Manager also on leave during approval period | Backup approver logic or escalate to Admin |
| Leave request submitted for past dates | Allowed with warning; requires reason; HR discretion |
| Payroll already paid and leave found unapplied | Cannot retroactively adjust — log discrepancy |

---

### 13.3 Payroll Edge Cases

| Situation | Rule |
|-----------|------|
| New employee in first month | Prorate: pay only for days from joining date |
| Employee resigned mid-month | Final payslip covers days until last working date |
| 0 days present, 0 approved leaves | Net pay = ₹0 (but payslip still generated with note) |
| Basic wage changed mid-month | Use wage at payrun generation date; audit log required |
| PF threshold exceeded | PF calculated on ₹15,000 cap (per Indian PF rules) |
| Bonus added | Added to gross before net calculation (no PF on bonus typically) |

---

### 13.4 Role Change Edge Cases

| Situation | Rule |
|-----------|------|
| HR promoted to Admin mid-cycle | New permissions apply immediately on next login |
| Employee becomes HR | Existing employee records preserved; new HR permissions added |
| Admin demotes user role | Warn: "This will remove access immediately." |
| Last Admin deactivated | System blocks: "At least one Admin must remain active." |

---

### 13.5 Data Integrity Rules

```
MUST enforce at database level (not just application level):

1. Employee email MUST be unique across entire system.
2. Payrun MUST be unique per (company + period month + year).
3. Leave request dates MUST NOT overlap for same employee.
4. Attendance MUST be unique per (employee + date).
5. Leave balance MUST NOT go below 0 (enforce at service layer).
6. Role must be one of: [admin, hr_officer, payroll_officer, employee].
7. All monetary values MUST be stored in paise (integer) — not floats.
8. Soft-delete ONLY for employees (never hard-delete to preserve payroll integrity).
```

---

## Quick Reference: Navigation Map

```
/login                          → All roles
/register                       → Admin only (first-time)
/admin/dashboard                → Admin
/admin/employees                → Admin + HR Officer
/admin/users                    → Admin only
/admin/settings                 → Admin only
/admin/reports                  → Admin + Payroll Officer
/hr/dashboard                   → HR Officer
/hr/employees                   → HR Officer
/hr/attendance                  → HR Officer
/hr/leaves/allocations          → HR Officer
/payroll/dashboard              → Payroll Officer
/payroll/payrun                 → Payroll Officer + Admin
/payroll/payslips               → Payroll Officer + Admin
/payroll/leaves                 → Payroll Officer + Admin
/employee/dashboard             → Employee
/employee/attendance            → Employee
/employee/leaves                → Employee
/employee/payslips              → Employee
/profile                        → All roles
```

---




*Document Version: 1.0 | System: EmPay HRMS | Last Updated: May 2026*



what i want to modify in this plan is 
when hr / admin adding employee ,the login id should be generated automatically by the sysytem in the format LOI (first two letters of the employee's The Login ID should be automatically generated by the system in the following format:

Example: OIJOD020220001

Explanation:

OI→ Odoo India (Company Name)

JODO→ First two letters of the employee's first name and last name

2022 Year of Joining 

0001 Serial Number of Joining for that Year

and mailed to the employyes email , and the content in the mail is , login id and password which is also  autogenerated . by system.

-checkin checkout should be done in only one click from the right of top , which changes to green when checked in , when aeroplane symbol when emp on leave , and red when the person is on uninformed leave ,beside it there should be a profile dropdown which has options my profile and logut , 

-payroll officer should not haave the access to approve or reject a leave application of emp , only hr and admin can do it , 

-hr should also have a option of performance management of employee 

-hr setion instead of manually filling details of , if hr uploads resume of emp , system should extract the details needed ,

-on the landining page we should have a demovideo option where we can shouw how our website works 

-there should be policies mentioned whereever needed (for eg comp policy , attendance policy , etc )

-income tax computation in emp section

give me 10 commits and manually ill do git comit you stop genarting code , ask me if i commited then again continue
