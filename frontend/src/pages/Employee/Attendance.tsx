import React, { useEffect, useState } from 'react';
import api from '../../api';
import DashboardLayout from '../../components/DashboardLayout';
import StatusBadge from '../../components/StatusBadge';

const EmployeeAttendance: React.FC = () => {
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date(); d.setDate(1);
    return d.toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().slice(0, 10));

  const fetchData = async () => {
    setLoading(true);
    try {
      const r = await api.get('/attendance/history', { params: { startDate, endDate } });
      setAttendance(r.data.attendance || []);
    } catch { setAttendance([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [startDate, endDate]);

  const present = attendance.filter((a) => a.status === 'present').length;
  const absent = attendance.filter((a) => a.status === 'absent').length;
  const halfDay = attendance.filter((a) => a.status === 'half_day').length;
  const onLeave = attendance.filter((a) => a.status === 'on_leave').length;

  const formatTime = (t: string | null) => {
    if (!t) return '—';
    try { return new Date(t).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }); }
    catch { return '—'; }
  };

  return (
    <DashboardLayout title="My Attendance">
      <div className="page-header">
        <div>
          <h1>Attendance History</h1>
          <p className="page-subtitle">Your attendance records for the selected period</p>
        </div>
      </div>

      <div className="policy-notice">
        ⓘ <strong>Attendance Policy:</strong> Check-in before 10:00 AM. Duration ≥ 8h = Present, 4–8h = Half Day.
        Auto-absent at 11:59 PM for unmarked days.
      </div>

      <div className="filter-bar">
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>to</span>
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
      </div>

      <div className="stats-grid">
        <div className="stat-card fade-up">
          <div className="stat-card-header">
            <span className="stat-card-title">Total Days</span>
            <div className="stat-card-icon">◑</div>
          </div>
          <div className="stat-card-value">{attendance.length}</div>
        </div>
        <div className="stat-card fade-up delay-1">
          <div className="stat-card-header">
            <span className="stat-card-title">Present</span>
            <div className="stat-card-icon green">◐</div>
          </div>
          <div className="stat-card-value">{present}</div>
        </div>
        <div className="stat-card fade-up delay-2">
          <div className="stat-card-header">
            <span className="stat-card-title">Absent</span>
            <div className="stat-card-icon red">◔</div>
          </div>
          <div className="stat-card-value">{absent}</div>
        </div>
        <div className="stat-card fade-up delay-3">
          <div className="stat-card-header">
            <span className="stat-card-title">On Leave</span>
            <div className="stat-card-icon blue">✈</div>
          </div>
          <div className="stat-card-value">{onLeave}</div>
        </div>
        <div className="stat-card fade-up delay-4">
          <div className="stat-card-header">
            <span className="stat-card-title">Half Days</span>
            <div className="stat-card-icon amber">◓</div>
          </div>
          <div className="stat-card-value">{halfDay}</div>
        </div>
      </div>

      <div className="table-wrapper fade-up">
        {loading ? (
          <div className="loading">Loading attendance…</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Duration</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((a) => (
                <tr key={a.id}>
                  <td><strong>{new Date(a.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</strong></td>
                  <td>{formatTime(a.check_in_time)}</td>
                  <td>{formatTime(a.check_out_time)}</td>
                  <td>{a.work_duration ? `${Number(a.work_duration).toFixed(1)}h` : '—'}</td>
                  <td><StatusBadge status={a.status} /></td>
                </tr>
              ))}
              {attendance.length === 0 && (
                <tr><td colSpan={5} className="empty-state">No attendance records for this period.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </DashboardLayout>
  );
};

export default EmployeeAttendance;
