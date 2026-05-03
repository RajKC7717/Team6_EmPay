import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { getUser } from '../api';
import '../styles/Topbar.css';

interface Props {
  title?: string;
}

interface AttendanceState {
  statusType: 'not_marked' | 'checked_in' | 'checked_out' | 'on_leave';
  onLeave?: boolean;
  leaveType?: string;
  attendance?: any;
}

const Topbar: React.FC<Props> = ({ title }) => {
  const navigate = useNavigate();
  const user = getUser();
  const role = user?.role as string | undefined;
  const isEmployee = role === 'employee';

  const [att, setAtt] = useState<AttendanceState | null>(null);
  const [busy, setBusy] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!isEmployee) return;
    fetchStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEmployee]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const fetchStatus = async () => {
    try {
      const r = await api.get('/attendance/status');
      setAtt(r.data);
    } catch {
      setAtt({ statusType: 'not_marked' });
    }
  };

  const handleAttendanceClick = async () => {
    if (!att || busy) return;
    if (att.onLeave) return;

    setBusy(true);
    try {
      if (att.statusType === 'not_marked') {
        await api.post('/attendance/checkin', {});
      } else if (att.statusType === 'checked_in') {
        await api.post('/attendance/checkout');
      }
      await fetchStatus();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Action failed');
    } finally {
      setBusy(false);
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch { /* ignore — token may already be expired */ }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Map attendance state to button presentation
  const renderAttendance = () => {
    if (!att) {
      return (
        <button className="att-pill att-loading" disabled>
          <span className="att-dot" />
          Loading…
        </button>
      );
    }

    if (att.onLeave) {
      return (
        <button className="att-pill att-leave" disabled title={att.leaveType || 'On leave'}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
          </svg>
          On Leave
        </button>
      );
    }

    if (att.statusType === 'checked_in') {
      return (
        <button
          className={`att-pill att-checked-in ${busy ? 'busy' : ''}`}
          onClick={handleAttendanceClick}
          disabled={busy}
          title="Click to check out"
        >
          <span className="att-dot" />
          Checked In · Click to Check Out
        </button>
      );
    }

    if (att.statusType === 'checked_out') {
      return (
        <button className="att-pill att-completed" disabled>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
          Day Completed
        </button>
      );
    }

    return (
      <button
        className={`att-pill att-not-marked ${busy ? 'busy' : ''}`}
        onClick={handleAttendanceClick}
        disabled={busy}
        title="Click to check in"
      >
        <span className="att-dot pulsing" />
        Not Marked · Check In
      </button>
    );
  };

  const initial = (user?.email || 'U').charAt(0).toUpperCase();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  return (
    <div className="topbar">
      <div className="topbar-left">
        {title && <h2 className="topbar-title">{title}</h2>}
        <span className="topbar-date">{dateStr} · {timeStr}</span>
      </div>

      <div className="topbar-right">
        {isEmployee && renderAttendance()}

        <div className="user-menu" ref={menuRef}>
          <button className="user-trigger" onClick={() => setMenuOpen(!menuOpen)}>
            <div className="user-avatar">{initial}</div>
            <div className="user-info">
              <div className="user-email">{user?.email}</div>
              <div className="user-role">{(user?.role || '').replace('_', ' ')}</div>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>

          {menuOpen && (
            <div className="user-dropdown fade-up">
              <button
                className="user-dropdown-item"
                onClick={() => {
                  setMenuOpen(false);
                  const base = role === 'hr_officer' ? 'hr' : role === 'payroll_officer' ? 'payroll' : role === 'admin' ? 'admin' : 'employee';
                  navigate(`/${base}/profile`);
                }}
              >
                <span className="dd-icon">◔</span>
                My Profile
              </button>
              <button
                className="user-dropdown-item"
                onClick={() => {
                  setMenuOpen(false);
                  navigate('/employee/policies');
                }}
              >
                <span className="dd-icon">◐</span>
                Company Policies
              </button>
              <div className="user-dropdown-sep" />
              <button className="user-dropdown-item danger" onClick={logout}>
                <span className="dd-icon">⏻</span>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Topbar;
