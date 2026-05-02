# Commit 8: Income Tax Computation Module

## Changes Made

### 1. Tax Controller (`backend/src/controllers/taxController.ts`)
- `calculateIncomeTax` - Core tax calculation engine with 2026 Indian tax slabs
- `getIncomeTaxCalculation` - Get employee's tax calculation with deductions
- `submitTaxDeclaration` - Submit tax-saving investment declarations
- `getTaxDeclarations` - List declarations (employees see own, HR/Payroll see all)
- `approveTaxDeclaration` - Approve declarations (Admin/HR/Payroll)
- `rejectTaxDeclaration` - Reject declarations with reason

### 2. Tax Routes (`backend/src/routes/taxRoutes.ts`)
- `GET /api/tax/calculate` - Calculate income tax
- `POST /api/tax/declarations` - Submit declaration (Employee)
- `GET /api/tax/declarations` - List declarations
- `PUT /api/tax/declarations/:id/approve` - Approve (Admin/HR/Payroll)
- `PUT /api/tax/declarations/:id/reject` - Reject (Admin/HR/Payroll)

### 3. Database Schema (`backend/src/database/schema_tax.sql`)
- `tax_declarations` table for storing employee tax-saving declarations

### 4. Server Integration
Added tax routes to Express app

## Tax Calculation Features

✅ **Indian Tax Slabs 2026**
- ₹0 - ₹3L: 0%
- ₹3L - ₹7L: 5%
- ₹7L - ₹10L: 10%
- ₹10L - ₹12L: 15%
- ₹12L - ₹15L: 20%
- Above ₹15L: 30%
- Health & Education Cess: 4%

✅ **Deductions Supported**
- Standard Deduction: ₹50,000
- HRA (House Rent Allowance)
- Section 80C: Up to ₹1,50,000 (PPF, ELSS, LIC, etc.)
- Section 80D: Up to ₹25,000 (Health Insurance)
- Home Loan Interest: Up to ₹2,00,000
- Other deductions

✅ **Tax Declaration Workflow**
1. Employee submits declarations with proof documents
2. HR/Payroll reviews and approves/rejects
3. Approved declarations reduce taxable income
4. System calculates monthly TDS deduction

## API Examples

### Calculate Tax
```bash
GET /api/tax/calculate
Authorization: Bearer <employee_token>
```

**Response:**
```json
{
  "annualIncome": 600000,
  "standardDeduction": 50000,
  "otherDeductions": 150000,
  "taxableIncome": 400000,
  "taxBeforeCess": 5000,
  "cess": 200,
  "totalTax": 5200,
  "monthlyTaxDeduction": 433,
  "effectiveTaxRate": "0.87",
  "declarations": {
    "hra": 0,
    "section80C": 150000,
    "section80D": 0,
    "homeLoan": 0,
    "other": 0
  }
}
```

### Submit Declaration
```bash
POST /api/tax/declarations
Authorization: Bearer <employee_token>

{
  "declarationType": "section_80c",
  "amount": 150000,
  "proofDocument": "https://storage.example.com/ppf-statement.pdf",
  "description": "PPF investment for FY 2026-27"
}
```

### Approve Declaration
```bash
PUT /api/tax/declarations/5/approve
Authorization: Bearer <hr_token>
```

## Permission Matrix

| Action | Admin | HR Officer | Payroll Officer | Employee |
|--------|:-----:|:----------:|:---------------:|:--------:|
| View tax calculation | ✅ | ✅ | ✅ | ✅ (own) |
| Submit declaration | ❌ | ❌ | ❌ | ✅ |
| View declarations | ✅ (all) | ✅ (all) | ✅ (all) | ✅ (own) |
| Approve declaration | ✅ | ✅ | ✅ | ❌ |
| Reject declaration | ✅ | ✅ | ✅ | ❌ |

## Next Steps (Commit 9)
Build landing page with demo video section and navigation to login/register.
