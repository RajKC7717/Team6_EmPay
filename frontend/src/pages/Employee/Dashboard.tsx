import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/Dashboard.css';

const EmployeeDashboard: React.FC = () => {
  const [attendanceStatus, setAttendanceStatus] = useState<any>(null);
  const [leaveBalance, setLeaveBalance] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAttendanceStatus();
    fetchLeaveBalance();
  }, []);

  const fetchAttendanceStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/attendance/status', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAttendanceStatus(response.data);
    } catch (error) {
      console.error('Error fetching attendance status:', error);
    }
  };

  const fetchLeaveBalance = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/leave/balance', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLeaveBalance(response.data.leaveBalances);
    } catch (error) {
      console.error('Error fetching leave balance:', error);
    }
  };

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/attendance/checkin', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAttendanceStatus();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Check-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/attendance/checkout', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAttendanceStatus();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Check-out failed');
    } finally {
      setLoading(false);
    }
  };

  const getAttendanceButton = () => {
    if (!attendanceStatus) return null;

    if (attendanceStatus.onLeave) {
      return (
        <button className="attendance-btn on-leave" disabled>
          ✈ On Leave
        </button>
      );
    }

    if (attendanceStatus.statusType === 'checked_in') {
      return (
        <button className="attendance-btn checked-in" onClick={handleCheckOut} disabled={loading}>
          ✓ Check Out
        </button>
      );
    }

    if (attendanceStatus.statusType === 'checked_out') {
      return (
        <button className="attendance-btn" disabled style={{background: '#64748b', color: 'white'}}>
          ✓ Completed
        </button>
      );
    }

    return (
      <button className="attendance-btn not-marked" onClick={handleCheckIn} disabled={loading}>
        ⚠ Check In
      </button>
    );
  };

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span>EmPay HRMS</span>
          </div>
        </div>
        <nav className="sidebar-nav">
          <a href="/employee" className="nav-item active">Dashboard</a>
          <a href="/employee/attendance" className="nav-item">My Attendance</a>
          <a href="/employee/leave" className="nav-item">Leave Requests</a>
          <a href="/employee/payslips" className="nav-item">Payslips</a>
          <a href="/employee/profile" className="nav-item">My Profile</a>
        </nav>
      </aside>

      <main className="main-content">
        <div className="topbar">
          <div className="topbar-left">
            <h2>Employee Dashboard</h2>
          </div>
          <div className="topbar-right">
            {getAttendanceButton()}
            <div className="user-menu">
              <div className="user-avatar">E</div>
            </div>
          </div>
        </div>

        <div className="content-area">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-title">Attendance Today</span>
                <div className="stat-card-icon" style={{background: '#eef2ff'}}>⏰</div>
              </div>
              <div className="stat-card-value">
                {attendanceStatus?.statusType === 'checked_in' ? 'Checked In' : 
                 attendanceStatus?.statusType === 'checked_out' ? 'Completed' :
                 attendanceStatus?.onLeave ? 'On Leave' : 'Not Marked'}
              </div>
            </div>

            {leaveBalance.map((leave: any) => (
              <div className="stat-card" key={leave.id}>
                <div className="stat-card-header">
                  <span className="stat-card-title">{leave.leave_type_name}</span>
                  <div className="stat-card-icon" style={{background: '#fef3c7'}}>📅</div>
                </div>
                <div className="stat-card-value">{leave.remaining_days}</div>
                <div className="stat-card-change">of {leave.total_days} days</div>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Quick Actions</h3>
            </div>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px'}}>
              <button className="btn-primary">Apply for Leave</button>
              <button className="btn-outline">View Payslips</button>
              <button className="btn-outline">Update Profile</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmployeeDashboard;
