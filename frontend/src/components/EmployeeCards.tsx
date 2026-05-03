import React, { useEffect, useMemo, useState } from 'react';
import api from '../api';
import '../styles/EmployeeCards.css';

interface Props {
  employees: any[];
  onAllocate?: (emp: any) => void;
  onView?: (emp: any) => void;
  showSalary?: boolean; // admin only
}

type CardStatus =
  | 'checked_in' | 'completed' | 'on_leave' | 'on_sick'
  | 'absent_uninformed' | 'not_yet' | 'holiday';

const isWeekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6;

const EmployeeCards: React.FC<Props> = ({ employees, onAllocate, onView, showSalary }) => {
  const [attendance, setAttendance] = useState<any[]>([]);
  const [now, setNow] = useState(new Date());
  const [sortBy, setSortBy] = useState<'name' | 'department' | 'check_in_time' | 'status'>('name');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<CardStatus | ''>('');

  const todayISO = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const fetchAttendance = async () => {
    try {
      const r = await api.get('/attendance/history', {
        params: { startDate: todayISO, endDate: todayISO },
      });
      setAttendance(r.data.attendance || []);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    fetchAttendance();
    const t = setInterval(() => { fetchAttendance(); setNow(new Date()); }, 60_000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cards = useMemo(() => {
    const today = new Date();
    const isHol = isWeekend(today); // simple holiday check
    const elevenAM = new Date(); elevenAM.setHours(11, 0, 0, 0);

    return employees.filter((e) => e.status === 'active').map((e) => {
      const att = attendance.find((a) => a.employee_id === e.id);
      let status: CardStatus = 'not_yet';
      let leaveType: string | null = null;

      if (isHol) {
        status = 'holiday';
      } else if (att?.status === 'on_leave') {
        leaveType = att.leave_type || 'Vacation';
        status = leaveType?.toLowerCase().includes('sick') ? 'on_sick' : 'on_leave';
      } else if (att?.check_in_time && !att?.check_out_time) {
        status = 'checked_in';
      } else if (att?.check_out_time) {
        status = 'completed';
      } else if (now > elevenAM) {
        status = 'absent_uninformed';
      } else {
        status = 'not_yet';
      }

      return { ...e, _att: att, _status: status, _leaveType: leaveType };
    });
  }, [employees, attendance, now]);

  const filtered = cards.filter((c) => {
    if (search && !`${c.first_name} ${c.last_name} ${c.email} ${c.department}`.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter && c._status !== statusFilter) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === 'name') return `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`);
    if (sortBy === 'department') return (a.department || '').localeCompare(b.department || '');
    if (sortBy === 'check_in_time') return (a._att?.check_in_time || 'zzz').localeCompare(b._att?.check_in_time || 'zzz');
    return a._status.localeCompare(b._status);
  });

  const summary = useMemo(() => {
    const counts = { checked_in: 0, completed: 0, on_leave: 0, on_sick: 0, absent_uninformed: 0, not_yet: 0, holiday: 0 } as Record<CardStatus, number>;
    cards.forEach((c) => { counts[c._status as CardStatus]++; });
    return counts;
  }, [cards]);

  return (
    <div>
      <div className="ec-summary">
        <SummaryPill color="var(--green-500)" icon="●" label="Present" count={summary.checked_in + summary.completed} active={statusFilter === ''} onClick={() => setStatusFilter('')} />
        <SummaryPill color="#3b82f6" icon="✔" label="Completed" count={summary.completed} active={statusFilter === 'completed'} onClick={() => setStatusFilter('completed')} />
        <SummaryPill color="#8b5cf6" icon="✈" label="On Vacation" count={summary.on_leave} active={statusFilter === 'on_leave'} onClick={() => setStatusFilter('on_leave')} />
        <SummaryPill color="var(--amber-500)" icon="⚕" label="Sick Leave" count={summary.on_sick} active={statusFilter === 'on_sick'} onClick={() => setStatusFilter('on_sick')} />
        <SummaryPill color="var(--red-500)" icon="●" label="Absent" count={summary.absent_uninformed} active={statusFilter === 'absent_uninformed'} onClick={() => setStatusFilter('absent_uninformed')} />
        <SummaryPill color="var(--gray-400)" icon="○" label="Not Marked" count={summary.not_yet} active={statusFilter === 'not_yet'} onClick={() => setStatusFilter('not_yet')} />
      </div>

      <div className="filter-bar">
        <input
          type="text"
          className="search-input"
          placeholder="Search by name, email, department…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
          <option value="name">Sort by Name</option>
          <option value="department">Sort by Department</option>
          <option value="check_in_time">Sort by Check-in</option>
          <option value="status">Sort by Status</option>
        </select>
      </div>

      <div className="ec-grid">
        {filtered.map((c) => (
          <EmployeeCard key={c.id} card={c} onAllocate={onAllocate} onView={onView} showSalary={showSalary} />
        ))}
        {filtered.length === 0 && (
          <div className="empty" style={{ gridColumn: '1 / -1' }}>
            <div className="empty-icon">○</div>
            <div className="empty-title">No employees match these filters</div>
          </div>
        )}
      </div>
    </div>
  );
};

const SummaryPill: React.FC<{ color: string; icon: string; label: string; count: number; active: boolean; onClick: () => void }> = ({ color, icon, label, count, active, onClick }) => (
  <button className={`ec-summary-pill ${active ? 'active' : ''}`} style={{ borderColor: active ? color : 'var(--border)' }} onClick={onClick}>
    <span style={{ color }}>{icon}</span>
    <span className="ec-summary-label">{label}</span>
    <span className="ec-summary-count">{count}</span>
  </button>
);

const STATUS_META: Record<CardStatus, { label: string; color: string; bg: string; icon: string }> = {
  checked_in:        { label: 'Checked In',        color: '#16a34a', bg: '#dcfce7', icon: '●' },
  completed:         { label: 'Day Completed',     color: '#1d4ed8', bg: '#dbeafe', icon: '✔' },
  on_leave:          { label: 'On Vacation',       color: '#7c3aed', bg: '#ede9fe', icon: '✈' },
  on_sick:           { label: 'Sick Leave',        color: '#d97706', bg: '#fef3c7', icon: '⚕' },
  absent_uninformed: { label: 'Uninformed Absence', color: '#dc2626', bg: '#fee2e2', icon: '●' },
  not_yet:           { label: 'Not Checked In',    color: '#6b7280', bg: '#f3f4f6', icon: '○' },
  holiday:           { label: 'Weekend / Holiday', color: '#6b7280', bg: '#f3f4f6', icon: '☼' },
};

const EmployeeCard: React.FC<{ card: any; onAllocate?: (e: any) => void; onView?: (e: any) => void; showSalary?: boolean }> = ({ card, onAllocate, onView, showSalary }) => {
  const meta = STATUS_META[card._status as CardStatus];
  const att = card._att;
  const initials = (card.first_name?.[0] || '') + (card.last_name?.[0] || '');
  const dotColor = card._status === 'checked_in' ? '#22c55e' :
                   card._status === 'completed' ? '#3b82f6' :
                   card._status === 'on_leave' ? '#8b5cf6' :
                   card._status === 'on_sick' ? '#f59e0b' :
                   card._status === 'absent_uninformed' ? '#ef4444' :
                   '#d1d5db';

  return (
    <div className="ec-card fade-up">
      <div className="ec-card-top">
        <div className="ec-avatar">
          {card.profile_photo_url ? (
            <img src={card.profile_photo_url} alt={initials} />
          ) : (
            <span>{initials.toUpperCase()}</span>
          )}
          <span className="ec-status-dot" style={{ background: dotColor }} />
        </div>
        <div className="ec-id">
          <span className="login-id-highlight" style={{ fontSize: 11 }}>{card.login_id || '—'}</span>
        </div>
      </div>

      <h3 className="ec-name">{card.first_name} {card.last_name}</h3>
      <p className="ec-meta">{card.designation} {card.department && <>· {card.department}</>}</p>

      <div className="ec-status" style={{ background: meta.bg, color: meta.color }}>
        <span>{meta.icon}</span>
        <span>{meta.label}</span>
      </div>

      {att?.check_in_time && (
        <div className="ec-detail">
          <div><span>Check-in</span><strong>{new Date(att.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong></div>
          {att.check_out_time && (
            <div><span>Check-out</span><strong>{new Date(att.check_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong></div>
          )}
          {att.duration_minutes && (
            <div><span>Duration</span><strong>{Math.floor(att.duration_minutes / 60)}h {att.duration_minutes % 60}m</strong></div>
          )}
        </div>
      )}

      {showSalary && card.basic_wage && (
        <div className="ec-salary">Basic Wage: ₹{Number(card.basic_wage).toLocaleString()}</div>
      )}

      <div className="ec-actions">
        {onView && <button className="btn-secondary btn-sm" onClick={() => onView(card)}>View</button>}
        {onAllocate && <button className="btn-outline btn-sm" onClick={() => onAllocate(card)}>Allocate Leave</button>}
      </div>
    </div>
  );
};

export default EmployeeCards;
