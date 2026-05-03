import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import DashboardLayout from '../../components/DashboardLayout';
import StatusBadge from '../../components/StatusBadge';
import EmployeeCards from '../../components/EmployeeCards';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<any[]>([]);
  const [pendingLeaves, setPendingLeaves] = useState<any[]>([]);
  const [policies, setPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'table' | 'cards'>('cards');

  useEffect(() => {
    Promise.all([
      api.get('/employees').catch(() => ({ data: { employees: [] } })),
      api.get('/leave/requests', { params: { status: 'pending' } }).catch(() => ({ data: { leaveRequests: [] } })),
      api.get('/policies').catch(() => ({ data: { policies: [] } })),
    ]).then(([e, l, p]) => {
      setEmployees(e.data.employees || []);
      setPendingLeaves(l.data.leaveRequests || []);
      setPolicies(p.data.policies || []);
    }).finally(() => setLoading(false));
  }, []);

  const activeCount = employees.filter((e) => e.status === 'active').length;
  const departments = new Set(employees.map((e) => e.department).filter(Boolean));
  const totalWage = employees.filter((e) => e.status === 'active').reduce((s, e) => s + Number(e.basic_wage || 0), 0);

  return (
    <DashboardLayout title="Admin Dashboard">
      <div className="page-header">
        <div>
          <h1>Welcome back, Admin</h1>
          <p className="page-subtitle">Here's what's happening at your company today</p>
        </div>
        <div className="page-actions">
          <button className="btn-outline" onClick={() => navigate('/admin/reports')}>Reports</button>
          <button className="btn-outline" onClick={() => navigate('/admin/settings')}>Settings</button>
          <button className="btn-primary" onClick={() => navigate('/admin/employees')}>Add Employee</button>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading dashboard…</div>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card fade-up">
              <div className="stat-card-header">
                <span className="stat-card-title">Total Employees</span>
                <div className="stat-card-icon">◔</div>
              </div>
              <div className="stat-card-value">{employees.length}</div>
              <div className="stat-card-change">{activeCount} active</div>
            </div>
            <div className="stat-card fade-up delay-1">
              <div className="stat-card-header">
                <span className="stat-card-title">Departments</span>
                <div className="stat-card-icon green">◐</div>
              </div>
              <div className="stat-card-value">{departments.size}</div>
              <div className="stat-card-change">Across the company</div>
            </div>
            <div className="stat-card fade-up delay-2">
              <div className="stat-card-header">
                <span className="stat-card-title">Pending Leaves</span>
                <div className="stat-card-icon amber">◑</div>
              </div>
              <div className="stat-card-value">{pendingLeaves.length}</div>
              <div className="stat-card-change">Awaiting approval</div>
            </div>
            <div className="stat-card fade-up delay-3">
              <div className="stat-card-header">
                <span className="stat-card-title">Monthly Wage Bill</span>
                <div className="stat-card-icon blue">◓</div>
              </div>
              <div className="stat-card-value">₹{(totalWage / 1000).toFixed(0)}K</div>
              <div className="stat-card-change">Active employees</div>
            </div>
          </div>

          {/* Employee Cards or Table toggle */}
          <div className="card fade-up">
            <div className="card-header">
              <h3 className="card-title">Employees — Live Status</h3>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className={view === 'cards' ? 'btn-primary btn-sm' : 'btn-secondary btn-sm'} onClick={() => setView('cards')}>Cards</button>
                <button className={view === 'table' ? 'btn-primary btn-sm' : 'btn-secondary btn-sm'} onClick={() => setView('table')}>Table</button>
                <button className="btn-outline btn-sm" onClick={() => navigate('/admin/employees')}>Manage →</button>
              </div>
            </div>

            {view === 'cards' ? (
              <EmployeeCards
                employees={employees}
                showSalary
                onView={(emp) => navigate('/admin/employees')}
              />
            ) : (
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Login ID</th>
                      <th>Department</th>
                      <th>Designation</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.slice(0, 10).map((e) => (
                      <tr key={e.id}>
                        <td>
                          <strong>{e.first_name} {e.last_name}</strong>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{e.email}</div>
                        </td>
                        <td><span className="login-id-highlight">{e.login_id || '—'}</span></td>
                        <td>{e.department}</td>
                        <td>{e.designation}</td>
                        <td><StatusBadge status={e.status} /></td>
                      </tr>
                    ))}
                    {employees.length === 0 && (
                      <tr>
                        <td colSpan={5} className="empty-state">
                          No employees yet. Click "Add Employee" to get started.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="card-grid">
            <div className="card fade-up delay-1">
              <div className="card-header">
                <h3 className="card-title">Pending Leave Requests</h3>
              </div>
              {pendingLeaves.length === 0 ? (
                <div className="empty">
                  <div className="empty-icon">✓</div>
                  <div className="empty-title">All clear</div>
                  <div className="empty-desc">No pending leave requests</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {pendingLeaves.slice(0, 5).map((l) => (
                    <div key={l.id} style={{ padding: 12, border: '1px solid var(--border)', borderRadius: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong>{l.first_name} {l.last_name}</strong>
                        <StatusBadge status={l.status} />
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                        {l.leave_type_name} · {new Date(l.from_date).toLocaleDateString()} – {new Date(l.to_date).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                  <button className="btn-outline btn-sm" onClick={() => navigate('/hr/leave')}>Review all</button>
                </div>
              )}
            </div>

            <div className="card fade-up delay-2">
              <div className="card-header">
                <h3 className="card-title">Quick Actions</h3>
              </div>
              <div className="quick-actions">
                <button className="quick-action" onClick={() => navigate('/admin/employees')}>
                  <div className="quick-action-icon">◔</div>
                  <div>
                    <div className="quick-action-label">Add Employee</div>
                    <div className="quick-action-desc">Create with auto login ID</div>
                  </div>
                </button>
                <button className="quick-action" onClick={() => navigate('/payroll/payrun')}>
                  <div className="quick-action-icon">◓</div>
                  <div>
                    <div className="quick-action-label">Run Payroll</div>
                    <div className="quick-action-desc">Generate payslips</div>
                  </div>
                </button>
                <button className="quick-action" onClick={() => navigate('/admin/reports')}>
                  <div className="quick-action-icon">◑</div>
                  <div>
                    <div className="quick-action-label">Reports</div>
                    <div className="quick-action-desc">Salary, attendance, leave</div>
                  </div>
                </button>
                <button className="quick-action" onClick={() => navigate('/admin/settings')}>
                  <div className="quick-action-icon">◐</div>
                  <div>
                    <div className="quick-action-label">Settings</div>
                    <div className="quick-action-desc">Company, salary structure</div>
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

export default AdminDashboard;
