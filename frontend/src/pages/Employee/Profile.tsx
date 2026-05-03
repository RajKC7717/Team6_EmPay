import React, { useEffect, useMemo, useState } from 'react';
import api, { getUser } from '../../api';
import DashboardLayout from '../../components/DashboardLayout';
import { computeSalaryComponents } from '../../utils/salary';
import '../../styles/Profile.css';

type Tab = 'resume' | 'private' | 'salary' | 'security';

interface SoftProfile {
  about?: string;
  loveAboutJob?: string;
  hobbies?: string;
  skills?: string[];
  certifications?: { title: string; year: string; issuer?: string }[];
}

const softProfileKey = (employeeId: number) => `empay_soft_profile_${employeeId}`;

const loadSoftProfile = (employeeId: number): SoftProfile => {
  const raw = localStorage.getItem(softProfileKey(employeeId));
  return raw ? JSON.parse(raw) : { skills: [], certifications: [] };
};

const saveSoftProfile = (employeeId: number, profile: SoftProfile) => {
  localStorage.setItem(softProfileKey(employeeId), JSON.stringify(profile));
};

const Profile: React.FC = () => {
  const user = getUser();
  const [tab, setTab] = useState<Tab>('resume');
  const [employee, setEmployee] = useState<any>(null);
  const [soft, setSoft] = useState<SoftProfile>({ skills: [], certifications: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedNote, setSavedNote] = useState<string | null>(null);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      // Use /employees (filtered for current user by backend) for safe lookup,
      // fallback to direct id endpoint if needed.
      const r = await api.get('/employees');
      const me = (r.data.employees || [])[0];
      setEmployee(me);
      if (me) setSoft(loadSoftProfile(me.id));
    } catch {
      try {
        const r = await api.get(`/employees/${user?.id}`);
        const me = r.data.employee || r.data;
        setEmployee(me);
        if (me) setSoft(loadSoftProfile(me.id));
      } catch { /* ignore */ }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const onSave = async (patch: any) => {
    if (!employee) return;
    setSaving(true);
    setSavedNote(null);
    try {
      await api.put(`/employees/${employee.id}`, patch);
      setSavedNote('Profile updated');
      fetchProfile();
    } catch (e: any) {
      alert(e.response?.data?.error || 'Failed to update');
    } finally {
      setSaving(false);
      setTimeout(() => setSavedNote(null), 2500);
    }
  };

  const onSoftSave = (patch: SoftProfile) => {
    if (!employee) return;
    const next = { ...soft, ...patch };
    setSoft(next);
    saveSoftProfile(employee.id, next);
    setSavedNote('Resume saved');
    setTimeout(() => setSavedNote(null), 2000);
  };

  if (loading) return <DashboardLayout title="My Profile"><div className="loading">Loading…</div></DashboardLayout>;
  if (!employee) return <DashboardLayout title="My Profile"><div className="empty"><div className="empty-title">Employee profile not found</div></div></DashboardLayout>;

  const initials = `${employee.first_name?.[0] || ''}${employee.last_name?.[0] || ''}`.toUpperCase();

  return (
    <DashboardLayout title="My Profile">
      <div className="profile-hero fade-up">
        <div className="profile-avatar-xl">
          {employee.profile_photo_url ? <img src={employee.profile_photo_url} alt={initials} /> : <span>{initials || 'U'}</span>}
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 24, marginBottom: 4 }}>{employee.first_name} {employee.last_name}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            {employee.designation} {employee.department && <>· {employee.department}</>}
          </p>
          <div style={{ display: 'flex', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
            <span className="login-id-highlight">{employee.login_id || '—'}</span>
            <span className="pill">{user?.email}</span>
            {employee.phone && <span className="pill">📞 {employee.phone}</span>}
          </div>
        </div>
        {savedNote && <div className="alert alert-success" style={{ margin: 0 }}>{savedNote}</div>}
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'resume' ? 'active' : ''}`} onClick={() => setTab('resume')}>Resume</button>
        <button className={`tab ${tab === 'private' ? 'active' : ''}`} onClick={() => setTab('private')}>Private Info</button>
        <button className={`tab ${tab === 'salary' ? 'active' : ''}`} onClick={() => setTab('salary')}>Salary Info</button>
        <button className={`tab ${tab === 'security' ? 'active' : ''}`} onClick={() => setTab('security')}>Security</button>
      </div>

      {tab === 'resume' && <ResumeTab soft={soft} onSave={onSoftSave} />}
      {tab === 'private' && <PrivateTab employee={employee} onSave={onSave} saving={saving} />}
      {tab === 'salary' && <SalaryTab employee={employee} />}
      {tab === 'security' && <SecurityTab />}
    </DashboardLayout>
  );
};

const ResumeTab: React.FC<{ soft: SoftProfile; onSave: (s: SoftProfile) => void }> = ({ soft, onSave }) => {
  const [about, setAbout] = useState(soft.about || '');
  const [love, setLove] = useState(soft.loveAboutJob || '');
  const [hobbies, setHobbies] = useState(soft.hobbies || '');
  const [skillInput, setSkillInput] = useState('');
  const [certTitle, setCertTitle] = useState('');
  const [certYear, setCertYear] = useState('');
  const [certIssuer, setCertIssuer] = useState('');

  const addSkill = () => {
    const v = skillInput.trim();
    if (!v) return;
    onSave({ skills: [...(soft.skills || []), v] });
    setSkillInput('');
  };

  const removeSkill = (s: string) => onSave({ skills: (soft.skills || []).filter((x) => x !== s) });

  const addCert = () => {
    if (!certTitle) return;
    onSave({ certifications: [...(soft.certifications || []), { title: certTitle, year: certYear, issuer: certIssuer }] });
    setCertTitle(''); setCertYear(''); setCertIssuer('');
  };

  return (
    <div className="card-grid">
      <div className="card">
        <div className="card-header"><h3 className="card-title">About</h3></div>
        <div className="form-group">
          <label>About me</label>
          <textarea value={about} onChange={(e) => setAbout(e.target.value)} onBlur={() => onSave({ about })} placeholder="Tell us about yourself…" />
        </div>
        <div className="form-group">
          <label>What I love about my job</label>
          <textarea value={love} onChange={(e) => setLove(e.target.value)} onBlur={() => onSave({ loveAboutJob: love })} />
        </div>
        <div className="form-group">
          <label>Interests & hobbies</label>
          <textarea value={hobbies} onChange={(e) => setHobbies(e.target.value)} onBlur={() => onSave({ hobbies })} />
        </div>
      </div>

      <div>
        <div className="card">
          <div className="card-header"><h3 className="card-title">Skills</h3></div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
            {(soft.skills || []).map((s) => (
              <span key={s} className="pill" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                {s}
                <button onClick={() => removeSkill(s)} style={{ color: 'var(--red-600)', fontWeight: 700 }}>×</button>
              </span>
            ))}
            {(soft.skills || []).length === 0 && <span className="form-hint">No skills added yet.</span>}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') addSkill(); }}
              placeholder="e.g., React"
              style={{ flex: 1, padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 8 }}
            />
            <button className="btn-primary btn-sm" onClick={addSkill}>Add</button>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3 className="card-title">Certifications</h3></div>
          {(soft.certifications || []).length === 0 && <div className="form-hint" style={{ marginBottom: 12 }}>No certifications yet.</div>}
          {(soft.certifications || []).map((c, i) => (
            <div key={i} style={{ padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, marginBottom: 8 }}>
              <div style={{ fontWeight: 600 }}>{c.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.issuer ? `${c.issuer} · ` : ''}{c.year}</div>
            </div>
          ))}
          <div className="form-row">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <input value={certTitle} onChange={(e) => setCertTitle(e.target.value)} placeholder="AWS Certified" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <input value={certYear} onChange={(e) => setCertYear(e.target.value)} placeholder="2025" />
            </div>
          </div>
          <div className="form-group">
            <input value={certIssuer} onChange={(e) => setCertIssuer(e.target.value)} placeholder="Issuer (optional)" />
          </div>
          <button className="btn-primary btn-sm" onClick={addCert}>Add certification</button>
        </div>
      </div>
    </div>
  );
};

const PrivateTab: React.FC<{ employee: any; onSave: (patch: any) => void; saving: boolean }> = ({ employee, onSave, saving }) => {
  const [phone, setPhone] = useState(employee.phone || '');
  const [address, setAddress] = useState(employee.address || '');
  const [emergencyName, setEmergencyName] = useState(employee.emergency_contact_name || '');
  const [emergencyPhone, setEmergencyPhone] = useState(employee.emergency_contact_phone || '');
  const [bankAcc, setBankAcc] = useState(employee.bank_account_number || '');
  const [ifsc, setIfsc] = useState(employee.bank_ifsc_code || '');

  const save = () => onSave({
    phone, address,
    emergency_contact_name: emergencyName,
    emergency_contact_phone: emergencyPhone,
    bank_account_number: bankAcc,
    bank_ifsc_code: ifsc,
  });

  return (
    <div className="card">
      <div className="card-header"><h3 className="card-title">Personal Information</h3></div>
      <div className="form-row">
        <div className="form-group">
          <label>Date of Birth</label>
          <input value={employee.date_of_birth || '—'} disabled />
          <span className="form-hint">Edit by HR only</span>
        </div>
        <div className="form-group">
          <label>Gender</label>
          <input value={employee.gender || '—'} disabled />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Phone</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Address</label>
          <input value={address} onChange={(e) => setAddress(e.target.value)} />
        </div>
      </div>
      <h4 style={{ marginTop: 14, marginBottom: 12, fontSize: 13, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Emergency Contact</h4>
      <div className="form-row">
        <div className="form-group">
          <label>Name</label>
          <input value={emergencyName} onChange={(e) => setEmergencyName(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Phone</label>
          <input value={emergencyPhone} onChange={(e) => setEmergencyPhone(e.target.value)} />
        </div>
      </div>
      <h4 style={{ marginTop: 14, marginBottom: 12, fontSize: 13, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Bank Details</h4>
      <div className="form-row">
        <div className="form-group">
          <label>Account Number</label>
          <input value={bankAcc} onChange={(e) => setBankAcc(e.target.value)} />
        </div>
        <div className="form-group">
          <label>IFSC Code</label>
          <input value={ifsc} onChange={(e) => setIfsc(e.target.value.toUpperCase())} />
        </div>
      </div>
      <button className="btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
    </div>
  );
};

const SalaryTab: React.FC<{ employee: any }> = ({ employee }) => {
  const components = useMemo(() => computeSalaryComponents(Number(employee?.basic_wage || 0)), [employee]);
  return (
    <div className="card">
      <div className="card-header"><h3 className="card-title">Compensation</h3></div>
      <div className="detail-grid" style={{ marginBottom: 18 }}>
        <div className="detail-item"><span className="detail-label">Wage Type</span><span className="detail-value">Fixed Wage</span></div>
        <div className="detail-item"><span className="detail-label">Basic Wage</span><span className="detail-value">₹{Number(employee.basic_wage || 0).toLocaleString()}</span></div>
        <div className="detail-item"><span className="detail-label">Salary Structure</span><span className="detail-value">Regular Pay</span></div>
        <div className="detail-item"><span className="detail-label">PF Applicable</span><span className="detail-value">{employee.pf_applicable ? 'Yes' : 'No'}</span></div>
        <div className="detail-item"><span className="detail-label">Professional Tax</span><span className="detail-value">{employee.professional_tax_applicable ? 'Yes' : 'No'}</span></div>
      </div>
      <h4 style={{ marginBottom: 10, fontSize: 13, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Component Breakdown</h4>
      <div className="table-wrapper">
        <table className="table">
          <thead><tr><th>Component</th><th style={{ textAlign: 'right' }}>Monthly</th><th style={{ textAlign: 'right' }}>Yearly</th></tr></thead>
          <tbody>
            <tr><td>Basic Salary</td><td style={{ textAlign: 'right' }}>₹{components.basic.toLocaleString()}</td><td style={{ textAlign: 'right' }}>₹{(components.basic * 12).toLocaleString()}</td></tr>
            <tr><td>HRA</td><td style={{ textAlign: 'right' }}>₹{components.hra.toLocaleString()}</td><td style={{ textAlign: 'right' }}>₹{(components.hra * 12).toLocaleString()}</td></tr>
            <tr><td>Standard Allowance</td><td style={{ textAlign: 'right' }}>₹{components.standardAllowance.toLocaleString()}</td><td style={{ textAlign: 'right' }}>₹{(components.standardAllowance * 12).toLocaleString()}</td></tr>
            <tr><td>Performance Bonus</td><td style={{ textAlign: 'right' }}>₹{components.performanceBonus.toLocaleString()}</td><td style={{ textAlign: 'right' }}>₹{(components.performanceBonus * 12).toLocaleString()}</td></tr>
            <tr><td>LTA</td><td style={{ textAlign: 'right' }}>₹{components.lta.toLocaleString()}</td><td style={{ textAlign: 'right' }}>₹{(components.lta * 12).toLocaleString()}</td></tr>
            <tr><td>Fixed Allowance</td><td style={{ textAlign: 'right' }}>₹{components.fixedAllowance.toLocaleString()}</td><td style={{ textAlign: 'right' }}>₹{(components.fixedAllowance * 12).toLocaleString()}</td></tr>
            <tr style={{ background: 'var(--accent-soft)' }}>
              <td><strong>Gross Salary</strong></td>
              <td style={{ textAlign: 'right' }}><strong>₹{components.gross.toLocaleString()}</strong></td>
              <td style={{ textAlign: 'right' }}><strong>₹{(components.gross * 12).toLocaleString()}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="policy-notice" style={{ marginTop: 16 }}>
        ⓘ For TDS computation, declarations and tax regime selection, visit{' '}
        <a href="/employee/tax">Income Tax</a>.
      </div>
    </div>
  );
};

const SecurityTab: React.FC = () => {
  const user = getUser();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const change = async () => {
    setMsg(null);
    if (!current || !next) { setMsg({ type: 'error', text: 'All fields required' }); return; }
    if (next !== confirm) { setMsg({ type: 'error', text: 'Passwords do not match' }); return; }
    if (next.length < 8) { setMsg({ type: 'error', text: 'Min 8 characters' }); return; }
    setBusy(true);
    try {
      await api.post('/auth/change-password', { currentPassword: current, newPassword: next, confirmPassword: confirm });
      setMsg({ type: 'success', text: 'Password updated successfully' });
      setCurrent(''); setNext(''); setConfirm('');
    } catch (e: any) {
      setMsg({ type: 'error', text: e.response?.data?.error || 'Failed to update' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card-grid">
      <div className="card">
        <div className="card-header"><h3 className="card-title">Change Password</h3></div>
        {msg && <div className={`alert alert-${msg.type === 'error' ? 'error' : 'success'}`}>{msg.text}</div>}
        <div className="form-group">
          <label>Current Password</label>
          <input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} />
        </div>
        <div className="form-group">
          <label>New Password</label>
          <input type="password" value={next} onChange={(e) => setNext(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Confirm New Password</label>
          <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </div>
        <button className="btn-primary" onClick={change} disabled={busy}>{busy ? 'Updating…' : 'Update Password'}</button>
      </div>
      <div className="card">
        <div className="card-header"><h3 className="card-title">Account Info</h3></div>
        <div className="detail-grid" style={{ gridTemplateColumns: '1fr' }}>
          <div className="detail-item"><span className="detail-label">Email</span><span className="detail-value">{user?.email}</span></div>
          <div className="detail-item"><span className="detail-label">Role</span><span className="detail-value" style={{ textTransform: 'capitalize' }}>{(user?.role || '').replace('_', ' ')}</span></div>
          <div className="detail-item"><span className="detail-label">User ID</span><span className="detail-value">{user?.id}</span></div>
          <div className="detail-item"><span className="detail-label">Last Login</span><span className="detail-value">{new Date().toLocaleString()}</span></div>
        </div>
        <div className="policy-notice" style={{ marginTop: 14 }}>
          ⓘ Active sessions and revocation will be available once backend session tracking is enabled.
        </div>
      </div>
    </div>
  );
};

export default Profile;
