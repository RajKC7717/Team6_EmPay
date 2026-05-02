import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FiLogOut, FiUser } from 'react-icons/fi';
import api from '../../api';
import './Topbar.css';

const Topbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAttendanceStatus();
  }, []);

  const fetchAttendanceStatus = async () => {
    try {
      const res = await api.get('/attendance/status');
      setIsCheckedIn(res.data.statusType === 'checked_in');
    } catch (err) {
      console.error('Failed to fetch attendance status', err);
    }
  };

  const handleAttendanceToggle = async () => {
    setLoading(true);
    try {
      if (isCheckedIn) {
        await api.post('/attendance/checkout');
      } else {
        await api.post('/attendance/checkin');
      }
      setIsCheckedIn(!isCheckedIn);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update attendance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <header className="topbar">
      <div className="topbar-search">
        {/* Placeholder for search */}
      </div>

      <div className="topbar-actions">
        <button 
          className={`btn-minimal attendance-toggle ${isCheckedIn ? 'checked-in' : ''}`}
          onClick={handleAttendanceToggle}
          disabled={loading}
        >
          <span className="status-dot"></span>
          {loading ? 'Updating...' : isCheckedIn ? 'Check Out' : 'Check In'}
        </button>

        <div className="user-profile">
          <div className="avatar">
            <FiUser />
          </div>
          <div className="user-info">
            <span className="user-name">{user?.email?.split('@')[0]}</span>
            <span className="user-role">{user?.role.replace('_', ' ')}</span>
          </div>
          
          <button className="logout-btn" onClick={logout} title="Logout">
            <FiLogOut />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
