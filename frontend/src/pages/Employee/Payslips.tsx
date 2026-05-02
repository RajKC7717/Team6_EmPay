import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/Dashboard.css';

const EmployeePayslips: React.FC = () => {
  const [payslips, setPayslips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayslips();
  }, []);

  const fetchPayslips = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/payroll/payslips', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPayslips(response.data.payslips || []);
    } catch (error) {
      console.error('Error fetching payslips:', error);
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
          <a href="/employee" className="nav-item">Dashboard</a>
          <a href="/employee/attendance" className="nav-item">My Attendance</a>
          <a href="/employee/leave" className="nav-item">Leave Requests</a>
          <a href="/employee/payslips" className="nav-item active">Payslips</a>
          <a href="/employee/profile" className="nav-item">My Profile</a>
        </nav>
      </aside>
      <main className="main-content">
        <div className="topbar">
          <div className="topbar-left"><h2>My Payslips</h2></div>
          <div className="topbar-right">
            <div className="user-avatar">E</div>
          </div>
        </div>
        <div className="content-area">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Payslip History</h3>
            </div>
            {loading ? (
              <p>Loading...</p>
            ) : payslips.length === 0 ? (
              <p>No payslips available</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Gross Salary</th>
                    <th>Deductions</th>
                    <th>Net Pay</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {payslips.map((slip: any) => (
                    <tr key={slip.id}>
                      <td>{new Date(slip.created_at).toLocaleDateString()}</td>
                      <td>₹{slip.gross_salary}</td>
                      <td>₹{slip.total_deductions}</td>
                      <td>₹{slip.net_pay}</td>
                      <td><button className="btn-outline">Download</button></td>
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

export default EmployeePayslips;
