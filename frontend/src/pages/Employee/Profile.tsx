import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/Dashboard.css';

const EmployeeProfile: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await axios.get(`http://localhost:5000/api/employees/${user.employee_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(response.data.employee);
      setFormData(response.data.employee);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      await axios.put(`http://localhost:5000/api/employees/${user.employee_id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(formData);
      setEditing(false);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to update profile');
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
          <a href="/employee/payslips" className="nav-item">Payslips</a>
          <a href="/employee/profile" className="nav-item active">My Profile</a>
        </nav>
      </aside>
      <main className="main-content">
        <div className="topbar">
          <div className="topbar-left"><h2>My Profile</h2></div>
          <div className="topbar-right">
            <button className="btn-primary" onClick={() => editing ? handleSave() : setEditing(true)}>
              {editing ? 'Save' : 'Edit'}
            </button>
            <div className="user-avatar">E</div>
          </div>
        </div>
        <div className="content-area">
          {profile && (
            <div className="card">
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px'}}>
                <div>
                  <h3 style={{marginBottom: '16px', fontWeight: 600}}>Personal Information</h3>
                  <div className="form-group">
                    <label>First Name</label>
                    <input type="text" value={formData.first_name || ''} onChange={(e) => setFormData({...formData, first_name: e.target.value})} disabled={!editing} />
                  </div>
                  <div className="form-group">
                    <label>Last Name</label>
                    <input type="text" value={formData.last_name || ''} onChange={(e) => setFormData({...formData, last_name: e.target.value})} disabled={!editing} />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" value={formData.email || ''} disabled />
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input type="tel" value={formData.phone || ''} onChange={(e) => setFormData({...formData, phone: e.target.value})} disabled={!editing} />
                  </div>
                </div>
                <div>
                  <h3 style={{marginBottom: '16px', fontWeight: 600}}>Job Information</h3>
                  <div className="form-group">
                    <label>Department</label>
                    <input type="text" value={formData.department || ''} disabled />
                  </div>
                  <div className="form-group">
                    <label>Designation</label>
                    <input type="text" value={formData.designation || ''} disabled />
                  </div>
                  <div className="form-group">
                    <label>Date of Joining</label>
                    <input type="date" value={formData.date_of_joining || ''} disabled />
                  </div>
                  <div className="form-group">
                    <label>Employment Type</label>
                    <input type="text" value={formData.employment_type || ''} disabled />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default EmployeeProfile;
