import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/Dashboard.css';

const EmployeeLeave: React.FC = () => {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    leaveTypeId: '',
    fromDate: '',
    toDate: '',
    reason: ''
  });

  useEffect(() => {
    fetchLeaves();
    fetchLeaveTypes();
  }, []);

  const fetchLeaves = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/leave/requests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLeaves(response.data.leaveRequests);
    } catch (error) {
      console.error('Error fetching leaves:', error);
    }
  };

  const fetchLeaveTypes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/leave/types', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLeaveTypes(response.data.leaveTypes || []);
    } catch (error) {
      console.error('Error fetching leave types:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/leave/requests', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowForm(false);
      setFormData({ leaveTypeId: '', fromDate: '', toDate: '', reason: '' });
      fetchLeaves();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to submit leave request');
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
          <a href="/employee/leave" className="nav-item active">Leave Requests</a>
          <a href="/employee/payslips" className="nav-item">Payslips</a>
          <a href="/employee/profile" className="nav-item">My Profile</a>
        </nav>
      </aside>
      <main className="main-content">
        <div className="topbar">
          <div className="topbar-left"><h2>Leave Requests</h2></div>
          <div className="topbar-right">
            <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
              {showForm ? 'Cancel' : 'New Request'}
            </button>
            <div className="user-avatar">E</div>
          </div>
        </div>
        <div className="content-area">
          {showForm && (
            <div className="card">
              <form onSubmit={handleSubmit} style={{display: 'grid', gap: '16px'}}>
                <div className="form-group">
                  <label>Leave Type</label>
                  <select value={formData.leaveTypeId} onChange={(e) => setFormData({...formData, leaveTypeId: e.target.value})} required>
                    <option value="">Select leave type</option>
                    {leaveTypes.map((type: any) => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>From Date</label>
                  <input type="date" value={formData.fromDate} onChange={(e) => setFormData({...formData, fromDate: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>To Date</label>
                  <input type="date" value={formData.toDate} onChange={(e) => setFormData({...formData, toDate: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Reason</label>
                  <textarea value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})} required></textarea>
                </div>
                <button type="submit" className="btn-primary">Submit Request</button>
              </form>
            </div>
          )}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">My Leave Requests</h3>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Days</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map((leave: any) => (
                  <tr key={leave.id}>
                    <td>{leave.leave_type_name}</td>
                    <td>{new Date(leave.from_date).toLocaleDateString()}</td>
                    <td>{new Date(leave.to_date).toLocaleDateString()}</td>
                    <td>{leave.days_requested}</td>
                    <td><span className={`badge badge-${leave.status === 'approved' ? 'success' : leave.status === 'pending' ? 'warning' : 'danger'}`}>{leave.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmployeeLeave;
