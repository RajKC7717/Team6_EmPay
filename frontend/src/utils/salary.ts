// Component-based salary structure computation matching the v2.0 spec.
// Components are deterministic given a wage:
//   Basic              = 50% of wage
//   HRA                = 50% of basic
//   Standard Allowance = 4167 fixed
//   Performance Bonus  = 8.33% of wage
//   LTA                = 8.333% of wage
//   Fixed Allowance    = wage - (sum of all above)  ← residual

export interface SalaryComponents {
  wage: number;
  basic: number;
  hra: number;
  standardAllowance: number;
  performanceBonus: number;
  lta: number;
  fixedAllowance: number;
  gross: number;
}

export const computeSalaryComponents = (wage: number): SalaryComponents => {
  const w = Math.max(0, Number(wage) || 0);
  const basic = Math.round(w * 0.5);
  const hra = Math.round(basic * 0.5);
  const standardAllowance = Math.min(4167, Math.max(0, w - basic - hra));
  const performanceBonus = Math.round(w * 0.0833);
  const lta = Math.round(w * 0.08333);
  const sumKnown = basic + hra + standardAllowance + performanceBonus + lta;
  const fixedAllowance = Math.max(0, Math.round(w - sumKnown));
  const gross = basic + hra + standardAllowance + performanceBonus + lta + fixedAllowance;
  return { wage: w, basic, hra, standardAllowance, performanceBonus, lta, fixedAllowance, gross };
};

// Old regime slabs FY 2026-27
export const OLD_REGIME_SLABS = [
  { min: 0,        max: 250_000,  rate: 0 },
  { min: 250_000,  max: 500_000,  rate: 0.05 },
  { min: 500_000,  max: 1_000_000, rate: 0.20 },
  { min: 1_000_000, max: Infinity, rate: 0.30 },
];

// New regime slabs FY 2026-27 (default)
export const NEW_REGIME_SLABS = [
  { min: 0,         max: 300_000,   rate: 0 },
  { min: 300_000,   max: 700_000,   rate: 0.05 },
  { min: 700_000,   max: 1_000_000, rate: 0.10 },
  { min: 1_000_000, max: 1_200_000, rate: 0.15 },
  { min: 1_200_000, max: 1_500_000, rate: 0.20 },
  { min: 1_500_000, max: Infinity,  rate: 0.30 },
];

const CESS_RATE = 0.04;

export interface TDSResult {
  regime: 'old' | 'new';
  annualGross: number;
  standardDeduction: number;
  exemptions: number;
  taxableIncome: number;
  tax: number;
  cess: number;
  totalTax: number;
  monthlyTDS: number;
  effectiveRate: number;
}

export const computeTDS = (
  annualGross: number,
  regime: 'old' | 'new' = 'new',
  exemptions = 0,
): TDSResult => {
  const standardDeduction = regime === 'new' ? 75_000 : 50_000;
  const taxable = Math.max(0, annualGross - standardDeduction - (regime === 'old' ? exemptions : 0));
  const slabs = regime === 'old' ? OLD_REGIME_SLABS : NEW_REGIME_SLABS;
  let remaining = taxable;
  let tax = 0;
  for (const s of slabs) {
    if (remaining <= 0) break;
    const range = s.max - s.min;
    const inSlab = Math.min(remaining, range);
    tax += inSlab * s.rate;
    remaining -= inSlab;
  }
  const cess = tax * CESS_RATE;
  const totalTax = Math.round(tax + cess);
  const monthlyTDS = Math.round(totalTax / 12);
  const effectiveRate = annualGross > 0 ? +((totalTax / annualGross) * 100).toFixed(2) : 0;
  return {
    regime,
    annualGross,
    standardDeduction,
    exemptions,
    taxableIncome: taxable,
    tax: Math.round(tax),
    cess: Math.round(cess),
    totalTax,
    monthlyTDS,
    effectiveRate,
  };
};

// Professional Tax slab (Maharashtra default)
export const computeProfessionalTax = (gross: number): number => {
  if (gross <= 7_500) return 0;
  if (gross <= 10_000) return 175;
  return 200;
};

// PF computation (12% of basic, capped at ₹15,000 basic)
export const computePF = (basic: number): number => {
  return Math.round(Math.min(basic, 15_000) * 0.12);
};

export interface PayrunWarning {
  severity: 'high' | 'medium';
  type: string;
  message: string;
  employees?: { id: number; name: string }[];
  blocksPayrun: boolean;
}

export const computePayrunWarnings = (employees: any[]): PayrunWarning[] => {
  const active = employees.filter((e) => e.status === 'active');
  const noBank = active.filter((e) => !e.bank_account_number || !e.bank_ifsc_code);
  const noWage = active.filter((e) => !e.basic_wage || Number(e.basic_wage) <= 0);
  const noManager = active.filter((e) => !e.reporting_manager_id);

  const warnings: PayrunWarning[] = [];

  if (noWage.length > 0) {
    warnings.push({
      severity: 'high',
      type: 'no_wage',
      message: `${noWage.length} employee(s) without basic wage set`,
      employees: noWage.map((e) => ({ id: e.id, name: `${e.first_name} ${e.last_name}` })),
      blocksPayrun: true,
    });
  }
  if (noBank.length > 0) {
    warnings.push({
      severity: 'high',
      type: 'no_bank',
      message: `${noBank.length} employee(s) without bank account details`,
      employees: noBank.map((e) => ({ id: e.id, name: `${e.first_name} ${e.last_name}` })),
      blocksPayrun: true,
    });
  }
  if (noManager.length > 0) {
    warnings.push({
      severity: 'medium',
      type: 'no_manager',
      message: `${noManager.length} employee(s) without a reporting manager`,
      employees: noManager.map((e) => ({ id: e.id, name: `${e.first_name} ${e.last_name}` })),
      blocksPayrun: false,
    });
  }
  return warnings;
};
