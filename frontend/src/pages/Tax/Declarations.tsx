import React, { useEffect, useState } from 'react';
import api, { getUser } from '../../api';
import DashboardLayout from '../../components/DashboardLayout';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';

const TaxDeclarations: React.FC = () => {
  const user = getUser();
  const role = user?.role;
  const isEmployee = role === 'employee';
  const canApprove = role === 'admin' || role === 'payroll_officer';
  const [declarations, setDeclarations] = useState<any[]>([]);
  const [taxCalc, setTaxCalc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [rejectFor, setRejectFor] = useState<any | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const [form, setForm] = useState({ section: '80C', description: '', amount: '' });

  const fetchData = async () => {
    setLoading(true);
    const [d, t] = await Promise.all([
      api.get('/tax/declarations').catch(() => ({ data: { declarations: [] } })),
      api.get('/tax/calculate').catch(() => ({ data: { taxCalculation: null } })),
    ]);
    setDeclarations(d.data.declarations || []);
    setTaxCalc(t.data.taxCalculation || t.data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const submitDecl = async () => {
    setError(null); setSuccess(null);
    if (!form.section || !form.description || !form.amount || Number(form.amount) <= 0) { setError('Fill all fields with valid amount'); return; }
    setBusy(true);
    try {
      await api.post('/tax/declarations', { section: form.section, description: form.description, amount: Number(form.amount) });
      setSuccess('Declaration submitted!');
      setForm({ section: '80C', description: '', amount: '' });
      fetchData();
    } catch (e: any) { setError(e.response?.data?.error || 'Failed'); }
    finally { setBusy(false); }
  };

  const approve = async (id: number) => {
    if (!window.confirm('Approve this declaration?')) return;
    setBusy(true);
    try { await api.put(`/tax/declarations/${id}/approve`); fetchData(); }
    catch (e: any) { alert(e.response?.data?.error || 'Failed'); }
    finally { setBusy(false); }
  };

  const submitReject = async () => {
    if (!rejectFor || !rejectReason.trim()) { alert('Provide a reason'); return; }
    setBusy(true);
    try { await api.put(`/tax/declarations/${rejectFor.id}/reject`, { rejectionReason: rejectReason }); setRejectFor(null); setRejectReason(''); fetchData(); }
    catch (e: any) { alert(e.response?.data?.error || 'Failed'); }
    finally { setBusy(false); }
  };

  return (
    <DashboardLayout title="Tax Declarations">
      <div className="page-header">
        <div><h1>Income Tax</h1><p className="page-subtitle">{isEmployee ? 'Submit declarations and view your tax computation' : 'Review employee tax declarations'}</p></div>
      </div>
      <div className="policy-notice">
        ⓘ <strong>Tax Policy:</strong> Submit investment proofs under Sections 80C, 80D, HRA, or Other. Approved declarations reduce your taxable income. Tax is computed using Indian FY2025-26 slabs.
      </div>
      {loading ? <div className="loading">Loading…</div> : (
        <div className="card-grid">
          <div>
            {isEmployee && (
              <div className="card fade-up" style={{ marginBottom: 20 }}>
                <div className="card-header"><h3 className="card-title">Submit Declaration</h3></div>
                {error && <div className="alert alert-error">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}
                <div className="form-row">
                  <div className="form-group"><label>Section</label>
                    <select value={form.section} onChange={(e) => setForm({...form, section: e.target.value})}>
                      <option value="80C">80C (PPF, ELSS, LIC, etc.)</option>
                      <option value="80D">80D (Health Insurance)</option>
                      <option value="HRA">HRA (House Rent Allowance)</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="form-group"><label>Amount (₹)</label><input type="number" min={0} value={form.amount} onChange={(e) => setForm({...form, amount: e.target.value})} /></div>
                </div>
                <div className="form-group"><label>Description</label><input value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} placeholder="e.g. PPF contribution for FY 2025-26" /></div>
                <button className="btn-primary" onClick={submitDecl} disabled={busy}>{busy ? 'Submitting…' : 'Submit Declaration'}</button>
              </div>
            )}
            <div className="card fade-up delay-1">
              <div className="card-header"><h3 className="card-title">{isEmployee ? 'My Declarations' : 'All Declarations'}</h3></div>
              <div className="table-wrapper">
                <table className="table">
                  <thead><tr>{!isEmployee && <th>Employee</th>}<th>Section</th><th>Description</th><th>Amount</th><th>Status</th>{canApprove && <th></th>}</tr></thead>
                  <tbody>
                    {declarations.map((d) => (
                      <tr key={d.id}>
                        {!isEmployee && <td><strong>{d.first_name} {d.last_name}</strong></td>}
                        <td><span className="pill">{d.section || d.declaration_type}</span></td>
                        <td style={{maxWidth:200,fontSize:12.5,color:'var(--text-muted)'}}>{d.description}</td>
                        <td style={{fontWeight:600}}>₹{Number(d.amount).toLocaleString()}</td>
                        <td><StatusBadge status={d.status} /></td>
                        {canApprove && <td className="table-actions">
                          {d.status === 'pending' && <>
                            <button className="btn-success btn-sm" onClick={() => approve(d.id)} disabled={busy}>Approve</button>
                            <button className="btn-danger btn-sm" onClick={() => setRejectFor(d)} disabled={busy}>Reject</button>
                          </>}
                        </td>}
                      </tr>
                    ))}
                    {declarations.length === 0 && <tr><td colSpan={canApprove ? 6 : 5} className="empty-state">No declarations.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="tax-card fade-up delay-2">
            <div className="tax-card-header"><h3>Tax Computation</h3><p>FY 2025-26 (Estimated)</p></div>
            <div className="tax-card-body">
              {taxCalc ? (
                <>
                  <div className="tax-row"><span>Annual Gross</span><span style={{fontWeight:600}}>₹{Number(taxCalc.annualGross || taxCalc.annual_gross || 0).toLocaleString()}</span></div>
                  <div className="tax-row"><span>Standard Deduction</span><span>−₹{Number(taxCalc.standardDeduction || taxCalc.standard_deduction || 50000).toLocaleString()}</span></div>
                  <div className="tax-row"><span>80C Deductions</span><span>−₹{Number(taxCalc.deductions_80c || taxCalc.section80C || 0).toLocaleString()}</span></div>
                  <div className="tax-row"><span>80D Deductions</span><span>−₹{Number(taxCalc.deductions_80d || taxCalc.section80D || 0).toLocaleString()}</span></div>
                  <div className="tax-row"><span>HRA Exemption</span><span>−₹{Number(taxCalc.hra_exemption || taxCalc.hraExemption || 0).toLocaleString()}</span></div>
                  <div className="tax-row"><span>Taxable Income</span><span style={{fontWeight:600}}>₹{Number(taxCalc.taxableIncome || taxCalc.taxable_income || 0).toLocaleString()}</span></div>
                  <div className="tax-row highlight"><span>Tax Payable</span><span>₹{Number(taxCalc.taxPayable || taxCalc.tax_payable || 0).toLocaleString()}</span></div>
                  <div className="tax-row"><span>Monthly TDS</span><span>₹{Math.round(Number(taxCalc.taxPayable || taxCalc.tax_payable || 0) / 12).toLocaleString()}</span></div>
                </>
              ) : <p style={{color:'var(--text-muted)',fontSize:13}}>Tax computation not available</p>}
            </div>
          </div>
        </div>
      )}
      {rejectFor && (
        <Modal open title={`Reject Declaration`} onClose={() => { setRejectFor(null); setRejectReason(''); }} footer={<><button className="btn-secondary" onClick={() => { setRejectFor(null); setRejectReason(''); }}>Cancel</button><button className="btn-danger" onClick={submitReject} disabled={busy}>{busy ? 'Rejecting…' : 'Reject'}</button></>}>
          <div className="form-group"><label>Reason <span className="required">*</span></label><textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Explain why this declaration is being rejected" /></div>
        </Modal>
      )}
    </DashboardLayout>
  );
};

export default TaxDeclarations;
