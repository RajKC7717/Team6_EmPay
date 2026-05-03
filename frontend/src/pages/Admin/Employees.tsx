import React, { useEffect, useState } from 'react';
import api from '../../api';
import DashboardLayout from '../../components/DashboardLayout';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import EmployeeFormModal from '../../components/EmployeeFormModal';
import EmployeeCards from '../../components/EmployeeCards';

const AdminEmployees: React.FC = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [credentials, setCredentials] = useState<{ loginId: string; password: string; email: string; name: string } | null>(null);
  const [view, setView] = useState<'cards' | 'list'>('cards');

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const r = await api.get('/employees');
      setEmployees(r.data.employees || []);
    } catch {
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEmployees(); }, []);

  const departments = Array.from(new Set(employees.map((e) => e.department).filter(Boolean)));

  const filtered = employees.filter((e) => {
    if (search && !`${e.first_name} ${e.last_name} ${e.email}`.toLowerCase().includes(search.toLowerCase())) return false;
    if (department && e.department !== department) return false;
    if (statusFilter && e.status !== statusFilter) return false;
    return true;
  });

  const handleDeactivate = async (id: number) => {
    if (!window.confirm('Deactivate this employee? Their login will be locked.')) return;
    try {
      await api.delete(`/employees/${id}`);
      fetchEmployees();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to deactivate');
    }
  };

  return (
    <DashboardLayout title="Employees">
      <div className="page-header">
        <div>
          <h1>Employee Directory</h1>
          <p className="page-subtitle">{employees.length} total · {employees.filter((e) => e.status === 'active').length} active</p>
        </div>
        <div className="page-actions">
          <button className="btn-primary" onClick={() => setAddOpen(true)}>+ Add Employee</button>
        </div>
      </div>

      <div className="tabs" style={{ marginBottom: 16 }}>
        <button className={`tab ${view === 'cards' ? 'active' : ''}`} onClick={() => setView('cards')}>🃏 Cards</button>
        <button className={`tab ${view === 'list' ? 'active' : ''}`} onClick={() => setView('list')}>📋 List</button>
      </div>

      {view === 'cards' ? (
        <EmployeeCards employees={employees} showSalary />
      ) : (
        <>
      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <select value={department} onChange={(e) => setDepartment(e.target.value)}>
          <option value="">All departments</option>
          {departments.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="table-wrapper">
        {loading ? (
          <div className="loading">Loading employees…</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Login ID</th>
                <th>Email</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Joining Date</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e.id}>
                  <td><strong>{e.first_name} {e.last_name}</strong></td>
                  <td><span className="login-id-highlight">{e.login_id || '—'}</span></td>
                  <td>{e.email}</td>
                  <td>{e.department}</td>
                  <td>{e.designation}</td>
                  <td>{e.date_of_joining ? new Date(e.date_of_joining).toLocaleDateString() : '—'}</td>
                  <td><StatusBadge status={e.status} /></td>
                  <td className="table-actions">
                    {e.status === 'active' && (
                      <button className="btn-secondary btn-sm" onClick={() => handleDeactivate(e.id)}>
                        Deactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="empty-state">No employees match your filters.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
        </>
      )}

      {addOpen && (
        <EmployeeFormModal
          onClose={() => setAddOpen(false)}
          onCreated={(creds) => {
            setAddOpen(false);
            if (creds) setCredentials(creds);
            fetchEmployees();
          }}
        />
      )}

      {credentials && (
        <Modal
          open
          title="Employee Created Successfully"
          onClose={() => setCredentials(null)}
          footer={<button className="btn-primary" onClick={() => setCredentials(null)}>Done</button>}
        >
          <div className="alert alert-success">
            ✓ Welcome email sent to {credentials.email} with login credentials.
          </div>
          <p style={{ marginBottom: 16 }}>Generated credentials for <strong>{credentials.name}</strong>:</p>
          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">Login ID</span>
              <span className="detail-value"><span className="login-id-highlight">{credentials.loginId}</span></span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Temporary Password</span>
              <span className="detail-value"><code style={{ background: 'var(--gray-100)', padding: '4px 8px', borderRadius: 4 }}>{credentials.password}</code></span>
            </div>
          </div>
          <div className="policy-notice" style={{ marginTop: 16 }}>
            ⓘ The employee must change their password on first login. Please share these credentials securely.
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
};

export default AdminEmployees;
