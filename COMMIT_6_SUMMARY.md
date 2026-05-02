# Commit 6: Performance Management Module for HR

## Changes Made

### 1. Performance Controller (`backend/src/controllers/performanceController.ts`)
Created comprehensive performance management system for HR:

**Performance Reviews:**
- `createPerformanceReview` - Create reviews with ratings (1-5), strengths, areas for improvement, goals
- `getPerformanceReviews` - List reviews (HR sees all, employees see own)
- `updatePerformanceReview` - Update review details and status (draft/submitted/completed)
- `deletePerformanceReview` - Remove reviews (Admin/HR only)

**Goal Management:**
- `createGoal` - Set goals for employees with target dates
- `getGoals` - List goals (HR sees all, employees see own)
- `updateGoal` - Update goal progress and status (employees can update progress, HR can edit all)
- `deleteGoal` - Remove goals (Admin/HR only)

### 2. Performance Routes (`backend/src/routes/performanceRoutes.ts`)
- `POST /api/performance/reviews` - Create review (Admin/HR only)
- `GET /api/performance/reviews` - List reviews (all roles, filtered by permission)
- `PUT /api/performance/reviews/:id` - Update review (Admin/HR only)
- `DELETE /api/performance/reviews/:id` - Delete review (Admin/HR only)
- `POST /api/performance/goals` - Create goal (Admin/HR only)
- `GET /api/performance/goals` - List goals (all roles, filtered by permission)
- `PUT /api/performance/goals/:id` - Update goal (employees can update progress)
- `DELETE /api/performance/goals/:id` - Delete goal (Admin/HR only)

### 3. Server Integration (`backend/src/server.ts`)
Added performance routes to Express app

## Features Implemented

✅ **Performance Reviews**
- Rating scale: 1-5
- Structured feedback: strengths, areas for improvement, goals
- Review periods with start/end dates
- Status tracking: draft → submitted → completed
- HR can create/edit/delete reviews
- Employees can view their own reviews

✅ **Goal Management**
- Set SMART goals for employees
- Track progress (0-100%)
- Status: not_started → in_progress → completed → cancelled
- Target dates for accountability
- Employees can update their own goal progress
- HR can create/edit/delete goals

✅ **Role-Based Access**
- Admin & HR Officer: Full CRUD access to all reviews and goals
- Payroll Officer: No access to performance data
- Employee: View own reviews and goals, update goal progress only

## API Examples

### Create Performance Review (HR)
```bash
POST /api/performance/reviews
Authorization: Bearer <hr_token>

{
  "employeeId": 5,
  "reviewPeriodStart": "2026-01-01",
  "reviewPeriodEnd": "2026-03-31",
  "rating": 4,
  "strengths": "Excellent technical skills, proactive problem solver",
  "areasForImprovement": "Could improve communication with stakeholders",
  "goals": "Lead a major project, mentor junior developers",
  "comments": "Strong performer with leadership potential"
}
```

### Create Goal (HR)
```bash
POST /api/performance/goals
Authorization: Bearer <hr_token>

{
  "employeeId": 5,
  "title": "Complete AWS Certification",
  "description": "Obtain AWS Solutions Architect certification",
  "targetDate": "2026-12-31"
}
```

### Update Goal Progress (Employee)
```bash
PUT /api/performance/goals/3
Authorization: Bearer <employee_token>

{
  "progress": 60,
  "status": "in_progress"
}
```

### Get Employee Reviews (Employee)
```bash
GET /api/performance/reviews
Authorization: Bearer <employee_token>
```
Returns only the employee's own reviews.

### Get All Reviews (HR)
```bash
GET /api/performance/reviews?employeeId=5&status=completed
Authorization: Bearer <hr_token>
```
Returns filtered reviews for specific employee.

## Database Schema (Already Exists)
Tables used:
- `performance_reviews` - stores review data
- `goals` - stores employee goals

## Permission Matrix

| Action | Admin | HR Officer | Payroll Officer | Employee |
|--------|:-----:|:----------:|:---------------:|:--------:|
| Create review | ✅ | ✅ | ❌ | ❌ |
| View reviews | ✅ (all) | ✅ (all) | ❌ | ✅ (own) |
| Update review | ✅ | ✅ | ❌ | ❌ |
| Delete review | ✅ | ✅ | ❌ | ❌ |
| Create goal | ✅ | ✅ | ❌ | ❌ |
| View goals | ✅ (all) | ✅ (all) | ❌ | ✅ (own) |
| Update goal | ✅ | ✅ | ❌ | ✅ (progress only) |
| Delete goal | ✅ | ✅ | ❌ | ❌ |

## Testing Checklist
- [ ] HR can create performance reviews
- [ ] HR can view all reviews
- [ ] Employee can view only own reviews
- [ ] Payroll Officer cannot access performance data
- [ ] HR can create goals for employees
- [ ] Employee can update goal progress
- [ ] Employee cannot edit goal title/description
- [ ] HR can delete reviews and goals
- [ ] Review status transitions work (draft → submitted → completed)
- [ ] Goal status transitions work correctly

## Next Steps (Commit 7)
Note: Resume upload endpoint already exists from Commit 4. Will verify and document it properly in next commit.
