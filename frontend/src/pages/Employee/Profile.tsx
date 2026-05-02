import React, { useEffect, useState } from 'react';
import api, { getUser } from '../../api';
import DashboardLayout from '../../components/DashboardLayout';

const EmployeeProfile: React.FC = () => {
  const user = getUser();
  const [employee, setEmployee] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ phone: '', address: '', emergencyContactName: '', emergencyContactPhone: '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [pwMsg, setPwMsg] = useState<string | null>(null);
  const [pwErr, setPwErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get(`/employees/${user?.id}`).then((r) => {
      const e = r.data.employee || r.data;
      setEmployee(e);
      setForm({ phone: e.phone || '', address: e.address || '', emergencyContactName: e.emergency_contact_name || '', emergencyContactPhone: e.emergency_contact_phone || '' });
    }).catch(() => {}).finally(() => setLoading(false));
  }, [user?.id]);

  const saveProfile = async () => {
    setErr(null); setMsg(null); setBusy(true);
    try {
      await api.put(`/employees/${user?.id}`, form);
      setMsg('Profile updated successfully!');
      setEditing(false);
    } catch (e: any) { setErr(e.response?.data?.error || 'Failed to update'); }
    finally { setBusy(false); }
  };

  const changePassword = async () => {
    setPwErr(null); setPwMsg(null);
    if (!pwForm.currentPassword || !pwForm.newPassword || !pwForm.confirmPassword) { setPwErr('Fill all fields'); return; }
    if (pwForm.newPassword !== pwForm.confirmPassword) { setPwErr('Passwords do not match'); return; }
    if (pwForm.newPassword.length < 6) { setPwErr('Password must be at least 6 characters'); return; }
    setBusy(true);
    try {
      await api.post('/auth/change-password', pwForm);
      setPwMsg('Password changed successfully!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (e: any) { setPwErr(e.response?.data?.error || 'Failed to change password'); }
    finally { setBusy(false); }
  };

  if (loading) return <DashboardLayout title="My Profile"><div className="loading">Loading…</div></DashboardLayout>;
  if (!employee) return <DashboardLayout title="My Profile"><div className="empty"><div className="empty-icon">◔</div><div className="empty-title">Profile not found</div></div></DashboardLayout>;

  return (
    <DashboardLayout title="My Profile">
      <div className="page-header">
        <div><h1>My Profile</h1><p className="page-subtitle">View and manage your personal information</p></div>
      </div>

      <div className="profile-section fade-up">
        <h3>Job Information</h3>
        <div className="detail-grid">
          <div className="detail-item"><span className="detail-label">Name</span><span className="detail-value">{employee.first_name} {employee.last_name}</span></div>
          <div className="detail-item"><span className="detail-label">Email</span><span className="detail-value">{employee.email}</span></div>
          <div className="detail-item"><span className="detail-label">Login ID</span><span className="detail-value"><span className="login-id-highlight">{employee.login_id || '—'}</span></span></div>
          <div className="detail-item"><span className="detail-label">Department</span><span className="detail-value">{employee.department}</span></div>
          <div className="detail-item"><span className="detail-label">Designation</span><span className="detail-value">{employee.designation}</span></div>
          <div className="detail-item"><span className="detail-label">Joining Date</span><span className="detail-value">{employee.date_of_joining ? new Date(employee.date_of_joining).toLocaleDateString() : '—'}</span></div>
          <div className="detail-item"><span className="detail-label">Employment Type</span><span className="detail-value">{(employee.employment_type || '').replace(/_/g, ' ')}</span></div>
        </div>
      </div>

      <div className="profile-section fade-up delay-1">
        <h3>Personal Details {!editing && <button className="btn-secondary btn-sm" style={{marginLeft:12}} onClick={() => setEditing(true)}>Edit</button>}</h3>
        {err && <div className="alert alert-error">{err}</div>}
        {msg && <div className="alert alert-success">{msg}</div>}
        {editing ? (
          <>
            <div className="form-row">
              <div className="form-group"><label>Phone</label><input value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} /></div>
              <div className="form-group"><label>Emergency Contact Name</label><input value={form.emergencyContactName} onChange={(e) => setForm({...form, emergencyContactName: e.target.value})} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Emergency Contact Phone</label><input value={form.emergencyContactPhone} onChange={(e) => setForm({...form, emergencyContactPhone: e.target.value})} /></div>
            </div>
            <div className="form-group"><label>Address</label><textarea value={form.address} onChange={(e) => setForm({...form, address: e.target.value})} /></div>
            <div style={{display:'flex',gap:10}}>
              <button className="btn-primary" onClick={saveProfile} disabled={busy}>{busy ? 'Saving…' : 'Save Changes'}</button>
              <button className="btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </>
        ) : (
          <div className="detail-grid">
            <div className="detail-item"><span className="detail-label">Phone</span><span className="detail-value">{employee.phone || '—'}</span></div>
            <div className="detail-item"><span className="detail-label">Address</span><span className="detail-value">{employee.address || '—'}</span></div>
            <div className="detail-item"><span className="detail-label">Emergency Contact</span><span className="detail-value">{employee.emergency_contact_name || '—'} · {employee.emergency_contact_phone || '—'}</span></div>
          </div>
        )}
      </div>

      <div className="profile-section fade-up delay-2">
        <h3>Change Password</h3>
        {pwErr && <div className="alert alert-error">{pwErr}</div>}
        {pwMsg && <div className="alert alert-success">{pwMsg}</div>}
        <div className="form-row">
          <div className="form-group"><label>Current Password</label><input type="password" value={pwForm.currentPassword} onChange={(e) => setPwForm({...pwForm, currentPassword: e.target.value})} /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>New Password</label><input type="password" value={pwForm.newPassword} onChange={(e) => setPwForm({...pwForm, newPassword: e.target.value})} /></div>
          <div className="form-group"><label>Confirm New Password</label><input type="password" value={pwForm.confirmPassword} onChange={(e) => setPwForm({...pwForm, confirmPassword: e.target.value})} /></div>
        </div>
        <button className="btn-primary" onClick={changePassword} disabled={busy}>{busy ? 'Changing…' : 'Change Password'}</button>
      </div>
    </DashboardLayout>
  );
};

export default EmployeeProfile;
