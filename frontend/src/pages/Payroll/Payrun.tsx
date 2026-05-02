import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/Dashboard.css';

const PayrollPayrun: React.FC = () => {
  const [payruns, setPayruns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    payPeriodMonth: new Date().getMonth() + 1,
    payPeriodYear: new Date().getFullYear()
  });

  useEffect(() => {
    fetchPayruns();
  }, []);

  const fetchPayruns = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/payroll/runs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPayruns(response.data.payruns || []);
    } catch (error) {
      console.error('Error fetching payruns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/payroll/runs', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowForm(false);
      fetchPayruns();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to create payrun');
    }
  };

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">EmPay HRMS</div>
        </div>
        <nav className="sidebar-nav">
          <a href="/payroll" className="nav-item">Dashboard</a>
          <a href="/payroll/payrun" className="nav-item active">Payroll Runs</a>
          <a href="/payroll/leave" className="nav-item">Leave Requests</a>
        </nav>
      </aside>
      <main className="main-content">
        <div className="topbar">
          <div className="topbar-left"><h2>Payroll Runs</h2></div>
          <div className="topbar-right">
            <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
              {showForm ? 'Cancel' : 'New Payrun'}
            </button>
            <div className="user-avatar">P</div>
          </div>
        </div>
        <div className="content-area">
          {showForm && (
            <div className="card">
              <form onSubmit={handleSubmit} style={{display: 'grid', gap: '16px'}}>
                <div className="form-group">
                  <label>Month</label>
                  <select value={formData.payPeriodMonth} onChange={(e) => setFormData({...formData, payPeriodMonth: parseInt(e.target.value)})}>
                    {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Year</label>
                  <input type="number" value={formData.payPeriodYear} onChange={(e) => setFormData({...formData, payPeriodYear: parseInt(e.target.value)})} />
                </div>
                <button type="submit" className="btn-primary">Generate Payrun</button>
              </form>
            </div>
          )}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Payroll History</h3>
            </div>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Period</th>
                    <th>Total Gross</th>
                    <th>Total Deductions</th>
                    <th>Total Net</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payruns.map((run: any) => (
                    <tr key={run.id}>
                      <td>{run.pay_period_month}/{run.pay_period_year}</td>
                      <td>₹{run.total_gross}</td>
                      <td>₹{run.total_deductions}</td>
                      <td>₹{run.total_net}</td>
                      <td><span className="badge badge-info">{run.status}</span></td>
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

export default PayrollPayrun;
