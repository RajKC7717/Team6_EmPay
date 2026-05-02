# Commit 7: Policy Management System

## Changes Made

### 1. Policy Controller (`backend/src/controllers/policyController.ts`)
- `createPolicy` - Create company policies (Admin only)
- `getPolicies` - List all policies with filters (category, active status)
- `getPolicyById` - Get single policy details
- `updatePolicy` - Update policy content/status (Admin only)
- `deletePolicy` - Remove policies (Admin only)
- `getPolicyCategories` - Get list of unique policy categories

### 2. Policy Routes (`backend/src/routes/policyRoutes.ts`)
- `POST /api/policies` - Create policy (Admin only)
- `GET /api/policies` - List policies (all roles can view)
- `GET /api/policies/categories` - Get categories
- `GET /api/policies/:id` - Get policy details
- `PUT /api/policies/:id` - Update policy (Admin only)
- `DELETE /api/policies/:id` - Delete policy (Admin only)

### 3. Server Integration
Added policy routes to Express app

## Features

✅ **Policy Categories**
- Attendance Policy
- Compensation Policy
- Leave Policy
- Code of Conduct
- Data Privacy
- Security Policy
- Custom categories

✅ **Policy Management**
- Rich text content support
- Optional file attachments (PDF/DOC)
- Active/Inactive status toggle
- Category-based organization

✅ **Access Control**
- Admin: Full CRUD access
- All other roles: Read-only access

## API Examples

### Create Policy
```bash
POST /api/policies
Authorization: Bearer <admin_token>

{
  "title": "Attendance Policy 2026",
  "category": "Attendance Policy",
  "content": "Employees must check in by 9:30 AM...",
  "fileUrl": "https://storage.example.com/policies/attendance-2026.pdf"
}
```

### Get Policies by Category
```bash
GET /api/policies?category=Leave%20Policy&isActive=true
Authorization: Bearer <token>
```

### Update Policy
```bash
PUT /api/policies/5
Authorization: Bearer <admin_token>

{
  "content": "Updated policy content...",
  "isActive": true
}
```

## Permission Matrix

| Action | Admin | HR Officer | Payroll Officer | Employee |
|--------|:-----:|:----------:|:---------------:|:--------:|
| Create policy | ✅ | ❌ | ❌ | ❌ |
| View policies | ✅ | ✅ | ✅ | ✅ |
| Update policy | ✅ | ❌ | ❌ | ❌ |
| Delete policy | ✅ | ❌ | ❌ | ❌ |

## Next Steps (Commit 8)
Add income tax computation module for employees with tax slab calculation and declaration forms.
