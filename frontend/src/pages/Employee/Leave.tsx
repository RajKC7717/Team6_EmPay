import React, { useEffect, useState } from 'react';
import api from '../../api';
import DashboardLayout from '../../components/DashboardLayout';
import StatusBadge from '../../components/StatusBadge';

const EmployeeLeave: React.FC = () => {
  const [balances, setBalances] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'apply' | 'history'>('apply');
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({ leaveTypeId: '' as string | number, fromDate: '', toDate: '', reason: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [b, r] = await Promise.all([
        api.get('/leave/balance').catch(() => ({ data: { leaveBalances: [] } })),
        api.get('/leave/requests').catch(() => ({ data: { leaveRequests: [] } })),
      ]);
      setBalances(b.data.leaveBalances || []);
      setRequests(r.data.leaveRequests || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const submit = async () => {
    setError(null); setSuccess(null);
    if (!form.leaveTypeId || !form.fromDate || !form.toDate || !form.reason.trim()) {
      setError('Please fill all fields'); return;
    }
    if (form.fromDate > form.toDate) { setError('End date must be after start date'); return; }

    const selected = balances.find((b) => b.leave_type_id === Number(form.leaveTypeId));
    if (selected && selected.is_paid && selected.remaining_days <= 0) {
      setError(`Insufficient ${selected.leave_type_name} balance. You have 0 days remaining.`); return;
    }

    setBusy(true);
    try {
      await api.post('/leave/requests', {
        leaveTypeId: Number(form.leaveTypeId),
        fromDate: form.fromDate,
        toDate: form.toDate,
        reason: form.reason,
      });
      setSuccess('Leave request submitted successfully!');
      setForm({ leaveTypeId: '', fromDate: '', toDate: '', reason: '' });
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit leave request');
    } finally { setBusy(false); }
  };

  const cancel = async (id: number) => {
    if (!window.confirm('Cancel this leave request?')) return;
    setBusy(true);
    try {
      await api.put(`/leave/requests/${id}/cancel`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to cancel');
    } finally { setBusy(false); }
  };

  return (
    <DashboardLayout title="Leave Requests">
      <div className="page-header">
        <div>
          <h1>Time Off</h1>
          <p className="page-subtitle">Apply for leave or view your request history</p>
        </div>
      </div>

      <div className="policy-notice">
        ⓘ <strong>Leave Policy:</strong> Paid Time Off (18 days/year, carry-forward up to 5), Sick Leave (6 days/year, no carry-forward),
        Unpaid Leave (unlimited). Overlapping dates are not allowed.
      </div>

      {loading ? <div className="loading">Loading…</div> : (
        <>
          <div className="stats-grid">
            {balances.map((lb, i) => (
              <div className="stat-card fade-up" key={lb.leave_type_id} style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="stat-card-header">
                  <span className="stat-card-title">{lb.leave_type_name}</span>
                  <div className={`stat-card-icon ${lb.is_paid ? 'green' : 'amber'}`}>◐</div>
                </div>
                <div className="stat-card-value">{lb.remaining_days}</div>
                <div className="stat-card-change">of {lb.total_days} days · {lb.used_days} used</div>
                <div className="progress" style={{ marginTop: 12 }}>
                  <div className="progress-fill" style={{ width: `${Math.min(100, (lb.remaining_days / Math.max(1, lb.total_days)) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="tabs">
            <button className={`tab ${tab === 'apply' ? 'active' : ''}`} onClick={() => setTab('apply')}>Apply for Leave</button>
            <button className={`tab ${tab === 'history' ? 'active' : ''}`} onClick={() => setTab('history')}>My Requests</button>
          </div>

          {tab === 'apply' && (
            <div className="card fade-up">
              <div className="card-header">
                <h3 className="card-title">New Leave Request</h3>
              </div>
              {error && <div className="alert alert-error">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}

              <div className="form-group">
                <label>Leave Type <span className="required">*</span></label>
                <select value={form.leaveTypeId} onChange={(e) => setForm({ ...form, leaveTypeId: e.target.value })}>
                  <option value="">Select leave type…</option>
                  {balances.map((b) => (
                    <option key={b.leave_type_id} value={b.leave_type_id}>
                      {b.leave_type_name} ({b.remaining_days} remaining) {b.is_paid ? '' : '— unpaid'}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>From Date <span className="required">*</span></label>
                  <input type="date" value={form.fromDate} onChange={(e) => setForm({ ...form, fromDate: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>To Date <span className="required">*</span></label>
                  <input type="date" value={form.toDate} onChange={(e) => setForm({ ...form, toDate: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Reason <span className="required">*</span></label>
                <textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Explain why you need time off" />
              </div>
              <button className="btn-primary" onClick={submit} disabled={busy}>
                {busy ? 'Submitting…' : 'Submit Leave Request'}
              </button>
            </div>
          )}

          {tab === 'history' && (
            <div className="table-wrapper fade-up">
              <table className="table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Days</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((r) => (
                    <tr key={r.id}>
                      <td>{r.leave_type_name} <span className="pill" style={{ marginLeft: 6 }}>{r.is_paid ? 'paid' : 'unpaid'}</span></td>
                      <td>{new Date(r.from_date).toLocaleDateString()}</td>
                      <td>{new Date(r.to_date).toLocaleDateString()}</td>
                      <td>{r.days_requested}</td>
                      <td style={{ maxWidth: 200, fontSize: 12.5, color: 'var(--text-muted)' }}>{r.reason}</td>
                      <td><StatusBadge status={r.status} /></td>
                      <td className="table-actions">
                        {(r.status === 'pending' || r.status === 'approved') && (
                          <button className="btn-secondary btn-sm" onClick={() => cancel(r.id)} disabled={busy}>Cancel</button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {requests.length === 0 && (
                    <tr><td colSpan={7} className="empty-state">No leave requests yet. Apply from the form above.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
};

export default EmployeeLeave;
