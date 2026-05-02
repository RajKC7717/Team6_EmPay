import React from 'react';
import '../../styles/Dashboard.css';

const PayrollDashboard: React.FC = () => {
  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">EmPay HRMS</div>
        </div>
        <nav className="sidebar-nav">
          <a href="/payroll" className="nav-item active">Dashboard</a>
          <a href="/payroll/payrun" className="nav-item">Payroll Runs</a>
          <a href="/payroll/leave" className="nav-item">Leave Requests</a>
          <a href="/payroll/reports" className="nav-item">Reports</a>
        </nav>
      </aside>
      <main className="main-content">
        <div className="topbar">
          <div className="topbar-left"><h2>Payroll Dashboard</h2></div>
          <div className="topbar-right">
            <div className="user-avatar">P</div>
          </div>
        </div>
        <div className="content-area">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-title">Pending Leaves</span>
                <div className="stat-card-icon" style={{background: '#fef3c7'}}>⏳</div>
              </div>
              <div className="stat-card-value">0</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PayrollDashboard;
