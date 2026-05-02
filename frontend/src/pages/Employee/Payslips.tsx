import React, { useEffect, useState } from 'react';
import api, { getUser } from '../../api';
import DashboardLayout from '../../components/DashboardLayout';

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
  const workingDays = new Date(year, month + 1, 0).getDate();
  const presentDays = attendance.filter((a) => a.status === 'present' || a.status === 'on_leave').length;
  const halfDays = attendance.filter((a) => a.status === 'half_day').length;
  const effectiveDays = presentDays + (halfDays * 0.5);
  const grossSalary = workingDays > 0 ? Math.round((basicWage / workingDays) * effectiveDays) : 0;
  const pfDeduction = employee?.pf_applicable !== false ? Math.round(Math.min(basicWage, 15000) * 0.12) : 0;
  const ptDeduction = employee?.professional_tax_applicable !== false ? (grossSalary > 10000 ? 200 : grossSalary > 7500 ? 175 : 0) : 0;
  const totalDeductions = pfDeduction + ptDeduction;
  const netPay = grossSalary - totalDeductions;
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  return (
    <DashboardLayout title="Payslips">
      <div className="page-header">
        <div><h1>My Payslips</h1><p className="page-subtitle">View your monthly salary breakdown</p></div>
      </div>
      <div className="policy-notice">
        ⓘ <strong>Payroll Policy:</strong> Salary = (Basic ÷ Working Days) × Days Worked. PF at 12% (₹15K cap). PT per Maharashtra slabs.
      </div>
      <div className="filter-bar">
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
        <div className="payslip-card fade-up">
          <div className="payslip-header">
            <h3>EmPay Payslip</h3>
            <p>{employee.first_name} {employee.last_name} · {employee.department} · {monthNames[month]} {year}</p>
          </div>
          <div className="payslip-body">
            <div className="payslip-section"><h4>Earnings</h4>
              <div className="payslip-row"><span className="label">Basic Wage</span><span className="value">₹{basicWage.toLocaleString()}</span></div>
              <div className="payslip-row"><span className="label">Working Days</span><span className="value">{workingDays}</span></div>
              <div className="payslip-row"><span className="label">Days Worked</span><span className="value">{effectiveDays}</span></div>
              <div className="payslip-row total"><span className="label">Gross Salary</span><span className="value">₹{grossSalary.toLocaleString()}</span></div>
            </div>
            <div className="payslip-section"><h4>Deductions</h4>
              <div className="payslip-row"><span className="label">Employee PF (12%)</span><span className="value">₹{pfDeduction.toLocaleString()}</span></div>
              <div className="payslip-row"><span className="label">Professional Tax</span><span className="value">₹{ptDeduction.toLocaleString()}</span></div>
              <div className="payslip-row total"><span className="label">Total Deductions</span><span className="value" style={{color:'var(--red-600)'}}>−₹{totalDeductions.toLocaleString()}</span></div>
            </div>
            <div className="payslip-section"><h4>Net Pay</h4>
              <div className="payslip-row total"><span className="label">Net Pay</span><span className="value">₹{netPay.toLocaleString()}</span></div>
            </div>
            <button className="btn-outline" onClick={() => alert('PDF download coming soon!')}>↓ Download PDF</button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default EmployeePayslips;
