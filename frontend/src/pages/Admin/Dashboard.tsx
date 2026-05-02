import React from 'react';
import '../../styles/Dashboard.css';

const AdminDashboard: React.FC = () => {
  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">EmPay HRMS</div>
        </div>
        <nav className="sidebar-nav">
          <a href="/admin" className="nav-item active">Dashboard</a>
          <a href="/admin/employees" className="nav-item">Employees</a>
          <a href="/admin/users" className="nav-item">User Management</a>
          <a href="/admin/reports" className="nav-item">Reports</a>
          <a href="/admin/settings" className="nav-item">Settings</a>
        </nav>
      </aside>
      <main className="main-content">
        <div className="topbar">
          <div className="topbar-left"><h2>Admin Dashboard</h2></div>
          <div className="topbar-right">
            <div className="user-avatar">A</div>
          </div>
        </div>
        <div className="content-area">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-title">Total Employees</span>
                <div className="stat-card-icon" style={{background: '#eef2ff'}}>👥</div>
              </div>
              <div className="stat-card-value">0</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
