import React, { useEffect, useState } from 'react';
import api from '../../api';
import DashboardLayout from '../../components/DashboardLayout';
import StatusBadge from '../../components/StatusBadge';
import { computeSalaryComponents } from '../../utils/salary';
import { fileToDataUrl, getCompanyLogo, getCompanyName, setCompanyLogo, setCompanyName } from '../../utils/companyBranding';

type Tab = 'users' | 'company' | 'salary' | 'leave' | 'attendance' | 'payroll' | 'holidays';

const SETTINGS_KEY = 'empay_settings';

interface SettingsState {
  salary: { name: string; base: number; basicPct: number; hraPct: number; sa: number; pbPct: number; ltaPct: number };
  leaveTypes: { id: string; name: string; isPaid: boolean; defaultDays: number; carryForward: boolean; maxCfDays: number; requiresAttachment: boolean }[];
  attendance: { graceMinutes: number; halfDayHours: number; fullDayHours: number; autoAbsentTime: string; allowRemote: boolean; blockNonOffice: boolean; ipRanges: { id: string; name: string; cidr: string; active: boolean }[]; workingDays: boolean[] };
  payroll: { pfRate: number; pfCeiling: number; ptStateSlab: { gross: number; tax: number }[]; payrunDay: number; financialYearStart: string };
  holidays: { id: string; name: string; date: string; optional: boolean }[];
}

const DEFAULTS: SettingsState = {
  salary: { name: 'Regular Pay', base: 50000, basicPct: 50, hraPct: 50, sa: 4167, pbPct: 8.33, ltaPct: 8.333 },
  leaveTypes: [
    { id: 'pto', name: 'Paid Time Off', isPaid: true, defaultDays: 18, carryForward: true, maxCfDays: 5, requiresAttachment: false },
    { id: 'sick', name: 'Sick Leave', isPaid: true, defaultDays: 6, carryForward: false, maxCfDays: 0, requiresAttachment: true },
    { id: 'unpaid', name: 'Unpaid Leave', isPaid: false, defaultDays: 0, carryForward: false, maxCfDays: 0, requiresAttachment: false },
  ],
  attendance: {
    graceMinutes: 10, halfDayHours: 4, fullDayHours: 8, autoAbsentTime: '23:59',
    allowRemote: true, blockNonOffice: false,
    ipRanges: [{ id: '1', name: 'Main Office', cidr: '192.168.1.0/24', active: true }],
    workingDays: [false, true, true, true, true, true, false], // Sun-Sat
  },
  payroll: {
    pfRate: 12, pfCeiling: 15000,
    ptStateSlab: [{ gross: 7500, tax: 0 }, { gross: 10000, tax: 175 }, { gross: 999999, tax: 200 }],
    payrunDay: 28, financialYearStart: 'April',
  },
  holidays: [
    { id: '1', name: 'Republic Day', date: '2026-01-26', optional: false },
    { id: '2', name: 'Independence Day', date: '2026-08-15', optional: false },
    { id: '3', name: 'Diwali', date: '2026-11-08', optional: false },
  ],
};

const loadSettings = (): SettingsState => {
  const raw = localStorage.getItem(SETTINGS_KEY);
  if (!raw) return DEFAULTS;
  try { return { ...DEFAULTS, ...JSON.parse(raw) }; } catch { return DEFAULTS; }
};

const saveSettings = (s: SettingsState) => localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));

const Settings: React.FC = () => {
  const [tab, setTab] = useState<Tab>('users');
  const [settings, setSettings] = useState<SettingsState>(loadSettings());
  const [savedNote, setSavedNote] = useState<string | null>(null);

  const persist = (next: SettingsState) => {
    setSettings(next);
    saveSettings(next);
    setSavedNote('Saved');
    setTimeout(() => setSavedNote(null), 1500);
  };

  return (
    <DashboardLayout title="Settings">
      <div className="page-header">
        <div>
          <h1>Settings</h1>
          <p className="page-subtitle">Configure company-wide settings, structures, and policies</p>
        </div>
        {savedNote && <span className="alert alert-success" style={{ margin: 0 }}>✓ {savedNote}</span>}
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'users' ? 'active' : ''}`} onClick={() => setTab('users')}>User Management</button>
        <button className={`tab ${tab === 'company' ? 'active' : ''}`} onClick={() => setTab('company')}>Company Profile</button>
        <button className={`tab ${tab === 'salary' ? 'active' : ''}`} onClick={() => setTab('salary')}>Salary Structure</button>
        <button className={`tab ${tab === 'leave' ? 'active' : ''}`} onClick={() => setTab('leave')}>Leave Policy</button>
        <button className={`tab ${tab === 'attendance' ? 'active' : ''}`} onClick={() => setTab('attendance')}>Attendance Config</button>
        <button className={`tab ${tab === 'payroll' ? 'active' : ''}`} onClick={() => setTab('payroll')}>Payroll Config</button>
        <button className={`tab ${tab === 'holidays' ? 'active' : ''}`} onClick={() => setTab('holidays')}>Holiday Calendar</button>
      </div>

      {tab === 'users' && <UsersTab />}
      {tab === 'company' && <CompanyTab onSaved={() => persist(settings)} />}
      {tab === 'salary' && <SalaryTab settings={settings} persist={persist} />}
      {tab === 'leave' && <LeaveTab settings={settings} persist={persist} />}
      {tab === 'attendance' && <AttendanceTab settings={settings} persist={persist} />}
      {tab === 'payroll' && <PayrollConfigTab settings={settings} persist={persist} />}
      {tab === 'holidays' && <HolidaysTab settings={settings} persist={persist} />}
    </DashboardLayout>
  );
};

const UsersTab: React.FC = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/employees').then((r) => setEmployees(r.data.employees || []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = employees.filter((e) =>
    !search || `${e.first_name} ${e.last_name} ${e.email}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="filter-bar">
        <input type="text" placeholder="Search users…" value={search} onChange={(e) => setSearch(e.target.value)} className="search-input" />
      </div>

      <div className="table-wrapper">
        {loading ? <div className="loading">Loading…</div> : (
          <table className="table">
            <thead>
              <tr><th>User</th><th>Login ID</th><th>Email</th><th>Role</th><th>Status</th></tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e.id}>
                  <td><strong>{e.first_name} {e.last_name}</strong></td>
                  <td><span className="login-id-highlight">{e.login_id || '—'}</span></td>
                  <td>{e.email}</td>
                  <td><span className="pill">Employee</span></td>
                  <td><StatusBadge status={e.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="policy-notice" style={{ marginTop: 14 }}>
        ⓘ To add HR / Payroll Officers, register them via the standard employee flow then update their role from the User Management API. Role-edit endpoint to come.
      </div>
    </>
  );
};

const CompanyTab: React.FC<{ onSaved: () => void }> = ({ onSaved }) => {
  const [name, setName] = useState(getCompanyName() || '');
  const [logo, setLogo] = useState<string | null>(getCompanyLogo());
  const [error, setError] = useState<string | null>(null);

  const onLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setError('Max 2MB'); return; }
    try {
      const url = await fileToDataUrl(file);
      setLogo(url);
      setCompanyLogo(url);
      onSaved();
    } catch { setError('Could not read image'); }
  };

  const removeLogo = () => { setLogo(null); setCompanyLogo(null); onSaved(); };

  const saveName = () => { setCompanyName(name); onSaved(); };

  return (
    <div className="card-grid">
      <div className="card">
        <div className="card-header"><h3 className="card-title">Company Identity</h3></div>
        <div className="form-group">
          <label>Company Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} onBlur={saveName} />
        </div>
        <div className="form-group">
          <label>Company Logo</label>
          {error && <div className="alert alert-error">{error}</div>}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 80, height: 80, borderRadius: 12, background: 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {logo ? <img src={logo} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <span style={{ color: 'var(--text-muted)' }}>No logo</span>}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <label className="btn-primary btn-sm" style={{ cursor: 'pointer' }}>
                {logo ? 'Replace' : 'Upload'}
                <input type="file" accept="image/png,image/jpeg,image/svg+xml" hidden onChange={onLogo} />
              </label>
              {logo && <button className="btn-secondary btn-sm" onClick={removeLogo}>Remove</button>}
            </div>
          </div>
          <span className="form-hint">PNG, JPG, or SVG · Max 2MB · Shows in sidebar, payslips, reports</span>
        </div>
      </div>
    </div>
  );
};

const SalaryTab: React.FC<{ settings: SettingsState; persist: (s: SettingsState) => void }> = ({ settings, persist }) => {
  const [cfg, setCfg] = useState(settings.salary);
  const components = computeSalaryComponents(cfg.base);
  const balanced = components.gross === cfg.base;

  const save = () => persist({ ...settings, salary: cfg });

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Salary Structure: {cfg.name}</h3>
        <button className="btn-primary btn-sm" onClick={save}>Save</button>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Structure Name</label>
          <input value={cfg.name} onChange={(e) => setCfg({ ...cfg, name: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Preview Wage (₹)</label>
          <input type="number" value={cfg.base} onChange={(e) => setCfg({ ...cfg, base: Number(e.target.value) })} />
        </div>
      </div>

      <div className="table-wrapper" style={{ marginBottom: 14 }}>
        <table className="table">
          <thead>
            <tr><th>Component</th><th>Computation</th><th>Value</th><th>Based On</th><th style={{ textAlign: 'right' }}>Preview</th></tr>
          </thead>
          <tbody>
            <tr><td><strong>Basic Salary</strong></td><td>% of Wage</td><td><input type="number" step="0.01" value={cfg.basicPct} onChange={(e) => setCfg({ ...cfg, basicPct: Number(e.target.value) })} style={{ width: 80 }} />%</td><td>Gross Wage</td><td style={{ textAlign: 'right' }}>₹{components.basic.toLocaleString()}</td></tr>
            <tr><td>House Rent Allowance</td><td>% of Basic</td><td><input type="number" step="0.01" value={cfg.hraPct} onChange={(e) => setCfg({ ...cfg, hraPct: Number(e.target.value) })} style={{ width: 80 }} />%</td><td>Basic</td><td style={{ textAlign: 'right' }}>₹{components.hra.toLocaleString()}</td></tr>
            <tr><td>Standard Allowance</td><td>Fixed</td><td><input type="number" value={cfg.sa} onChange={(e) => setCfg({ ...cfg, sa: Number(e.target.value) })} style={{ width: 100 }} /></td><td>—</td><td style={{ textAlign: 'right' }}>₹{components.standardAllowance.toLocaleString()}</td></tr>
            <tr><td>Performance Bonus</td><td>% of Wage</td><td><input type="number" step="0.01" value={cfg.pbPct} onChange={(e) => setCfg({ ...cfg, pbPct: Number(e.target.value) })} style={{ width: 80 }} />%</td><td>Gross Wage</td><td style={{ textAlign: 'right' }}>₹{components.performanceBonus.toLocaleString()}</td></tr>
            <tr><td>LTA</td><td>% of Wage</td><td><input type="number" step="0.001" value={cfg.ltaPct} onChange={(e) => setCfg({ ...cfg, ltaPct: Number(e.target.value) })} style={{ width: 80 }} />%</td><td>Gross Wage</td><td style={{ textAlign: 'right' }}>₹{components.lta.toLocaleString()}</td></tr>
            <tr><td>Fixed Allowance</td><td>Residual (auto)</td><td>—</td><td>All above</td><td style={{ textAlign: 'right' }}>₹{components.fixedAllowance.toLocaleString()}</td></tr>
            <tr style={{ background: balanced ? 'var(--green-50)' : 'var(--amber-50)' }}>
              <td><strong>Total</strong></td><td colSpan={3} style={{ color: balanced ? 'var(--green-600)' : 'var(--amber-600)', fontWeight: 600 }}>
                {balanced ? '✓ Balanced — components sum to wage' : '⚠ Components don\'t balance to wage'}
              </td>
              <td style={{ textAlign: 'right' }}><strong>₹{components.gross.toLocaleString()}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="policy-notice">
        ⓘ Fixed Allowance is automatically computed as the residual so all components sum exactly to the wage.
      </div>
    </div>
  );
};

const LeaveTab: React.FC<{ settings: SettingsState; persist: (s: SettingsState) => void }> = ({ settings, persist }) => {
  const update = (id: string, patch: Partial<SettingsState['leaveTypes'][number]>) => {
    persist({ ...settings, leaveTypes: settings.leaveTypes.map((l) => l.id === id ? { ...l, ...patch } : l) });
  };

  return (
    <div className="card">
      <div className="card-header"><h3 className="card-title">Leave Policy</h3></div>
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr><th>Leave Type</th><th>Paid?</th><th>Default Days</th><th>Carry Forward</th><th>Max CF</th><th>Attachment</th></tr>
          </thead>
          <tbody>
            {settings.leaveTypes.map((l) => (
              <tr key={l.id}>
                <td><strong>{l.name}</strong></td>
                <td><input type="checkbox" checked={l.isPaid} onChange={(e) => update(l.id, { isPaid: e.target.checked })} /></td>
                <td><input type="number" value={l.defaultDays} onChange={(e) => update(l.id, { defaultDays: Number(e.target.value) })} style={{ width: 80 }} /></td>
                <td><input type="checkbox" checked={l.carryForward} onChange={(e) => update(l.id, { carryForward: e.target.checked })} /></td>
                <td><input type="number" value={l.maxCfDays} onChange={(e) => update(l.id, { maxCfDays: Number(e.target.value) })} style={{ width: 80 }} disabled={!l.carryForward} /></td>
                <td><input type="checkbox" checked={l.requiresAttachment} onChange={(e) => update(l.id, { requiresAttachment: e.target.checked })} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="policy-notice" style={{ marginTop: 14 }}>
        ⓘ When "Attachment" is required, employees must upload medical proof or supporting documents when applying for that leave type.
      </div>
    </div>
  );
};

const AttendanceTab: React.FC<{ settings: SettingsState; persist: (s: SettingsState) => void }> = ({ settings, persist }) => {
  const a = settings.attendance;
  const update = (patch: Partial<SettingsState['attendance']>) => persist({ ...settings, attendance: { ...a, ...patch } });
  const [newCidr, setNewCidr] = useState('');
  const [newName, setNewName] = useState('');

  const addRange = () => {
    if (!newCidr) return;
    const id = String(Date.now());
    update({ ipRanges: [...a.ipRanges, { id, name: newName || 'Office', cidr: newCidr, active: true }] });
    setNewCidr(''); setNewName('');
  };

  const removeRange = (id: string) => update({ ipRanges: a.ipRanges.filter((r) => r.id !== id) });

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="card-grid">
      <div className="card">
        <div className="card-header"><h3 className="card-title">Working Hours</h3></div>
        <div className="form-row">
          <div className="form-group"><label>Grace period (mins)</label><input type="number" value={a.graceMinutes} onChange={(e) => update({ graceMinutes: Number(e.target.value) })} /></div>
          <div className="form-group"><label>Half day threshold (hrs)</label><input type="number" value={a.halfDayHours} onChange={(e) => update({ halfDayHours: Number(e.target.value) })} /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>Full day threshold (hrs)</label><input type="number" value={a.fullDayHours} onChange={(e) => update({ fullDayHours: Number(e.target.value) })} /></div>
          <div className="form-group"><label>Auto-absent at</label><input type="time" value={a.autoAbsentTime} onChange={(e) => update({ autoAbsentTime: e.target.value })} /></div>
        </div>
        <div className="form-group">
          <label>Working Days</label>
          <div style={{ display: 'flex', gap: 6 }}>
            {days.map((d, i) => (
              <button
                key={i}
                onClick={() => { const next = [...a.workingDays]; next[i] = !next[i]; update({ workingDays: next }); }}
                className={a.workingDays[i] ? 'btn-primary btn-sm' : 'btn-secondary btn-sm'}
                style={{ flex: 1 }}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h3 className="card-title">Office IP Verification</h3></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" checked={a.allowRemote} onChange={(e) => update({ allowRemote: e.target.checked })} />
            Allow remote check-in (flagged in attendance)
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" checked={a.blockNonOffice} onChange={(e) => update({ blockNonOffice: e.target.checked })} />
            Block check-in if IP doesn't match office range
          </label>
        </div>

        <h4 style={{ fontSize: 12.5, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>Office IP Ranges</h4>
        {a.ipRanges.map((r) => (
          <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 8, marginBottom: 6, fontSize: 13 }}>
            <div>
              <strong>{r.name}</strong>
              <span style={{ marginLeft: 8, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{r.cidr}</span>
            </div>
            <button className="btn-secondary btn-sm" onClick={() => removeRange(r.id)}>Remove</button>
          </div>
        ))}

        <div className="form-row" style={{ marginTop: 14 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Office name" />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <input value={newCidr} onChange={(e) => setNewCidr(e.target.value)} placeholder="192.168.1.0/24" />
          </div>
        </div>
        <button className="btn-primary btn-sm" onClick={addRange} style={{ marginTop: 10 }}>+ Add IP Range</button>
      </div>
    </div>
  );
};

const PayrollConfigTab: React.FC<{ settings: SettingsState; persist: (s: SettingsState) => void }> = ({ settings, persist }) => {
  const p = settings.payroll;
  const update = (patch: Partial<SettingsState['payroll']>) => persist({ ...settings, payroll: { ...p, ...patch } });

  return (
    <div className="card">
      <div className="card-header"><h3 className="card-title">Payroll Configuration</h3></div>
      <div className="form-row">
        <div className="form-group"><label>PF Rate (employee + employer, each)</label><input type="number" step="0.5" value={p.pfRate} onChange={(e) => update({ pfRate: Number(e.target.value) })} />%</div>
        <div className="form-group"><label>PF Wage Ceiling (basic)</label><input type="number" value={p.pfCeiling} onChange={(e) => update({ pfCeiling: Number(e.target.value) })} /></div>
      </div>
      <div className="form-row">
        <div className="form-group"><label>Payrun Day (each month)</label><input type="number" min={1} max={31} value={p.payrunDay} onChange={(e) => update({ payrunDay: Number(e.target.value) })} /></div>
        <div className="form-group"><label>Financial Year Start Month</label><input value={p.financialYearStart} onChange={(e) => update({ financialYearStart: e.target.value })} /></div>
      </div>

      <h4 style={{ marginTop: 14, marginBottom: 10, fontSize: 13, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Professional Tax Slabs (Maharashtra default)</h4>
      <div className="table-wrapper">
        <table className="table">
          <thead><tr><th>Up to Gross (₹)</th><th>PT Deduction (₹/month)</th></tr></thead>
          <tbody>
            {p.ptStateSlab.map((s, i) => (
              <tr key={i}>
                <td><input type="number" value={s.gross} onChange={(e) => { const next = [...p.ptStateSlab]; next[i] = { ...s, gross: Number(e.target.value) }; update({ ptStateSlab: next }); }} /></td>
                <td><input type="number" value={s.tax} onChange={(e) => { const next = [...p.ptStateSlab]; next[i] = { ...s, tax: Number(e.target.value) }; update({ ptStateSlab: next }); }} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const HolidaysTab: React.FC<{ settings: SettingsState; persist: (s: SettingsState) => void }> = ({ settings, persist }) => {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');

  const add = () => {
    if (!name || !date) return;
    persist({ ...settings, holidays: [...settings.holidays, { id: String(Date.now()), name, date, optional: false }] });
    setName(''); setDate('');
  };

  const remove = (id: string) => persist({ ...settings, holidays: settings.holidays.filter((h) => h.id !== id) });

  return (
    <div className="card">
      <div className="card-header"><h3 className="card-title">Holiday Calendar</h3></div>

      <div className="table-wrapper" style={{ marginBottom: 16 }}>
        <table className="table">
          <thead><tr><th>Holiday</th><th>Date</th><th>Optional</th><th></th></tr></thead>
          <tbody>
            {settings.holidays.map((h) => (
              <tr key={h.id}>
                <td><strong>{h.name}</strong></td>
                <td>{new Date(h.date).toLocaleDateString()}</td>
                <td>{h.optional ? <span className="pill">optional</span> : <span className="pill" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>mandatory</span>}</td>
                <td><button className="btn-secondary btn-sm" onClick={() => remove(h.id)}>Remove</button></td>
              </tr>
            ))}
            {settings.holidays.length === 0 && <tr><td colSpan={4} className="empty-state">No holidays configured.</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="form-row">
        <div className="form-group" style={{ marginBottom: 0 }}>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Holiday name" />
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
      </div>
      <button className="btn-primary btn-sm" onClick={add} style={{ marginTop: 10 }}>+ Add Holiday</button>
    </div>
  );
};

export default Settings;
