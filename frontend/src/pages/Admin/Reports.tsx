import React, { useEffect, useState, useRef } from 'react';
import api from '../../api';
import DashboardLayout from '../../components/DashboardLayout';
import StatusBadge from '../../components/StatusBadge';
import { computeSalaryComponents, computePF, computeProfessionalTax, computeTDS } from '../../utils/salary';
import { getCompanyLogo, getCompanyName } from '../../utils/companyBranding';

type Tab = 'salary' | 'attendance' | 'leave';

const Reports: React.FC = () => {
  const [tab, setTab] = useState<Tab>('salary');
  return (
    <DashboardLayout title="Reports">
      <div className="page-header">
        <div>
          <h1>Reports</h1>
          <p className="page-subtitle">Generate salary statements, attendance summaries, and leave reports</p>
        </div>
      </div>
      <div className="tabs">
        <button className={`tab ${tab === 'salary' ? 'active' : ''}`} onClick={() => setTab('salary')}>Salary Statement</button>
        <button className={`tab ${tab === 'attendance' ? 'active' : ''}`} onClick={() => setTab('attendance')}>Attendance Report</button>
        <button className={`tab ${tab === 'leave' ? 'active' : ''}`} onClick={() => setTab('leave')}>Leave Report</button>
      </div>
      {tab === 'salary' && <SalaryStatementReport />}
      {tab === 'attendance' && <AttendanceReport />}
      {tab === 'leave' && <LeaveReport />}
    </DashboardLayout>
  );
};

/* ── Salary Statement ── */
const SalaryStatementReport: React.FC = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.get('/employees').then((r) => setEmployees(r.data.employees || []))
      .finally(() => setLoading(false));
  }, []);

  const emp = employees.find((e) => String(e.id) === selectedId);
  const components = computeSalaryComponents(Number(emp?.basic_wage || 0));
  const pf = computePF(components.basic);
  const pt = emp?.professional_tax_applicable !== false ? computeProfessionalTax(components.gross) : 0;
  const tds = computeTDS(components.gross * 12, emp?.tax_regime || 'new', 0);
  const totalDeductions = pf + pt + tds.monthlyTDS;
  const netSalary = components.gross - totalDeductions;
  const logo = getCompanyLogo();
  const companyName = getCompanyName() || 'EmPay HRMS';

  const handlePrint = () => {
    const el = printRef.current;
    if (!el) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><title>Salary Statement</title><style>
      body { font-family: 'Plus Jakarta Sans', 'Poppins', sans-serif; padding: 40px; color: #1e1e2e; }
      table { width: 100%; border-collapse: collapse; }
      th, td { padding: 10px 14px; text-align: left; border-bottom: 1px solid #e5e7eb; font-size: 13px; }
      th { background: #f9fafb; text-transform: uppercase; letter-spacing: 0.04em; font-size: 11px; color: #6b7280; }
      .total-row td { font-weight: 700; border-top: 2px solid #1e1e2e; }
      .header { text-align: center; margin-bottom: 24px; }
      .header h2 { margin: 0; font-size: 18px; }
      .header p { margin: 4px 0 0; color: #6b7280; font-size: 13px; }
      .meta { display: flex; flex-wrap: wrap; gap: 20px; margin-bottom: 20px; font-size: 13px; }
      .meta strong { display: block; font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 2px; }
      .section-title { font-size: 12px; text-transform: uppercase; letter-spacing: 0.06em; color: #714b67; font-weight: 700; margin: 20px 0 8px; }
      @media print { button { display: none !important; } }
    </style></head><body>${el.innerHTML}</body></html>`);
    win.document.close();
    setTimeout(() => { win.print(); win.close(); }, 300);
  };

  return (
    <>
      <div className="card fade-up">
        <div className="card-header">
          <h3 className="card-title">Generate Salary Statement</h3>
          {emp && <button className="btn-primary btn-sm" onClick={handlePrint}>Print / Export PDF</button>}
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Employee</label>
            <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
              <option value="">Select employee…</option>
              {employees.map((e) => <option key={e.id} value={e.id}>{e.first_name} {e.last_name} — {e.department}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Year</label>
            <select value={year} onChange={(e) => setYear(Number(e.target.value))}>
              {[2024, 2025, 2026, 2027].map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
      </div>

      {emp && (
        <div className="payslip-card fade-up delay-1" ref={printRef}>
          <div className="payslip-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              {logo && <img src={logo} alt="logo" style={{ width: 48, height: 48, objectFit: 'contain', borderRadius: 8, background: 'rgba(255,255,255,0.2)' }} />}
              <div>
                <h3>{companyName}</h3>
                <p>Salary Statement Report — {year}</p>
              </div>
            </div>
          </div>
          <div className="payslip-body">
            <div className="detail-grid" style={{ marginBottom: 20 }}>
              <div className="detail-item"><span className="detail-label">Employee Name</span><span className="detail-value">{emp.first_name} {emp.last_name}</span></div>
              <div className="detail-item"><span className="detail-label">Designation</span><span className="detail-value">{emp.designation}</span></div>
              <div className="detail-item"><span className="detail-label">Department</span><span className="detail-value">{emp.department}</span></div>
              <div className="detail-item"><span className="detail-label">Date of Joining</span><span className="detail-value">{emp.date_of_joining ? new Date(emp.date_of_joining).toLocaleDateString() : '—'}</span></div>
              <div className="detail-item"><span className="detail-label">Login ID</span><span className="detail-value"><span className="login-id-highlight">{emp.login_id}</span></span></div>
            </div>

            <div className="payslip-section">
              <h4>Earnings</h4>
              <div className="payslip-row"><span className="label">Basic Salary (50% of Wage)</span><span className="value">₹{components.basic.toLocaleString()}</span></div>
              <div className="payslip-row"><span className="label">House Rent Allowance (50% of Basic)</span><span className="value">₹{components.hra.toLocaleString()}</span></div>
              <div className="payslip-row"><span className="label">Standard Allowance (Fixed)</span><span className="value">₹{components.standardAllowance.toLocaleString()}</span></div>
              <div className="payslip-row"><span className="label">Performance Bonus (8.33%)</span><span className="value">₹{components.performanceBonus.toLocaleString()}</span></div>
              <div className="payslip-row"><span className="label">Leave Travel Allowance (8.333%)</span><span className="value">₹{components.lta.toLocaleString()}</span></div>
              <div className="payslip-row"><span className="label">Fixed Allowance (Residual)</span><span className="value">₹{components.fixedAllowance.toLocaleString()}</span></div>
              <div className="payslip-row total"><span className="label">Gross Salary (Monthly)</span><span className="value">₹{components.gross.toLocaleString()}</span></div>
            </div>

            <div className="payslip-section">
              <h4>Deductions</h4>
              <div className="payslip-row"><span className="label">PF Employee (12%)</span><span className="value">₹{pf.toLocaleString()}</span></div>
              <div className="payslip-row"><span className="label">Professional Tax</span><span className="value">₹{pt.toLocaleString()}</span></div>
              <div className="payslip-row"><span className="label">TDS (Income Tax)</span><span className="value">₹{tds.monthlyTDS.toLocaleString()}</span></div>
              <div className="payslip-row total"><span className="label">Total Deductions</span><span className="value" style={{ color: 'var(--red-600)' }}>−₹{totalDeductions.toLocaleString()}</span></div>
            </div>

            <div className="payslip-section">
              <h4>Summary</h4>
              <div className="payslip-row total"><span className="label">Net Monthly Salary</span><span className="value">₹{netSalary.toLocaleString()}</span></div>
              <div className="payslip-row total"><span className="label">Net Annual Salary</span><span className="value">₹{(netSalary * 12).toLocaleString()}</span></div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

/* ── Attendance Report ── */
const AttendanceReport: React.FC = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  useEffect(() => {
    const start = new Date(year, month, 1).toISOString().slice(0, 10);
    const end = new Date(year, month + 1, 0).toISOString().slice(0, 10);
    Promise.all([
      api.get('/employees').catch(() => ({ data: { employees: [] } })),
      api.get('/attendance/history', { params: { startDate: start, endDate: end } }).catch(() => ({ data: { attendance: [] } })),
    ]).then(([e, a]) => {
      setEmployees(e.data.employees || []);
      setAttendance(a.data.attendance || []);
    }).finally(() => setLoading(false));
  }, [month, year]);

  const workDays = new Date(year, month + 1, 0).getDate();
  const grouped = employees.filter((e) => e.status === 'active').map((e) => {
    const records = attendance.filter((a) => a.employee_id === e.id);
    const present = records.filter((a) => a.status === 'present').length;
    const absent = records.filter((a) => a.status === 'absent').length;
    const onLeave = records.filter((a) => a.status === 'on_leave').length;
    const halfDay = records.filter((a) => a.status === 'half_day').length;
    const pct = workDays > 0 ? Math.round(((present + onLeave + halfDay * 0.5) / workDays) * 100) : 0;
    return { ...e, present, absent, onLeave, halfDay, pct };
  });

  return (
    <div className="card fade-up">
      <div className="card-header"><h3 className="card-title">Attendance Report — {monthNames[month]} {year}</h3></div>
      <div className="filter-bar" style={{ marginBottom: 14 }}>
        <select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
          {monthNames.map((m, i) => <option key={i} value={i}>{m}</option>)}
        </select>
        <select value={year} onChange={(e) => setYear(Number(e.target.value))}>
          {[2024, 2025, 2026, 2027].map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
      {loading ? <div className="loading">Loading…</div> : (
        <div className="table-wrapper">
          <table className="table">
            <thead><tr><th>Employee</th><th>Dept</th><th>Working Days</th><th>Present</th><th>Absent</th><th>On Leave</th><th>Half Day</th><th>Attendance %</th></tr></thead>
            <tbody>
              {grouped.map((e) => (
                <tr key={e.id}>
                  <td><strong>{e.first_name} {e.last_name}</strong></td>
                  <td>{e.department}</td>
                  <td>{workDays}</td>
                  <td>{e.present}</td>
                  <td>{e.absent}</td>
                  <td>{e.onLeave}</td>
                  <td>{e.halfDay}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="progress" style={{ flex: 1, maxWidth: 80 }}><div className="progress-fill" style={{ width: `${e.pct}%` }} /></div>
                      <span style={{ fontWeight: 600, fontSize: 12.5 }}>{e.pct}%</span>
                    </div>
                  </td>
                </tr>
              ))}
              {grouped.length === 0 && <tr><td colSpan={8} className="empty-state">No attendance data for this period.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

/* ── Leave Report ── */
const LeaveReport: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  useEffect(() => {
    api.get('/leave/requests').then((r) => setRequests(r.data.leaveRequests || []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = requests.filter((r) => {
    const d = new Date(r.from_date);
    return d.getMonth() === month && d.getFullYear() === year;
  });

  const approved = filtered.filter((r) => r.status === 'approved').length;
  const rejected = filtered.filter((r) => r.status === 'rejected').length;
  const pending = filtered.filter((r) => r.status === 'pending').length;

  return (
    <div className="card fade-up">
      <div className="card-header"><h3 className="card-title">Leave Report — {monthNames[month]} {year}</h3></div>
      <div className="filter-bar" style={{ marginBottom: 14 }}>
        <select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
          {monthNames.map((m, i) => <option key={i} value={i}>{m}</option>)}
        </select>
        <select value={year} onChange={(e) => setYear(Number(e.target.value))}>
          {[2024, 2025, 2026, 2027].map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
      <div className="stats-grid" style={{ marginBottom: 18 }}>
        <div className="stat-card"><div className="stat-card-header"><span className="stat-card-title">Total</span></div><div className="stat-card-value">{filtered.length}</div></div>
        <div className="stat-card"><div className="stat-card-header"><span className="stat-card-title">Approved</span><div className="stat-card-icon green">✓</div></div><div className="stat-card-value">{approved}</div></div>
        <div className="stat-card"><div className="stat-card-header"><span className="stat-card-title">Rejected</span><div className="stat-card-icon red">✕</div></div><div className="stat-card-value">{rejected}</div></div>
        <div className="stat-card"><div className="stat-card-header"><span className="stat-card-title">Pending</span><div className="stat-card-icon amber">◑</div></div><div className="stat-card-value">{pending}</div></div>
      </div>
      {loading ? <div className="loading">Loading…</div> : (
        <div className="table-wrapper">
          <table className="table">
            <thead><tr><th>Employee</th><th>Leave Type</th><th>From</th><th>To</th><th>Days</th><th>Status</th><th>Reason</th></tr></thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td><strong>{r.first_name || '—'} {r.last_name || ''}</strong></td>
                  <td>{r.leave_type_name}</td>
                  <td>{new Date(r.from_date).toLocaleDateString()}</td>
                  <td>{new Date(r.to_date).toLocaleDateString()}</td>
                  <td>{r.days_requested}</td>
                  <td><StatusBadge status={r.status} /></td>
                  <td style={{ maxWidth: 180, fontSize: 12, color: 'var(--text-muted)' }}>{r.reason}</td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={7} className="empty-state">No leave requests for this period.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Reports;
