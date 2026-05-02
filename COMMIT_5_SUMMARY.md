# Commit 5: Remove Leave Approval Access from Payroll Officer

## Changes Made

### 1. Leave Controller (`backend/src/controllers/leaveController.ts`)
Created comprehensive leave management with **strict role-based access**:

**Employee Actions:**
- `createLeaveRequest` - Apply for leave with validation (no overlaps, no future dates)
- `cancelLeaveRequest` - Cancel own pending/approved leaves (before start date)
- `getLeaveBalance` - View own leave balances

**Admin & HR Officer ONLY:**
- `approveLeaveRequest` - Approve leave, deduct balance, mark attendance as "on_leave"
- `rejectLeaveRequest` - Reject leave with mandatory reason
- `allocateLeave` - Allocate/add leave days to employees

**Payroll Officer:**
- Can view leave requests (read-only)
- Can view leave balances (read-only)
- **CANNOT approve or reject leaves** ❌

### 2. Leave Routes (`backend/src/routes/leaveRoutes.ts`)
- `POST /api/leave/requests` - Create leave request (Employee, Admin, HR, Payroll)
- `GET /api/leave/requests` - List leave requests (all roles, filtered by permission)
- `PUT /api/leave/requests/:id/approve` - **Admin & HR ONLY**
- `PUT /api/leave/requests/:id/reject` - **Admin & HR ONLY**
- `PUT /api/leave/requests/:id/cancel` - Employee only
- `GET /api/leave/balance` - View leave balance (all roles)
- `POST /api/leave/allocate` - Allocate leaves (Admin & HR only)

### 3. Server Integration (`backend/src/server.ts`)
Added leave routes to Express app

## Key Features

✅ **Role-Based Leave Approval**
- Only Admin and HR Officer can approve/reject
- Payroll Officer explicitly blocked with 403 error
- Error message: "Only Admin and HR Officer can approve leave requests"

✅ **Leave Request Validation**
- No overlapping leave requests
- No backdated applications (unless grace period)
- Cannot apply if attendance already marked
- End date must be after start date

✅ **Leave Balance Management**
- Auto-deduct on approval
- Restore balance on cancellation
- Track used/remaining days per leave type

✅ **Attendance Integration**
- Auto-mark attendance as "on_leave" for approved dates
- Remove attendance records on cancellation
- Prevent attendance marking on approved leave days

✅ **Leave Cancellation Rules**
- Can only cancel before leave start date
- Cannot cancel leaves that have started
- Restores leave balance if approved leave is cancelled

## API Examples

### Apply for Leave (Employee)
```bash
POST /api/leave/requests
Authorization: Bearer <employee_token>

{
  "leaveTypeId": 1,
  "fromDate": "2026-05-10",
  "toDate": "2026-05-12",
  "reason": "Family function"
}
```

### Approve Leave (Admin/HR Only)
```bash
PUT /api/leave/requests/5/approve
Authorization: Bearer <admin_or_hr_token>
```

**Response:** Leave approved, balance deducted, attendance marked

### Approve Leave (Payroll Officer) ❌
```bash
PUT /api/leave/requests/5/approve
Authorization: Bearer <payroll_token>
```

**Response:**
```json
{
  "error": "Only Admin and HR Officer can approve leave requests"
}
```

### Reject Leave (Admin/HR Only)
```bash
PUT /api/leave/requests/5/reject
Authorization: Bearer <admin_or_hr_token>

{
  "rejectionReason": "Insufficient staffing during this period"
}
```

## Permission Matrix Update

| Action | Admin | HR Officer | Payroll Officer | Employee |
|--------|:-----:|:----------:|:---------------:|:--------:|
| Apply for leave | ❌ | ❌ | ❌ | ✅ |
| View leave requests | ✅ (all) | ✅ (all) | ✅ (all) | ✅ (own) |
| **Approve leave** | ✅ | ✅ | ❌ | ❌ |
| **Reject leave** | ✅ | ✅ | ❌ | ❌ |
| Cancel own leave | ✅ | ✅ | ✅ | ✅ |
| Allocate leaves | ✅ | ✅ | ❌ | ❌ |
| View leave balance | ✅ | ✅ | ✅ | ✅ (own) |

## Testing Checklist
- [ ] Employee can apply for leave
- [ ] Admin can approve/reject leave
- [ ] HR Officer can approve/reject leave
- [ ] **Payroll Officer gets 403 error when trying to approve/reject**
- [ ] Leave balance deducted on approval
- [ ] Attendance marked as "on_leave" for approved dates
- [ ] Employee can cancel future leaves
- [ ] Cannot cancel leaves that have started
- [ ] Overlapping leave validation works
- [ ] Rejection requires reason

## Next Steps (Commit 6)
Add performance management routes and controllers for HR to track employee performance reviews and goals.
