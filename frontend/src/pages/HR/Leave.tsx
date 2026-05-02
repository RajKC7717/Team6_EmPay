import React, { useEffect, useState } from 'react';
import api from '../../api';
import DashboardLayout from '../../components/DashboardLayout';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';

const HRLeave: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'pending' | 'all'>('pending');
  const [rejectFor, setRejectFor] = useState<any | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [busy, setBusy] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const r = await api.get('/leave/requests', { params: tab === 'pending' ? { status: 'pending' } : {} });
      setRequests(r.data.leaveRequests || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [tab]);

  const approve = async (id: number) => {
    if (!window.confirm('Approve this leave request?')) return;
    setBusy(true);
    try {
      await api.put(`/leave/requests/${id}/approve`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to approve');
    } finally {
      setBusy(false);
    }
  };

  const submitReject = async () => {
    if (!rejectFor) return;
    if (!rejectReason.trim()) { alert('Please provide a reason'); return; }
    setBusy(true);
    try {
      await api.put(`/leave/requests/${rejectFor.id}/reject`, { rejectionReason: rejectReason });
      setRejectFor(null);
      setRejectReason('');
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to reject');
    } finally {
      setBusy(false);
    }
  };

  return (
    <DashboardLayout title="Leave Requests">
      <div className="page-header">
        <div>
          <h1>Leave Approval Queue</h1>
          <p className="page-subtitle">Approve or reject employee leave applications. Only HR and Admin can decide here.</p>
        </div>
      </div>

      <div className="policy-notice">
        ⓘ <strong>Leave Policy:</strong> Paid Time Off (18 days/year, carry-forward up to 5), Sick Leave (6 days/year),
        Unpaid Leave (unlimited but unpaid). Approved leaves auto-create attendance records as "On Leave".
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'pending' ? 'active' : ''}`} onClick={() => setTab('pending')}>Pending</button>
        <button className={`tab ${tab === 'all' ? 'active' : ''}`} onClick={() => setTab('all')}>All Requests</button>
      </div>

      <div className="table-wrapper">
        {loading ? (
          <div className="loading">Loading requests…</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
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
                  <td><strong>{r.first_name} {r.last_name}</strong></td>
                  <td>{r.department || '—'}</td>
                  <td>{r.leave_type_name} <span className="pill" style={{ marginLeft: 6 }}>{r.is_paid ? 'paid' : 'unpaid'}</span></td>
                  <td>{new Date(r.from_date).toLocaleDateString()}</td>
                  <td>{new Date(r.to_date).toLocaleDateString()}</td>
                  <td>{r.days_requested}</td>
                  <td style={{ maxWidth: 220, fontSize: 12.5, color: 'var(--text-muted)' }}>{r.reason}</td>
                  <td><StatusBadge status={r.status} /></td>
                  <td className="table-actions">
                    {r.status === 'pending' && (
                      <>
                        <button className="btn-success btn-sm" disabled={busy} onClick={() => approve(r.id)}>Approve</button>
                        <button className="btn-danger btn-sm" disabled={busy} onClick={() => setRejectFor(r)}>Reject</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {requests.length === 0 && (
                <tr><td colSpan={9} className="empty-state">No leave requests.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {rejectFor && (
        <Modal
          open
          title={`Reject leave — ${rejectFor.first_name} ${rejectFor.last_name}`}
          onClose={() => { setRejectFor(null); setRejectReason(''); }}
          footer={
            <>
              <button className="btn-secondary" onClick={() => { setRejectFor(null); setRejectReason(''); }}>Cancel</button>
              <button className="btn-danger" onClick={submitReject} disabled={busy}>{busy ? 'Rejecting…' : 'Reject Request'}</button>
            </>
          }
        >
          <div className="form-group">
            <label>Reason for rejection <span className="required">*</span></label>
            <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Explain why this request is being rejected" />
            <span className="form-hint">The employee will see this reason in their leave history.</span>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
};

export default HRLeave;
