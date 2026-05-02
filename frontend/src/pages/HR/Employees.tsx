import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/Dashboard.css';

const HREmployees: React.FC = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    designation: '',
    dateOfJoining: '',
    basicWage: '',
    employmentType: 'full_time'
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/employees', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmployees(response.data.employees);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/employees', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowForm(false);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        department: '',
        designation: '',
        dateOfJoining: '',
        basicWage: '',
        employmentType: 'full_time'
      });
      fetchEmployees();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to create employee');
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
          <a href="/hr/employees" className="nav-item active">Employees</a>
          <a href="/hr/attendance" className="nav-item">Attendance</a>
          <a href="/hr/leave" className="nav-item">Leave Management</a>
          <a href="/hr/performance" className="nav-item">Performance</a>
        </nav>
      </aside>
      <main className="main-content">
        <div className="topbar">
          <div className="topbar-left"><h2>Employees</h2></div>
          <div className="topbar-right">
            <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
              {showForm ? 'Cancel' : 'Add Employee'}
            </button>
            <div className="user-avatar">H</div>
          </div>
        </div>
        <div className="content-area">
          {showForm && (
            <div className="card">
              <form onSubmit={handleSubmit} style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                <div className="form-group">
                  <label>First Name</label>
                  <input type="text" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input type="text" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Department</label>
                  <input type="text" value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Designation</label>
                  <input type="text" value={formData.designation} onChange={(e) => setFormData({...formData, designation: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Date of Joining</label>
                  <input type="date" value={formData.dateOfJoining} onChange={(e) => setFormData({...formData, dateOfJoining: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Basic Wage</label>
                  <input type="number" value={formData.basicWage} onChange={(e) => setFormData({...formData, basicWage: e.target.value})} required />
                </div>
                <button type="submit" className="btn-primary" style={{gridColumn: '1 / -1'}}>Create Employee</button>
              </form>
            </div>
          )}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Employee List</h3>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp: any) => (
                  <tr key={emp.id}>
                    <td>{emp.first_name} {emp.last_name}</td>
                    <td>{emp.email}</td>
                    <td>{emp.department}</td>
                    <td>{emp.designation}</td>
                    <td><span className="badge badge-success">{emp.status}</span></td>
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

export default HREmployees;
