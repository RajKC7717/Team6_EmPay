import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import DashboardLayout from '../../components/DashboardLayout';
import StatusBadge from '../../components/StatusBadge';

const HRDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<any[]>([]);
  const [pendingLeaves, setPendingLeaves] = useState<any[]>([]);
  const [todayAtt, setTodayAtt] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    Promise.all([
      api.get('/employees').catch(() => ({ data: { employees: [] } })),
      api.get('/leave/requests', { params: { status: 'pending' } }).catch(() => ({ data: { leaveRequests: [] } })),
      api.get('/attendance/history', { params: { startDate: today, endDate: today } }).catch(() => ({ data: { attendance: [] } })),
    ]).then(([e, l, a]) => {
      setEmployees(e.data.employees || []);
      setPendingLeaves(l.data.leaveRequests || []);
      setTodayAtt(a.data.attendance || []);
    }).finally(() => setLoading(false));
  }, []);

  const presentToday = todayAtt.filter((a) => a.status === 'present' || a.status === 'half_day').length;
  const onLeaveToday = todayAtt.filter((a) => a.status === 'on_leave').length;
  const activeCount = employees.filter((e) => e.status === 'active').length;
  const presentRate = activeCount > 0 ? Math.round((presentToday / activeCount) * 100) : 0;

  return (
    <DashboardLayout title="HR Dashboard">
      <div className="page-header">
        <div>
          <h1>HR Overview</h1>
          <p className="page-subtitle">Manage your team, attendance, and approvals</p>
        </div>
        <div className="page-actions">
          <button className="btn-outline" onClick={() => navigate('/hr/performance')}>Performance</button>
          <button className="btn-primary" onClick={() => navigate('/hr/employees')}>Add Employee</button>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading…</div>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card fade-up">
              <div className="stat-card-header">
                <span className="stat-card-title">Active Employees</span>
                <div className="stat-card-icon">◔</div>
              </div>
              <div className="stat-card-value">{activeCount}</div>
              <div className="stat-card-change">{employees.length} total</div>
            </div>
            <div className="stat-card fade-up delay-1">
              <div className="stat-card-header">
                <span className="stat-card-title">Present Today</span>
                <div className="stat-card-icon green">◐</div>
              </div>
              <div className="stat-card-value">{presentToday}</div>
              <div className="stat-card-change up">{presentRate}% attendance rate</div>
            </div>
            <div className="stat-card fade-up delay-2">
              <div className="stat-card-header">
                <span className="stat-card-title">On Leave</span>
                <div className="stat-card-icon blue">✈</div>
              </div>
              <div className="stat-card-value">{onLeaveToday}</div>
              <div className="stat-card-change">Approved leaves today</div>
            </div>
            <div className="stat-card fade-up delay-3">
              <div className="stat-card-header">
                <span className="stat-card-title">Pending Leaves</span>
                <div className="stat-card-icon amber">◑</div>
              </div>
              <div className="stat-card-value">{pendingLeaves.length}</div>
              <div className="stat-card-change">Need your decision</div>
            </div>
          </div>

          <div className="card-grid">
            <div className="card fade-up">
              <div className="card-header">
                <h3 className="card-title">Pending Leave Requests</h3>
                <button className="btn-secondary btn-sm" onClick={() => navigate('/hr/leave')}>Open queue</button>
              </div>
              {pendingLeaves.length === 0 ? (
                <div className="empty">
                  <div className="empty-icon">✓</div>
                  <div className="empty-title">No pending requests</div>
                </div>
              ) : (
                <div className="table-wrapper">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Type</th>
                        <th>Period</th>
                        <th>Days</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingLeaves.slice(0, 5).map((l) => (
                        <tr key={l.id}>
                          <td><strong>{l.first_name} {l.last_name}</strong></td>
                          <td>{l.leave_type_name}</td>
                          <td>{new Date(l.from_date).toLocaleDateString()} – {new Date(l.to_date).toLocaleDateString()}</td>
                          <td>{l.days_requested}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="card fade-up delay-1">
              <div className="card-header">
                <h3 className="card-title">Today's Attendance Summary</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <SummaryRow color="var(--green-500)" label="Present" count={presentToday} total={activeCount} />
                <SummaryRow color="var(--blue-500)" label="On Leave" count={onLeaveToday} total={activeCount} />
                <SummaryRow color="var(--red-500)" label="Not Marked" count={Math.max(0, activeCount - presentToday - onLeaveToday)} total={activeCount} />
              </div>
              <div className="policy-notice" style={{ marginTop: 16 }}>
                ⓘ Auto-absent job runs at 11:59 PM daily for unmarked employees.
              </div>
            </div>
          </div>

          <div className="card fade-up delay-2">
            <div className="card-header">
              <h3 className="card-title">Quick Actions</h3>
            </div>
            <div className="quick-actions">
              <button className="quick-action" onClick={() => navigate('/hr/employees')}>
                <div className="quick-action-icon">◔</div>
                <div>
                  <div className="quick-action-label">Add Employee</div>
                  <div className="quick-action-desc">Manual or resume upload</div>
                </div>
              </button>
              <button className="quick-action" onClick={() => navigate('/hr/leave')}>
                <div className="quick-action-icon">◐</div>
                <div>
                  <div className="quick-action-label">Approve Leaves</div>
                  <div className="quick-action-desc">{pendingLeaves.length} pending</div>
                </div>
              </button>
              <button className="quick-action" onClick={() => navigate('/hr/attendance')}>
                <div className="quick-action-icon">◑</div>
                <div>
                  <div className="quick-action-label">Attendance</div>
                  <div className="quick-action-desc">Company-wide view</div>
                </div>
              </button>
              <button className="quick-action" onClick={() => navigate('/hr/performance')}>
                <div className="quick-action-icon">◓</div>
                <div>
                  <div className="quick-action-label">Performance</div>
                  <div className="quick-action-desc">Reviews and goals</div>
                </div>
              </button>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

const SummaryRow: React.FC<{ color: string; label: string; count: number; total: number }> = ({ color, label, count, total }) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13.5 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block' }} />
          {label}
        </span>
        <span style={{ color: 'var(--text-muted)' }}>{count} · {pct}%</span>
      </div>
      <div className="progress">
        <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
};

export default HRDashboard;
