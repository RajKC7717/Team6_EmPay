import React from 'react';
import '../../styles/Dashboard.css';

const HRDashboard: React.FC = () => {
  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">EmPay HRMS</div>
        </div>
        <nav className="sidebar-nav">
          <a href="/hr" className="nav-item active">Dashboard</a>
          <a href="/hr/employees" className="nav-item">Employees</a>
          <a href="/hr/attendance" className="nav-item">Attendance</a>
          <a href="/hr/leave" className="nav-item">Leave Management</a>
          <a href="/hr/performance" className="nav-item">Performance</a>
        </nav>
      </aside>
      <main className="main-content">
        <div className="topbar">
          <div className="topbar-left"><h2>HR Dashboard</h2></div>
          <div className="topbar-right">
            <div className="user-avatar">H</div>
          </div>
        </div>
        <div className="content-area">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-title">Present Today</span>
                <div className="stat-card-icon" style={{background: '#d1fae5'}}>✓</div>
              </div>
              <div className="stat-card-value">0</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HRDashboard;
