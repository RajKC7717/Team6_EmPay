import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/Dashboard.css';

const HRAttendance: React.FC = () => {
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/attendance/history', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAttendance(response.data.attendance);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">EmPay HRMS</div>
        </div>
        <nav className="sidebar-nav">
          <a href="/hr" className="nav-item">Dashboard</a>
          <a href="/hr/employees" className="nav-item">Employees</a>
          <a href="/hr/attendance" className="nav-item active">Attendance</a>
          <a href="/hr/leave" className="nav-item">Leave Management</a>
          <a href="/hr/performance" className="nav-item">Performance</a>
        </nav>
      </aside>
      <main className="main-content">
        <div className="topbar">
          <div className="topbar-left"><h2>Attendance Monitoring</h2></div>
          <div className="topbar-right">
            <div className="user-avatar">H</div>
          </div>
        </div>
        <div className="content-area">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Attendance Records</h3>
            </div>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Date</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((record: any) => (
                    <tr key={record.id}>
                      <td>{record.first_name} {record.last_name}</td>
                      <td>{new Date(record.date).toLocaleDateString()}</td>
                      <td>{record.check_in_time ? new Date(record.check_in_time).toLocaleTimeString() : '-'}</td>
                      <td>{record.check_out_time ? new Date(record.check_out_time).toLocaleTimeString() : '-'}</td>
                      <td><span className={`badge badge-${record.status === 'present' ? 'success' : 'warning'}`}>{record.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default HRAttendance;
