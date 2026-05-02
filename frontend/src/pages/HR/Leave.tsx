import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/Dashboard.css';

const HRLeave: React.FC = () => {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaves();
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
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (leaveId: number) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/leave/requests/${leaveId}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchLeaves();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to approve leave');
    }
  };

  const handleReject = async (leaveId: number) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/leave/requests/${leaveId}/reject`, {rejectionReason: reason}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchLeaves();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to reject leave');
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
          <a href="/hr/attendance" className="nav-item">Attendance</a>
          <a href="/hr/leave" className="nav-item active">Leave Management</a>
          <a href="/hr/performance" className="nav-item">Performance</a>
        </nav>
      </aside>
      <main className="main-content">
        <div className="topbar">
          <div className="topbar-left"><h2>Leave Management</h2></div>
          <div className="topbar-right">
            <div className="user-avatar">H</div>
          </div>
        </div>
        <div className="content-area">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Leave Requests</h3>
            </div>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Type</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {leaves.map((leave: any) => (
                    <tr key={leave.id}>
                      <td>{leave.first_name} {leave.last_name}</td>
                      <td>{leave.leave_type_name}</td>
                      <td>{new Date(leave.from_date).toLocaleDateString()}</td>
                      <td>{new Date(leave.to_date).toLocaleDateString()}</td>
                      <td><span className={`badge badge-${leave.status === 'approved' ? 'success' : leave.status === 'pending' ? 'warning' : 'danger'}`}>{leave.status}</span></td>
                      <td>
                        {leave.status === 'pending' && (
                          <>
                            <button className="btn-primary" onClick={() => handleApprove(leave.id)} style={{marginRight: '8px'}}>Approve</button>
                            <button className="btn-outline" onClick={() => handleReject(leave.id)}>Reject</button>
                          </>
                        )}
                      </td>
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

export default HRLeave;
