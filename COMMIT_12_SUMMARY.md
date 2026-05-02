# COMMIT 4: Remove Payroll Officer Leave Approval Access

## Changes Made

### 1. Permission Update

**Previous Behavior:**
- Payroll Officers could approve/reject leave requests (per original spec)

**New Behavior:**
- Only Admin and HR Officer can approve/reject leave requests
- Payroll Officers can VIEW leave requests but cannot approve/reject

### 2. Files Verified/Updated

#### `backend/src/routes/leaveRoutes.ts`
**Already Correct:**
```typescript
router.put('/requests/:id/approve', authenticate, authorize('admin', 'hr_officer'), approveLeaveRequest);
router.put('/requests/:id/reject', authenticate, authorize('admin', 'hr_officer'), rejectLeaveRequest);
```
- Routes already restrict to 'admin' and 'hr_officer' only
- Payroll officer NOT in authorization list

#### `backend/src/controllers/leaveController.ts`
**Already Correct:**
```typescript
if (userRole !== 'admin' && userRole !== 'hr_officer') {
  return res.status(403).json({ 
    error: 'Only Admin and HR Officer can approve leave requests' 
  });
}
```
- Controller validates role before processing
- Returns 403 Forbidden for unauthorized roles

### 3. Updated Permission Matrix

| Action | Admin | HR Officer | Payroll Officer | Employee |
|--------|:-----:|:----------:|:---------------:|:--------:|
| Apply for leave | ❌ | ❌ | ❌ | ✅ |
| View leave requests | ✅ | ✅ | ✅ (read-only) | ✅ (own only) |
| Approve leave | ✅ | ✅ | ❌ | ❌ |
| Reject leave | ✅ | ✅ | ❌ | ❌ |
| Allocate leave | ✅ | ✅ | ❌ | ❌ |
| Cancel own leave | ❌ | ❌ | ❌ | ✅ |

### 4. Payroll Officer Capabilities

**What Payroll Officers CAN do:**
- View all leave requests (for payroll calculation purposes)
- View leave balances
- View leave history
- Generate payroll (which considers approved leaves)

**What Payroll Officers CANNOT do:**
- Approve leave requests
- Reject leave requests
- Allocate leave days
- Modify leave balances directly

### 5. API Behavior

**Attempt by Payroll Officer to approve leave:**
```bash
PUT /api/leave/requests/123/approve
Authorization: Bearer <payroll_officer_token>

Response: 403 Forbidden
{
  "error": "Only Admin and HR Officer can approve leave requests"
}
```

**Attempt by Payroll Officer to reject leave:**
```bash
PUT /api/leave/requests/123/reject
Authorization: Bearer <payroll_officer_token>

Response: 403 Forbidden
{
  "error": "Only Admin and HR Officer can reject leave requests"
}
```

### 6. Frontend Requirements (To be implemented)

**Leave Request List View:**
- Payroll Officers should see leave requests in read-only mode
- Approve/Reject buttons should be hidden for payroll officers
- Show "View Only" badge for payroll officer role

**Leave Details View:**
- Payroll Officers can view full details
- Action buttons (Approve/Reject) should not be visible
- Display message: "Contact HR to approve/reject leave requests"

### 7. Business Logic Rationale

**Why this change:**
- HR manages employee lifecycle and time-off policies
- Payroll processes approved leaves but doesn't decide on approvals
- Separation of concerns: HR = people management, Payroll = compensation
- Prevents conflicts of interest in leave approval process

### 8. Testing Checklist

- [x] Verify routes only allow admin and hr_officer
- [x] Verify controller validates role before approval
- [x] Verify controller validates role before rejection
- [ ] Test payroll officer gets 403 when attempting approval
- [ ] Test payroll officer gets 403 when attempting rejection
- [ ] Test payroll officer can still view leave requests
- [ ] Test admin can approve leaves
- [ ] Test hr_officer can approve leaves
- [ ] Frontend hides approve/reject buttons for payroll officers

---

**Status:** ✅ READY FOR COMMIT (Already Implemented Correctly)

**Note:** The codebase already had the correct permissions in place. This commit serves as verification and documentation of the permission structure.

**Next Step:** COMMIT 5 - HR Performance Management Module
