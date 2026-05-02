import React, { useEffect, useState } from 'react';
import api from '../../api';
import DashboardLayout from '../../components/DashboardLayout';
import StatusBadge from '../../components/StatusBadge';

const HRAttendance: React.FC = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 7);
    return d.toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [statusFilter, setStatusFilter] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const r = await api.get('/attendance/history', {
        params: { startDate, endDate, status: statusFilter || undefined },
      });
      setRecords(r.data.attendance || []);
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [startDate, endDate, statusFilter]);

  const exportCSV = () => {
    const header = ['Employee', 'Department', 'Date', 'Check-in', 'Check-out', 'Duration (min)', 'Status'];
    const rows = records.map((r) => [
      `${r.first_name} ${r.last_name}`,
      r.department || '',
      r.date,
      r.check_in_time || '',
      r.check_out_time || '',
      r.duration_minutes || '',
      r.status,
    ]);
    const csv = [header, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `attendance-${startDate}-to-${endDate}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout title="Attendance">
      <div className="page-header">
        <div>
          <h1>Company Attendance</h1>
          <p className="page-subtitle">{records.length} records in selected period</p>
        </div>
        <div className="page-actions">
          <button className="btn-outline" onClick={exportCSV} disabled={records.length === 0}>Export CSV</button>
        </div>
      </div>

      <div className="policy-notice">
        ⓘ <strong>Attendance Policy:</strong> Working hours are 9 AM – 6 PM. Less than 4 hours = absent, 4–8 hours = half day, 8+ hours = full day.
        Auto-absent applies at 11:59 PM if not marked.
      </div>

      <div className="filter-bar">
        <div className="form-group" style={{ margin: 0 }}>
          <label style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>From</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div className="form-group" style={{ margin: 0 }}>
          <label style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>To</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          <option value="present">Present</option>
          <option value="half_day">Half day</option>
          <option value="absent">Absent</option>
          <option value="on_leave">On leave</option>
        </select>
      </div>

      <div className="table-wrapper">
        {loading ? (
          <div className="loading">Loading attendance…</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Date</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Duration</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id}>
                  <td><strong>{r.first_name} {r.last_name}</strong></td>
                  <td>{r.department || '—'}</td>
                  <td>{new Date(r.date).toLocaleDateString()}</td>
                  <td>{r.check_in_time ? new Date(r.check_in_time).toLocaleTimeString() : '—'}</td>
                  <td>{r.check_out_time ? new Date(r.check_out_time).toLocaleTimeString() : '—'}</td>
                  <td>{r.duration_minutes ? `${Math.floor(r.duration_minutes / 60)}h ${r.duration_minutes % 60}m` : '—'}</td>
                  <td><StatusBadge status={r.status} /></td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr><td colSpan={7} className="empty-state">No attendance records in this period.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </DashboardLayout>
  );
};

export default HRAttendance;
