import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import DashboardLayout from '../../components/DashboardLayout';
import StatusBadge from '../../components/StatusBadge';
import PayrunWarnings from '../../components/PayrunWarnings';
import { computePayrunWarnings } from '../../utils/salary';

const PayrollDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<any[]>([]);
  const [taxDecls, setTaxDecls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/employees').catch(() => ({ data: { employees: [] } })),
      api.get('/tax/declarations').catch(() => ({ data: { declarations: [] } })),
    ]).then(([e, t]) => {
      setEmployees(e.data.employees || []);
      setTaxDecls(t.data.declarations || []);
    }).finally(() => setLoading(false));
  }, []);

  const active = employees.filter((e) => e.status === 'active');
  const totalMonthlyWage = active.reduce((s, e) => s + Number(e.basic_wage || 0), 0);
  const pendingDecl = taxDecls.filter((d) => d.status === 'pending');

  return (
    <DashboardLayout title="Payroll Dashboard">
      <div className="page-header">
        <div>
          <h1>Payroll Overview</h1>
          <p className="page-subtitle">Run payroll, approve tax declarations, view reports</p>
        </div>
        <div className="page-actions">
          <button className="btn-primary" onClick={() => navigate('/payroll/payrun')}>New Payroll Run</button>
        </div>
      </div>

      {loading ? <div className="loading">Loading…</div> : (
        <>
          <div className="stats-grid">
            <div className="stat-card fade-up">
              <div className="stat-card-header">
                <span className="stat-card-title">Active Employees</span>
                <div className="stat-card-icon">◔</div>
              </div>
              <div className="stat-card-value">{active.length}</div>
              <div className="stat-card-change">{employees.length} total</div>
            </div>
            <div className="stat-card fade-up delay-1">
              <div className="stat-card-header">
                <span className="stat-card-title">Monthly Wage Bill</span>
                <div className="stat-card-icon green">◐</div>
              </div>
              <div className="stat-card-value">₹{(totalMonthlyWage / 1000).toFixed(0)}K</div>
              <div className="stat-card-change">Sum of basic wages</div>
            </div>
            <div className="stat-card fade-up delay-2">
              <div className="stat-card-header">
                <span className="stat-card-title">Pending Tax Declarations</span>
                <div className="stat-card-icon amber">◑</div>
              </div>
              <div className="stat-card-value">{pendingDecl.length}</div>
              <div className="stat-card-change">Need your review</div>
            </div>
            <div className="stat-card fade-up delay-3">
              <div className="stat-card-header">
                <span className="stat-card-title">Annual Wage Estimate</span>
                <div className="stat-card-icon blue">◓</div>
              </div>
              <div className="stat-card-value">₹{((totalMonthlyWage * 12) / 100000).toFixed(1)}L</div>
              <div className="stat-card-change">Before deductions</div>
            </div>
          </div>

          <PayrunWarnings warnings={computePayrunWarnings(employees)} />

          <div className="policy-notice">
            ⓘ <strong>Payroll Policy:</strong> Payroll runs are computed using basic wage, attendance, and approved leaves.
            PF (12%) and Professional Tax (state slab) are auto-deducted. Payroll Officers cannot approve/reject leave requests — that's HR's job.
          </div>

          <div className="card-grid">
            <div className="card fade-up">
              <div className="card-header">
                <h3 className="card-title">Pending Tax Declarations</h3>
                <button className="btn-secondary btn-sm" onClick={() => navigate('/payroll/tax')}>Review all</button>
              </div>
              {pendingDecl.length === 0 ? (
                <div className="empty">
                  <div className="empty-icon">✓</div>
                  <div className="empty-title">All caught up</div>
                  <div className="empty-desc">No pending declarations</div>
                </div>
              ) : (
                <div className="table-wrapper">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Type</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingDecl.slice(0, 5).map((d) => (
                        <tr key={d.id}>
                          <td><strong>{d.first_name} {d.last_name}</strong></td>
                          <td>{(d.declaration_type || '').replace(/_/g, ' ')}</td>
                          <td>₹{Number(d.amount).toLocaleString()}</td>
                          <td><StatusBadge status={d.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="card fade-up delay-1">
              <div className="card-header">
                <h3 className="card-title">Quick Actions</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button className="quick-action" onClick={() => navigate('/payroll/payrun')}>
                  <div className="quick-action-icon">◓</div>
                  <div>
                    <div className="quick-action-label">Run Payroll</div>
                    <div className="quick-action-desc">Compute & generate payslips</div>
                  </div>
                </button>
                <button className="quick-action" onClick={() => navigate('/payroll/tax')}>
                  <div className="quick-action-icon">◒</div>
                  <div>
                    <div className="quick-action-label">Tax Approvals</div>
                    <div className="quick-action-desc">{pendingDecl.length} pending</div>
                  </div>
                </button>
                <button className="quick-action" onClick={() => navigate('/payroll/policies')}>
                  <div className="quick-action-icon">◐</div>
                  <div>
                    <div className="quick-action-label">View Policies</div>
                    <div className="quick-action-desc">Compensation, tax, etc.</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default PayrollDashboard;
