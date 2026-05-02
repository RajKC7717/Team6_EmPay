import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import DashboardLayout from '../../components/DashboardLayout';
import StatusBadge from '../../components/StatusBadge';

const EmployeeDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [leaveBalance, setLeaveBalance] = useState<any[]>([]);
  const [recentLeaves, setRecentLeaves] = useState<any[]>([]);
  const [recentAtt, setRecentAtt] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date();
    const start = new Date(today); start.setDate(start.getDate() - 7);
    Promise.all([
      api.get('/leave/balance').catch(() => ({ data: { leaveBalances: [] } })),
      api.get('/leave/requests').catch(() => ({ data: { leaveRequests: [] } })),
      api.get('/attendance/history', { params: { startDate: start.toISOString().slice(0, 10), endDate: today.toISOString().slice(0, 10) } }).catch(() => ({ data: { attendance: [] } })),
    ]).then(([b, l, a]) => {
      setLeaveBalance(b.data.leaveBalances || []);
      setRecentLeaves((l.data.leaveRequests || []).slice(0, 5));
      setRecentAtt(a.data.attendance || []);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout title="My Dashboard">
      <div className="page-header">
        <div>
          <h1>Hello there 👋</h1>
          <p className="page-subtitle">Use the pill in the top-right to check in or out</p>
        </div>
      </div>

      {loading ? <div className="loading">Loading…</div> : (
        <>
          <div className="stats-grid">
            {leaveBalance.map((lb, i) => (
              <div className="stat-card fade-up" key={lb.id} style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="stat-card-header">
                  <span className="stat-card-title">{lb.leave_type_name}</span>
                  <div className={`stat-card-icon ${lb.is_paid ? 'green' : 'amber'}`}>◐</div>
                </div>
                <div className="stat-card-value">{lb.remaining_days}</div>
                <div className="stat-card-change">of {lb.total_days} days remaining</div>
                <div className="progress" style={{ marginTop: 12 }}>
                  <div className="progress-fill" style={{ width: `${Math.min(100, (lb.remaining_days / Math.max(1, lb.total_days)) * 100)}%` }} />
                </div>
              </div>
            ))}
            {leaveBalance.length === 0 && (
              <div className="stat-card">
                <div className="stat-card-header">
                  <span className="stat-card-title">Leave Balance</span>
                </div>
                <div className="stat-card-value">—</div>
                <div className="stat-card-change">Ask HR to allocate leaves</div>
              </div>
            )}
          </div>

          <div className="card-grid">
            <div className="card fade-up">
              <div className="card-header">
                <h3 className="card-title">Recent Leave Requests</h3>
                <button className="btn-secondary btn-sm" onClick={() => navigate('/employee/leave')}>View all</button>
              </div>
              {recentLeaves.length === 0 ? (
                <div className="empty">
                  <div className="empty-icon">◐</div>
                  <div className="empty-title">No leave history</div>
                  <div className="empty-desc">Apply for leave when you need time off</div>
                </div>
              ) : (
                <div className="table-wrapper">
                  <table className="table">
                    <thead>
                      <tr><th>Type</th><th>From</th><th>To</th><th>Days</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                      {recentLeaves.map((l) => (
                        <tr key={l.id}>
                          <td>{l.leave_type_name}</td>
                          <td>{new Date(l.from_date).toLocaleDateString()}</td>
                          <td>{new Date(l.to_date).toLocaleDateString()}</td>
                          <td>{l.days_requested}</td>
                          <td><StatusBadge status={l.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="card fade-up delay-1">
              <div className="card-header">
                <h3 className="card-title">Last 7 Days</h3>
                <button className="btn-secondary btn-sm" onClick={() => navigate('/employee/attendance')}>Full history</button>
              </div>
              {recentAtt.length === 0 ? (
                <div className="empty">
                  <div className="empty-icon">◑</div>
                  <div className="empty-title">No attendance yet</div>
                  <div className="empty-desc">Check in via the top-right pill</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {recentAtt.slice(0, 7).map((a) => (
                    <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--gray-50)', borderRadius: 8 }}>
                      <span style={{ fontSize: 13 }}>{new Date(a.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                      <StatusBadge status={a.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="card fade-up delay-2">
            <div className="card-header">
              <h3 className="card-title">Quick Actions</h3>
            </div>
            <div className="quick-actions">
              <button className="quick-action" onClick={() => navigate('/employee/leave')}>
                <div className="quick-action-icon">◐</div>
                <div>
                  <div className="quick-action-label">Apply for Leave</div>
                  <div className="quick-action-desc">Request time off</div>
                </div>
              </button>
              <button className="quick-action" onClick={() => navigate('/employee/payslips')}>
                <div className="quick-action-icon">◓</div>
                <div>
                  <div className="quick-action-label">My Payslips</div>
                  <div className="quick-action-desc">Download monthly slips</div>
                </div>
              </button>
              <button className="quick-action" onClick={() => navigate('/employee/tax')}>
                <div className="quick-action-icon">◒</div>
                <div>
                  <div className="quick-action-label">Income Tax</div>
                  <div className="quick-action-desc">Declare 80C, 80D, HRA</div>
                </div>
              </button>
              <button className="quick-action" onClick={() => navigate('/employee/profile')}>
                <div className="quick-action-icon">◔</div>
                <div>
                  <div className="quick-action-label">My Profile</div>
                  <div className="quick-action-desc">Update your details</div>
                </div>
              </button>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default EmployeeDashboard;
