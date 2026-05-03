import React, { useEffect, useMemo, useState } from 'react';
import api from '../../api';
import DashboardLayout from '../../components/DashboardLayout';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import PayrunWarnings from '../../components/PayrunWarnings';
import { computePayrunWarnings } from '../../utils/salary';
import { PayslipCard } from '../Employee/Payslips';

interface PayrunRow {
  id: number;
  name: string;
  loginId: string;
  department: string;
  basicWage: number;
  daysPresent: number;
  paidLeaveDays: number;
  workingDays: number;
  gross: number;
  pf: number;
  professionalTax: number;
  netPay: number;
  pfApplicable: boolean;
  ptApplicable: boolean;
  status: 'ready' | 'no_wage';
}

const computeProfessionalTax = (gross: number) => {
  if (gross <= 7500) return 0;
  if (gross <= 10000) return 175;
  return 200;
};

const PayrollPayrun: React.FC = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [period, setPeriod] = useState(() => new Date().toISOString().slice(0, 7));
  const [generated, setGenerated] = useState<{ period: string; rows: PayrunRow[]; status: 'generated' | 'paid' } | null>(null);
  const [viewSlip, setViewSlip] = useState<PayrunRow | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const [y, m] = period.split('-').map(Number);
    const startDate = new Date(y, m - 1, 1).toISOString().slice(0, 10);
    const endDate = new Date(y, m, 0).toISOString().slice(0, 10);

    try {
      const [emp, att] = await Promise.all([
        api.get('/employees'),
        api.get('/attendance/history', { params: { startDate, endDate } }),
      ]);
      setEmployees(emp.data.employees || []);
      setAttendance(att.data.attendance || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [period]);

  const previewRows: PayrunRow[] = useMemo(() => {
    const [y, m] = period.split('-').map(Number);
    const lastDay = new Date(y, m, 0).getDate();

    let workingDays = 0;
    for (let d = 1; d <= lastDay; d++) {
      const dow = new Date(y, m - 1, d).getDay();
      if (dow !== 0 && dow !== 6) workingDays++;
    }

    return employees.filter((e) => e.status === 'active').map((e) => {
      const empAtt = attendance.filter((a) => a.employee_id === e.id);
      const daysPresent = empAtt.filter((a) => a.status === 'present').length;
      const paidLeaveDays = empAtt.filter((a) => a.status === 'on_leave').length;
      const halfDays = empAtt.filter((a) => a.status === 'half_day').length;
      const effectiveDays = daysPresent + paidLeaveDays + halfDays * 0.5;
      const basicWage = Number(e.basic_wage || 0);
      const perDay = workingDays > 0 ? basicWage / workingDays : 0;
      const gross = Math.max(0, perDay * effectiveDays);
      const pf = e.pf_applicable && basicWage > 0 ? Math.round(Math.min(basicWage, 15000) * 0.12) : 0;
      const professionalTax = e.professional_tax_applicable ? computeProfessionalTax(gross) : 0;
      const netPay = Math.max(0, Math.round(gross - pf - professionalTax));
      return {
        id: e.id,
        name: `${e.first_name} ${e.last_name}`,
        loginId: e.login_id,
        department: e.department,
        basicWage,
        daysPresent,
        paidLeaveDays,
        workingDays,
        gross: Math.round(gross),
        pf,
        professionalTax,
        netPay,
        pfApplicable: !!e.pf_applicable,
        ptApplicable: !!e.professional_tax_applicable,
        status: basicWage > 0 ? 'ready' : 'no_wage',
      };
    });
  }, [employees, attendance, period]);

  const totals = previewRows.reduce(
    (acc, r) => {
      acc.gross += r.gross;
      acc.pf += r.pf;
      acc.pt += r.professionalTax;
      acc.net += r.netPay;
      return acc;
    },
    { gross: 0, pf: 0, pt: 0, net: 0 },
  );

  const generate = () => {
    setBusy(true);
    setTimeout(() => {
      setGenerated({ period, rows: previewRows.filter((r) => r.status === 'ready'), status: 'generated' });
      setBusy(false);
    }, 600);
  };

  const markPaid = () => {
    if (!generated) return;
    if (!window.confirm('Mark this payrun as paid? This locks edits and makes payslips visible to employees.')) return;
    setGenerated({ ...generated, status: 'paid' });
  };

  const periodLabel = new Date(period + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const noWageRows = previewRows.filter((r) => r.status === 'no_wage');

  /* Build payslip card props from a PayrunRow */
  const buildSlipProps = (r: PayrunRow) => {
    const [y, m] = period.split('-').map(Number);
    const totalDays = new Date(y, m, 0).getDate();
    const basicWage = r.basicWage;
    const hra = Math.round(basicWage * 0.40);
    const standardAllowance = Math.round(basicWage * 0.10);
    const lta = Math.round(basicWage * 0.05);
    const fixedAllowance = Math.round(basicWage * 0.10);
    const pfEmployee = r.pf;
    const pfEmployer = pfEmployee;
    const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const nextMonth = m + 1 > 12 ? 1 : m + 1;
    const nextYear = m + 1 > 12 ? y + 1 : y;
    return {
      companyName: 'EmPay HRMS',
      monthLabel: monthNames[m - 1].toLowerCase(),
      year: y,
      empName: r.name,
      empCode: r.loginId || `EMP${String(r.id).padStart(4,'0')}`,
      department: r.department || '—',
      location: '—',
      dateOfJoining: '—',
      bankAccount: '—',
      payPeriod: `1/${m}/${y} to ${totalDays}/${m}/${y}`,
      payDate: `3/${nextMonth}/${nextYear}`,
      workedDays: r.daysPresent + r.paidLeaveDays,
      totalDays,
      basicSalary: basicWage,
      hra,
      standardAllowance,
      performanceBonus: 0,
      lta,
      fixedAllowance,
      grossEarnings: r.gross,
      pfEmployee,
      pfEmployer,
      professionalTax: r.professionalTax,
      tdsDeduction: 0,
      totalDeductions: pfEmployee + pfEmployer + r.professionalTax,
      netPay: r.netPay,
    };
  };

  return (
    <DashboardLayout title="Payroll Run">
      <div className="page-header">
        <div>
          <h1>Payroll Run</h1>
          <p className="page-subtitle">Compute monthly salaries, generate payslips for {periodLabel}</p>
        </div>
        <div className="page-actions">
          <input
            type="month"
            value={period}
            onChange={(e) => { setPeriod(e.target.value); setGenerated(null); }}
            style={{ padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 8, fontFamily: 'inherit', fontSize: 14 }}
          />
          {!generated && (
            <button className="btn-primary" onClick={generate} disabled={busy || previewRows.length === 0}>
              {busy ? 'Computing…' : 'Generate Payroll'}
            </button>
          )}
          {generated && generated.status === 'generated' && (
            <button className="btn-success" onClick={markPaid}>Mark as Paid</button>
          )}
        </div>
      </div>

      <PayrunWarnings warnings={computePayrunWarnings(employees)} />

      <div className="policy-notice">
        ⓘ <strong>Formula:</strong> Gross = (Basic ÷ working days) × (days present + paid leaves). PF = 12% of basic (capped at ₹15,000).
        PT = state slab (≤₹7,500: ₹0; ≤₹10,000: ₹175; else ₹200). Net = Gross − PF − PT.
      </div>

      {noWageRows.length > 0 && (
        <div className="alert alert-warning">
          ⚠ {noWageRows.length} employee(s) have no basic wage set: {noWageRows.map((r) => r.name).join(', ')}.
          Set their wage before generating payroll.
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Employees</span>
            <div className="stat-card-icon">◔</div>
          </div>
          <div className="stat-card-value">{previewRows.length}</div>
          <div className="stat-card-change">{previewRows.filter((r) => r.status === 'ready').length} ready</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Total Gross</span>
            <div className="stat-card-icon green">◐</div>
          </div>
          <div className="stat-card-value">₹{totals.gross.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Total Deductions</span>
            <div className="stat-card-icon amber">◑</div>
          </div>
          <div className="stat-card-value">₹{(totals.pf + totals.pt).toLocaleString()}</div>
          <div className="stat-card-change">PF ₹{totals.pf.toLocaleString()} · PT ₹{totals.pt.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Total Net Pay</span>
            <div className="stat-card-icon blue">◓</div>
          </div>
          <div className="stat-card-value">₹{totals.net.toLocaleString()}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            {generated ? `Generated Payrun · ${periodLabel}` : `Preview · ${periodLabel}`}
          </h3>
          {generated && <StatusBadge status={generated.status} />}
        </div>

        {loading ? (
          <div className="loading">Loading employees & attendance…</div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Login ID</th>
                  <th>Days Present</th>
                  <th>Paid Leave</th>
                  <th>Basic</th>
                  <th>Gross</th>
                  <th>PF</th>
                  <th>PT</th>
                  <th>Net Pay</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {(generated ? generated.rows : previewRows).map((r) => (
                  <tr key={r.id}>
                    <td>
                      <strong>{r.name}</strong>
                      <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{r.department}</div>
                    </td>
                    <td><span className="login-id-highlight">{r.loginId || '—'}</span></td>
                    <td>{r.daysPresent}/{r.workingDays}</td>
                    <td>{r.paidLeaveDays}</td>
                    <td>₹{r.basicWage.toLocaleString()}</td>
                    <td><strong>₹{r.gross.toLocaleString()}</strong></td>
                    <td>{r.pf > 0 ? `₹${r.pf.toLocaleString()}` : '—'}</td>
                    <td>{r.professionalTax > 0 ? `₹${r.professionalTax.toLocaleString()}` : '—'}</td>
                    <td><strong style={{ color: 'var(--accent)' }}>₹{r.netPay.toLocaleString()}</strong></td>
                    <td className="table-actions">
                      <button className="btn-secondary btn-sm" onClick={() => setViewSlip(r)}>Payslip</button>
                    </td>
                  </tr>
                ))}
                {previewRows.length === 0 && (
                  <tr><td colSpan={10} className="empty-state">No active employees to compute.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {viewSlip && (
        <Modal
          open
          title={`Payslip — ${periodLabel}`}
          onClose={() => setViewSlip(null)}
          size="lg"
          footer={<button className="btn-primary" onClick={() => window.print()}>Print / Save PDF</button>}
        >
          <PayslipCard {...buildSlipProps(viewSlip)} />
        </Modal>
      )}
    </DashboardLayout>
  );
};

export default PayrollPayrun;
