import React, { useEffect, useState } from 'react';
import api from '../../api';
import DashboardLayout from '../../components/DashboardLayout';
import StatusBadge from '../../components/StatusBadge';
import EmployeeFormModal from '../../components/EmployeeFormModal';
import Modal from '../../components/Modal';
import EmployeeCards from '../../components/EmployeeCards';

const HREmployees: React.FC = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [credentials, setCredentials] = useState<any>(null);
  const [allocateFor, setAllocateFor] = useState<any | null>(null);
  const [view, setView] = useState<'cards' | 'list'>('cards');

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const r = await api.get('/employees');
      setEmployees(r.data.employees || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEmployees(); }, []);

  const departments = Array.from(new Set(employees.map((e) => e.department).filter(Boolean)));
  const filtered = employees.filter((e) => {
    if (search && !`${e.first_name} ${e.last_name} ${e.email}`.toLowerCase().includes(search.toLowerCase())) return false;
    if (department && e.department !== department) return false;
    return true;
  });

  return (
    <DashboardLayout title="Employees">
      <div className="page-header">
        <div>
          <h1>Employee Directory</h1>
          <p className="page-subtitle">{employees.length} employees · {departments.length} departments</p>
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
        <EmployeeCards
          employees={employees}
          onAllocate={(e) => setAllocateFor(e)}
        />
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
      </div>

      <div className="table-wrapper">
        {loading ? (
          <div className="loading">Loading…</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Login ID</th>
                <th>Email</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Joined</th>
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
                    <button className="btn-secondary btn-sm" onClick={() => setAllocateFor(e)}>Allocate Leave</button>
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
          onCreated={(creds) => { setAddOpen(false); if (creds) setCredentials(creds); fetchEmployees(); }}
        />
      )}

      {credentials && (
        <Modal
          open
          title="Employee Created"
          onClose={() => setCredentials(null)}
          footer={<button className="btn-primary" onClick={() => setCredentials(null)}>Done</button>}
        >
          <div className="alert alert-success">✓ Welcome email sent to {credentials.email}.</div>
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
        </Modal>
      )}

      {allocateFor && (
        <AllocateLeaveModal employee={allocateFor} onClose={() => setAllocateFor(null)} />
      )}
    </DashboardLayout>
  );
};

const AllocateLeaveModal: React.FC<{ employee: any; onClose: () => void }> = ({ employee, onClose }) => {
  const [leaveTypes, setLeaveTypes] = useState<any[]>([]);
  const [leaveTypeId, setLeaveTypeId] = useState<number | ''>('');
  const [days, setDays] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get('/leave/balance').then((r) => {
      setLeaveTypes(r.data.leaveBalances || []);
    }).catch(() => {});
  }, []);

  const submit = async () => {
    setError(null); setSuccess(null);
    if (!leaveTypeId || !days || Number(days) <= 0) {
      setError('Please pick a leave type and positive day count');
      return;
    }
    setBusy(true);
    try {
      await api.post('/leave/allocate', {
        employeeId: employee.id,
        leaveTypeId,
        totalDays: Number(days),
        validityYear: year,
      });
      setSuccess(`Allocated ${days} days successfully`);
      setDays('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to allocate');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open
      title={`Allocate Leave — ${employee.first_name} ${employee.last_name}`}
      onClose={onClose}
      footer={
        <>
          <button className="btn-secondary" onClick={onClose}>Close</button>
          <button className="btn-primary" onClick={submit} disabled={busy}>{busy ? 'Saving…' : 'Allocate'}</button>
        </>
      }
    >
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="form-group">
        <label>Leave Type</label>
        <select value={leaveTypeId} onChange={(e) => setLeaveTypeId(Number(e.target.value))}>
          <option value="">Select…</option>
          {leaveTypes.map((lt: any) => (
            <option key={lt.leave_type_id} value={lt.leave_type_id}>
              {lt.leave_type_name} {lt.is_paid ? '(paid)' : '(unpaid)'}
            </option>
          ))}
        </select>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Days to Allocate</label>
          <input type="number" min={1} value={days} onChange={(e) => setDays(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Validity Year</label>
          <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} />
        </div>
      </div>

      <div className="policy-notice">
        ⓘ If an allocation already exists for this leave type and year, days will be added to the existing balance.
      </div>
    </Modal>
  );
};

export default HREmployees;
