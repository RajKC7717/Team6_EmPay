import React, { useEffect, useState } from 'react';
import api, { getUser } from '../../api';
import DashboardLayout from '../../components/DashboardLayout';

/* ── Number to words (Indian system) ────────────────── */
const ones = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten',
  'Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
const tens = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];

function numToWords(n: number): string {
  if (n === 0) return 'Zero';
  n = Math.round(n);
  if (n < 0) return 'Minus ' + numToWords(-n);
  let str = '';
  if (n >= 10000000) { str += numToWords(Math.floor(n / 10000000)) + ' Crore '; n %= 10000000; }
  if (n >= 100000) { str += numToWords(Math.floor(n / 100000)) + ' Lakh '; n %= 100000; }
  if (n >= 1000) { str += numToWords(Math.floor(n / 1000)) + ' Thousand '; n %= 1000; }
  if (n >= 100) { str += ones[Math.floor(n / 100)] + ' Hundred '; n %= 100; }
  if (n >= 20) { str += tens[Math.floor(n / 10)] + ' '; n %= 10; }
  if (n > 0) str += ones[n] + ' ';
  return str.trim();
}

const fmt = (n: number) => `₹ ${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const EmployeePayslips: React.FC = () => {
  const user = getUser();
  const [employee, setEmployee] = useState<any>(null);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const empRes = await api.get(`/employees/${user?.id}`).catch(() => ({ data: { employee: null } }));
        setEmployee(empRes.data.employee || empRes.data);
        const start = new Date(year, month, 1);
        const end = new Date(year, month + 1, 0);
        const attRes = await api.get('/attendance/history', {
          params: { startDate: start.toISOString().slice(0, 10), endDate: end.toISOString().slice(0, 10) }
        }).catch(() => ({ data: { attendance: [] } }));
        setAttendance(attRes.data.attendance || []);
      } finally { setLoading(false); }
    };
    load();
  }, [month, year, user?.id]);

  const basicWage = Number(employee?.basic_wage || 0);
  const totalDays = new Date(year, month + 1, 0).getDate();
  const presentDays = attendance.filter((a) => a.status === 'present' || a.status === 'on_leave').length;
  const halfDays = attendance.filter((a) => a.status === 'half_day').length;
  const workedDays = presentDays + (halfDays * 0.5);

  const hra = Math.round(basicWage * 0.40);
  const standardAllowance = Math.round(basicWage * 0.10);
  const performanceBonus = 0;
  const lta = Math.round(basicWage * 0.05);
  const fixedAllowance = Math.round(basicWage * 0.10);
  const grossEarnings = basicWage + hra + standardAllowance + performanceBonus + lta + fixedAllowance;
  const proratedGross = totalDays > 0 ? Math.round((grossEarnings / totalDays) * workedDays) : 0;

  const pfEmployee = employee?.pf_applicable !== false ? Math.round(Math.min(basicWage, 15000) * 0.12) : 0;
  const pfEmployer = pfEmployee;
  const ptDeduction = employee?.professional_tax_applicable !== false ? (proratedGross > 10000 ? 200 : proratedGross > 7500 ? 175 : 0) : 0;
  const tdsDeduction = 0;
  const totalDeductions = pfEmployee + pfEmployer + ptDeduction + tdsDeduction;
  const netPay = proratedGross - totalDeductions;

  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const payPeriodStart = `1/${month + 1}/${year}`;
  const payPeriodEnd = `${totalDays}/${month + 1}/${year}`;
  const nextMonth = month + 2 > 12 ? 1 : month + 2;
  const nextYear = month + 2 > 12 ? year + 1 : year;
  const payDate = `3/${nextMonth}/${nextYear}`;

  return (
    <DashboardLayout title="Payslips">
      <div className="page-header">
        <div><h1>My Payslips</h1><p className="page-subtitle">View your monthly salary breakdown</p></div>
      </div>

      <div className="filter-bar" style={{ marginBottom: 20 }}>
        <select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
          {monthNames.map((m, i) => <option key={i} value={i}>{m}</option>)}
        </select>
        <select value={year} onChange={(e) => setYear(Number(e.target.value))}>
          {[2024,2025,2026,2027].map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {loading ? <div className="loading">Loading…</div> : !employee ? (
        <div className="empty"><div className="empty-icon">◓</div><div className="empty-title">Profile not found</div></div>
      ) : (
        <>
          <PayslipCard
            companyName="EmPay HRMS"
            monthLabel={monthNames[month].toLowerCase()}
            year={year}
            empName={`${employee.first_name} ${employee.last_name}`}
            empCode={employee.login_id || `EMP${String(employee.id).padStart(4,'0')}`}
            department={employee.department || '—'}
            location={employee.address?.split(',').pop()?.trim() || '—'}
            dateOfJoining={employee.date_of_joining ? new Date(employee.date_of_joining).toLocaleDateString('en-GB') : '—'}
            bankAccount={employee.bank_account_number || '—'}
            payPeriod={`${payPeriodStart} to ${payPeriodEnd}`}
            payDate={payDate}
            workedDays={workedDays}
            totalDays={totalDays}
            basicSalary={basicWage}
            hra={hra}
            standardAllowance={standardAllowance}
            performanceBonus={performanceBonus}
            lta={lta}
            fixedAllowance={fixedAllowance}
            grossEarnings={proratedGross}
            pfEmployee={pfEmployee}
            pfEmployer={pfEmployer}
            professionalTax={ptDeduction}
            tdsDeduction={tdsDeduction}
            totalDeductions={totalDeductions}
            netPay={netPay}
          />
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <button className="btn-outline" onClick={() => window.print()}>↓ Download / Print Payslip</button>
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

/* ═══════════════════════════════════════════════════════
   Shared Payslip Card — Light theme matching reference
   ═══════════════════════════════════════════════════════ */
export interface PayslipCardProps {
  companyName: string;
  monthLabel: string;
  year: number;
  empName: string;
  empCode: string;
  department: string;
  location: string;
  dateOfJoining: string;
  bankAccount: string;
  payPeriod: string;
  payDate: string;
  workedDays: number;
  totalDays: number;
  basicSalary: number;
  hra: number;
  standardAllowance: number;
  performanceBonus: number;
  lta: number;
  fixedAllowance: number;
  grossEarnings: number;
  pfEmployee: number;
  pfEmployer: number;
  professionalTax: number;
  tdsDeduction: number;
  totalDeductions: number;
  netPay: number;
}

export const PayslipCard: React.FC<PayslipCardProps> = (p) => {
  const S = payslipStyles;
  return (
    <div style={S.slip} className="fade-up">
      {/* Logo */}
      <div style={S.logo}>{p.companyName}</div>

      {/* Title */}
      <div style={S.title}>Salary slip for month of {p.monthLabel} {p.year}</div>

      {/* Employee Info */}
      <div style={S.infoBox}>
        <div>
          <div style={S.infoRow}><span style={S.infoLabel}>Employee name</span><span style={S.infoValue}>: {p.empName}</span></div>
          <div style={S.infoRow}><span style={S.infoLabel}>Employee Code</span><span style={S.infoValue}>: {p.empCode}</span></div>
          <div style={S.infoRow}><span style={S.infoLabel}>Department</span><span style={S.infoValue}>: {p.department}</span></div>
          <div style={S.infoRow}><span style={S.infoLabel}>Location</span><span style={S.infoValue}>: {p.location}</span></div>
          <div style={S.infoRow}><span style={S.infoLabel}>Date of joining</span><span style={S.infoValue}>: {p.dateOfJoining}</span></div>
        </div>
        <div>
          <div style={S.infoRow}><span style={S.infoLabel}>PAN</span><span style={S.infoValue}>: —</span></div>
          <div style={S.infoRow}><span style={S.infoLabel}>UAN</span><span style={S.infoValue}>: —</span></div>
          <div style={S.infoRow}><span style={S.infoLabel}>Bank A/c No.</span><span style={S.infoValue}>: {p.bankAccount}</span></div>
          <div style={S.infoRow}><span style={S.infoLabel}>Pay period</span><span style={S.infoValue}>: {p.payPeriod}</span></div>
          <div style={S.infoRow}><span style={S.infoLabel}>Pay date</span><span style={S.infoValue}>: {p.payDate}</span></div>
        </div>
      </div>

      {/* Worked Days */}
      <div style={S.workedBox}>
        <div style={S.sectionHeader}><span>Worked Days</span><span>Number of Days</span></div>
        <div style={S.tableRow}><span style={S.tableLabel}>Attendance</span><span style={S.tableValue}>{p.workedDays} Days</span></div>
        <div style={{ ...S.tableRow, background: '#faf5ff' }}><span style={S.tableLabel}>Total</span><span style={S.tableValue}>{p.totalDays} Days</span></div>
      </div>

      {/* Earnings & Deductions */}
      <div style={S.earningsGrid}>
        <div style={{ borderRight: '1px solid #e2d6ee' }}>
          <div style={S.colHeader}><span>Earnings</span><span>Amounts</span></div>
          <div style={S.colRow}><span style={S.tableLabel}>Basic Salary</span><span style={S.tableValue}>{fmt(p.basicSalary)}</span></div>
          <div style={S.colRow}><span style={S.tableLabel}>House Rent Allowance</span><span style={S.tableValue}>{fmt(p.hra)}</span></div>
          <div style={S.colRow}><span style={S.tableLabel}>Standard Allowance</span><span style={S.tableValue}>{fmt(p.standardAllowance)}</span></div>
          <div style={S.colRow}><span style={S.tableLabel}>Performance Bonus</span><span style={S.tableValue}>{fmt(p.performanceBonus)}</span></div>
          <div style={S.colRow}><span style={S.tableLabel}>Leave Travel Allowance</span><span style={S.tableValue}>{fmt(p.lta)}</span></div>
          <div style={S.colRow}><span style={S.tableLabel}>Fixed Allowance</span><span style={S.tableValue}>{fmt(p.fixedAllowance)}</span></div>
          <div style={{ ...S.colRow, fontWeight: 700, borderTop: '2px solid #e2d6ee' }}><span style={{ color: '#6b3a7d' }}>Gross</span><span style={{ color: '#2d5f8a' }}>{fmt(p.grossEarnings)}</span></div>
        </div>
        <div>
          <div style={S.colHeader}><span>Deductions</span><span>Amounts</span></div>
          <div style={S.colRow}><span style={S.tableLabel}>PF Employee</span><span style={S.tableValue}>- {fmt(p.pfEmployee)}</span></div>
          <div style={S.colRow}><span style={S.tableLabel}>PF Employer</span><span style={S.tableValue}>- {fmt(p.pfEmployer)}</span></div>
          <div style={S.colRow}><span style={S.tableLabel}>Professional Tax</span><span style={S.tableValue}>- {fmt(p.professionalTax)}</span></div>
          <div style={S.colRow}><span style={S.tableLabel}>TDS Deduction</span><span style={S.tableValue}>- {fmt(p.tdsDeduction)}</span></div>
          <div style={{ ...S.colRow, fontWeight: 700, borderTop: '2px solid #e2d6ee' }}><span style={{ color: '#6b3a7d' }}>Total Deductions</span><span style={{ color: '#c0392b' }}>- {fmt(p.totalDeductions)}</span></div>
        </div>
      </div>

      {/* Net Payable */}
      <div style={S.footer}>
        <div>
          <div style={S.footerTitle}>Total Net Payable</div>
          <div style={S.footerSub}>(Gross Earning − Total Deductions)</div>
        </div>
        <div style={{ textAlign: 'right' as const }}>
          <div style={S.footerAmtVal}>{fmt(p.netPay)}</div>
          <div style={S.footerWords}>[{numToWords(p.netPay)} Rupees] only</div>
        </div>
      </div>
    </div>
  );
};

/* ── Light-themed styles ── */
const payslipStyles: Record<string, React.CSSProperties> = {
  slip: { background: '#ffffff', borderRadius: 14, border: '1.5px solid #e2d6ee', overflow: 'hidden', fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#333', maxWidth: 900, margin: '0 auto', boxShadow: '0 4px 24px rgba(107,58,125,0.08)' },
  logo: { padding: '18px 24px', borderBottom: '1px solid #f0e6f6', fontSize: 15, fontWeight: 700, color: '#6b3a7d', letterSpacing: '-0.01em' },
  title: { padding: '18px 24px 14px', fontSize: 19, fontWeight: 700, color: '#6b3a7d', fontStyle: 'italic', borderBottom: '1px solid #f0e6f6' },
  infoBox: { display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '18px 22px', gap: 6, border: '1px solid #e2d6ee', margin: '16px 24px', borderRadius: 10, background: '#fdfbfe' },
  infoRow: { display: 'flex', gap: 8, fontSize: 13, padding: '3px 0' },
  infoLabel: { fontWeight: 600, color: '#6b3a7d', fontStyle: 'italic', minWidth: 135 },
  infoValue: { color: '#2d5f8a' },
  workedBox: { margin: '16px 24px', border: '1px solid #e2d6ee', borderRadius: 10, overflow: 'hidden' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', padding: '10px 18px', background: 'linear-gradient(135deg, #d4a0e8, #c084d8)', color: '#fff', fontWeight: 700, fontSize: 13.5 },
  tableRow: { display: 'flex', justifyContent: 'space-between', padding: '8px 18px', fontSize: 13, borderBottom: '1px solid #f0e6f6' },
  tableLabel: { fontStyle: 'italic', color: '#6b3a7d', fontSize: 13 },
  tableValue: { color: '#2d5f8a', fontWeight: 500, fontSize: 13 },
  earningsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', margin: '16px 24px', border: '1px solid #e2d6ee', borderRadius: 10, overflow: 'hidden' },
  colHeader: { display: 'flex', justifyContent: 'space-between', padding: '10px 16px', background: 'linear-gradient(135deg, #d4a0e8, #c084d8)', color: '#fff', fontWeight: 700, fontSize: 13 },
  colRow: { display: 'flex', justifyContent: 'space-between', padding: '8px 16px', fontSize: 13, borderBottom: '1px solid #f5eef8' },
  footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', background: 'linear-gradient(135deg, #1abc9c, #16a085)', margin: '18px 24px 24px', borderRadius: 10, color: 'white' },
  footerTitle: { fontSize: 17, fontWeight: 700 },
  footerSub: { fontSize: 11, opacity: 0.85 },
  footerAmtVal: { fontSize: 22, fontWeight: 700 },
  footerWords: { fontSize: 10.5, opacity: 0.85, fontStyle: 'italic' },
};

export default EmployeePayslips;
