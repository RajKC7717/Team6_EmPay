import React, { useEffect, useMemo, useState } from 'react';
import api from '../../api';
import DashboardLayout from '../../components/DashboardLayout';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import { computeSalaryComponents, computeTDS, computePF, computeProfessionalTax } from '../../utils/salary';

const FY_LABEL = '2026-27';

const EmployeeTax: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [declarations, setDeclarations] = useState<any[]>([]);
  const [regime, setRegime] = useState<'old' | 'new'>('new');
  const [addOpen, setAddOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [emp, decl] = await Promise.all([
        api.get('/employees').catch(() => ({ data: { employees: [] } })),
        api.get('/tax/declarations').catch(() => ({ data: { declarations: [] } })),
      ]);
      const me = (emp.data.employees || [])[0];
      setProfile(me);
      setDeclarations(decl.data.declarations || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const components = useMemo(() => computeSalaryComponents(Number(profile?.basic_wage || 0)), [profile]);
  const annualGross = components.gross * 12;
  const approvedDeductions = useMemo(() => declarations.filter((d) => d.status === 'approved').reduce((s, d) => s + Number(d.amount || 0), 0), [declarations]);
  const tds = useMemo(() => computeTDS(annualGross, regime, approvedDeductions), [annualGross, regime, approvedDeductions]);

  const monthlyPF = computePF(components.basic);
  const monthlyPT = profile?.professional_tax_applicable ? computeProfessionalTax(components.gross) : 0;
  const monthlyDeductions = monthlyPF + monthlyPT + tds.monthlyTDS;
  const monthlyNet = Math.max(0, components.gross - monthlyDeductions);

  return (
    <DashboardLayout title="Income Tax">
      <div className="page-header">
        <div>
          <h1>Income Tax & Salary Breakdown</h1>
          <p className="page-subtitle">Financial Year {FY_LABEL} · TDS computed live based on your declarations</p>
        </div>
        <div className="page-actions">
          <select value={regime} onChange={(e) => setRegime(e.target.value as 'old' | 'new')} style={{ padding: '9px 12px', borderRadius: 8, border: '1px solid var(--border)' }}>
            <option value="new">New Regime (default)</option>
            <option value="old">Old Regime</option>
          </select>
          <button className="btn-primary" onClick={() => setAddOpen(true)}>+ Declare Investment</button>
        </div>
      </div>

      <div className="policy-notice">
        ⓘ <strong>Tax Policy:</strong> The new regime offers lower slab rates with a flat ₹75,000 standard deduction (no other exemptions).
        The old regime allows exemptions like 80C, 80D, HRA but has a smaller ₹50,000 standard deduction. Choose what gives you a lower tax.
      </div>

      {loading ? <div className="loading">Loading…</div> : !profile ? <div className="empty"><div className="empty-title">No employee profile</div></div> : (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-title">Annual Gross</span>
                <div className="stat-card-icon green">◐</div>
              </div>
              <div className="stat-card-value">₹{(annualGross / 100000).toFixed(2)}L</div>
              <div className="stat-card-change">₹{components.gross.toLocaleString()} / month</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-title">Estimated Annual Tax</span>
                <div className="stat-card-icon amber">◑</div>
              </div>
              <div className="stat-card-value">₹{tds.totalTax.toLocaleString()}</div>
              <div className="stat-card-change">{tds.effectiveRate}% effective rate</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-title">Monthly TDS</span>
                <div className="stat-card-icon">◓</div>
              </div>
              <div className="stat-card-value">₹{tds.monthlyTDS.toLocaleString()}</div>
              <div className="stat-card-change">Deducted at source</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-title">Take-Home (monthly)</span>
                <div className="stat-card-icon blue">◔</div>
              </div>
              <div className="stat-card-value">₹{monthlyNet.toLocaleString()}</div>
              <div className="stat-card-change">After all deductions</div>
            </div>
          </div>

          <div className="card-grid">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Salary Component Breakdown</h3>
              </div>
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr><th>Component</th><th>Computation</th><th style={{ textAlign: 'right' }}>Monthly</th><th style={{ textAlign: 'right' }}>Yearly</th></tr>
                  </thead>
                  <tbody>
                    <tr><td><strong>Basic Salary</strong></td><td>50% of Wage</td><td style={{ textAlign: 'right' }}>₹{components.basic.toLocaleString()}</td><td style={{ textAlign: 'right' }}>₹{(components.basic * 12).toLocaleString()}</td></tr>
                    <tr><td>House Rent Allowance</td><td>50% of Basic</td><td style={{ textAlign: 'right' }}>₹{components.hra.toLocaleString()}</td><td style={{ textAlign: 'right' }}>₹{(components.hra * 12).toLocaleString()}</td></tr>
                    <tr><td>Standard Allowance</td><td>Fixed</td><td style={{ textAlign: 'right' }}>₹{components.standardAllowance.toLocaleString()}</td><td style={{ textAlign: 'right' }}>₹{(components.standardAllowance * 12).toLocaleString()}</td></tr>
                    <tr><td>Performance Bonus</td><td>8.33% of Wage</td><td style={{ textAlign: 'right' }}>₹{components.performanceBonus.toLocaleString()}</td><td style={{ textAlign: 'right' }}>₹{(components.performanceBonus * 12).toLocaleString()}</td></tr>
                    <tr><td>Leave Travel Allowance</td><td>8.333% of Wage</td><td style={{ textAlign: 'right' }}>₹{components.lta.toLocaleString()}</td><td style={{ textAlign: 'right' }}>₹{(components.lta * 12).toLocaleString()}</td></tr>
                    <tr><td>Fixed Allowance</td><td>Residual</td><td style={{ textAlign: 'right' }}>₹{components.fixedAllowance.toLocaleString()}</td><td style={{ textAlign: 'right' }}>₹{(components.fixedAllowance * 12).toLocaleString()}</td></tr>
                    <tr style={{ background: 'var(--accent-soft)' }}>
                      <td colSpan={2}><strong>Gross Salary</strong></td>
                      <td style={{ textAlign: 'right' }}><strong>₹{components.gross.toLocaleString()}</strong></td>
                      <td style={{ textAlign: 'right' }}><strong>₹{annualGross.toLocaleString()}</strong></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3 className="card-title">My Tax Summary</h3>
              </div>
              <div className="detail-grid" style={{ gridTemplateColumns: '1fr' }}>
                <div className="detail-item">
                  <span className="detail-label">Tax Regime</span>
                  <span className="detail-value">{regime === 'new' ? 'New Regime' : 'Old Regime'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Standard Deduction</span>
                  <span className="detail-value">₹{tds.standardDeduction.toLocaleString()}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Declared Investments {regime === 'new' && '(not used in new regime)'}</span>
                  <span className="detail-value">₹{approvedDeductions.toLocaleString()}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Taxable Income</span>
                  <span className="detail-value">₹{tds.taxableIncome.toLocaleString()}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Tax + Cess</span>
                  <span className="detail-value">₹{tds.tax.toLocaleString()} + ₹{tds.cess.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">My Investment Declarations</h3>
              <button className="btn-secondary btn-sm" onClick={() => setAddOpen(true)}>+ Add</button>
            </div>
            {declarations.length === 0 ? (
              <div className="empty">
                <div className="empty-icon">◒</div>
                <div className="empty-title">No declarations yet</div>
                <div className="empty-desc">Declare 80C, 80D, HRA, home loan to reduce taxable income (old regime only).</div>
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr><th>Section</th><th>Description</th><th>Amount</th><th>Status</th><th>Submitted</th></tr>
                  </thead>
                  <tbody>
                    {declarations.map((d) => (
                      <tr key={d.id}>
                        <td><strong>{(d.declaration_type || d.section || '').replace(/_/g, ' ')}</strong></td>
                        <td>{d.description || '—'}</td>
                        <td>₹{Number(d.amount).toLocaleString()}</td>
                        <td><StatusBadge status={d.status} /></td>
                        <td>{d.created_at ? new Date(d.created_at).toLocaleDateString() : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {addOpen && <DeclareModal onClose={() => setAddOpen(false)} onSaved={() => { setAddOpen(false); fetchAll(); }} />}
    </DashboardLayout>
  );
};

const SECTIONS = [
  { value: 'section_80c', label: 'Section 80C (LIC, PF, ELSS, ULIP)' },
  { value: 'section_80d', label: 'Section 80D (Health Insurance)' },
  { value: 'hra', label: 'HRA (Rent Receipts)' },
  { value: 'home_loan', label: 'Home Loan Interest' },
  { value: 'other', label: 'Other Deductions' },
];

const DeclareModal: React.FC<{ onClose: () => void; onSaved: () => void }> = ({ onClose, onSaved }) => {
  const [section, setSection] = useState('section_80c');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError(null);
    if (!amount || Number(amount) <= 0) { setError('Enter a valid amount'); return; }
    setBusy(true);
    try {
      await api.post('/tax/declarations', {
        declarationType: section,
        section,
        amount: Number(amount),
        description,
      });
      onSaved();
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed to submit');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open
      title="Declare Investment"
      onClose={onClose}
      footer={
        <>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={submit} disabled={busy}>{busy ? 'Submitting…' : 'Submit Declaration'}</button>
        </>
      }
    >
      {error && <div className="alert alert-error">{error}</div>}
      <div className="form-group">
        <label>Section</label>
        <select value={section} onChange={(e) => setSection(e.target.value)}>
          {SECTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>
      <div className="form-group">
        <label>Amount (₹)</label>
        <input type="number" min={0} value={amount} onChange={(e) => setAmount(e.target.value)} />
        <span className="form-hint">Cap: 80C up to ₹1.5L; 80D up to ₹25K; Home Loan up to ₹2L</span>
      </div>
      <div className="form-group">
        <label>Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g., LIC premium for 2026-27" />
      </div>
    </Modal>
  );
};

export default EmployeeTax;
