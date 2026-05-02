import React, { useEffect, useState } from 'react';
import api, { getUser } from '../../api';
import DashboardLayout from '../../components/DashboardLayout';
import Modal from '../../components/Modal';

const StarRating: React.FC<{value: number; onChange?: (v: number) => void}> = ({ value, onChange }) => (
  <div className="star-rating">
    {[1,2,3,4,5].map((s) => (
      <span key={s} className={`star ${s <= value ? 'filled' : ''}`} onClick={() => onChange?.(s)} style={{cursor: onChange ? 'pointer' : 'default'}}>★</span>
    ))}
  </div>
);

const Reviews: React.FC = () => {
  const user = getUser();
  const role = user?.role;
  const canManage = role === 'admin' || role === 'hr_officer';
  const [reviews, setReviews] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ employeeId: '', reviewPeriodStart: '', reviewPeriodEnd: '', rating: 3, strengths: '', areasForImprovement: '', goals: '', comments: '' });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const [r, e] = await Promise.all([
      api.get('/performance/reviews').catch(() => ({ data: { reviews: [] } })),
      canManage ? api.get('/employees').catch(() => ({ data: { employees: [] } })) : Promise.resolve({ data: { employees: [] } }),
    ]);
    setReviews(r.data.reviews || []);
    setEmployees(e.data.employees || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => {
    setEditId(null);
    setForm({ employeeId: '', reviewPeriodStart: '', reviewPeriodEnd: '', rating: 3, strengths: '', areasForImprovement: '', goals: '', comments: '' });
    setError(null);
    setModalOpen(true);
  };

  const openEdit = (r: any) => {
    setEditId(r.id);
    setForm({ employeeId: String(r.employee_id), reviewPeriodStart: r.review_period_start?.slice(0,10) || '', reviewPeriodEnd: r.review_period_end?.slice(0,10) || '', rating: r.rating || 3, strengths: r.strengths || '', areasForImprovement: r.areas_for_improvement || '', goals: r.goals || '', comments: r.comments || '' });
    setError(null);
    setModalOpen(true);
  };

  const submit = async () => {
    setError(null);
    if (!form.employeeId || !form.reviewPeriodStart || !form.reviewPeriodEnd) { setError('Please fill required fields'); return; }
    setBusy(true);
    try {
      const payload = { ...form, employeeId: Number(form.employeeId), rating: Number(form.rating) };
      if (editId) await api.put(`/performance/reviews/${editId}`, payload);
      else await api.post('/performance/reviews', payload);
      setModalOpen(false);
      fetchData();
    } catch (e: any) { setError(e.response?.data?.error || 'Failed'); }
    finally { setBusy(false); }
  };

  const remove = async (id: number) => {
    if (!window.confirm('Delete this review?')) return;
    try { await api.delete(`/performance/reviews/${id}`); fetchData(); } catch {}
  };

  return (
    <DashboardLayout title="Performance Reviews">
      <div className="page-header">
        <div><h1>Performance Reviews</h1><p className="page-subtitle">{canManage ? 'Create and manage employee performance reviews' : 'Your performance reviews'}</p></div>
        {canManage && <div className="page-actions"><button className="btn-primary" onClick={openCreate}>+ New Review</button></div>}
      </div>
      {loading ? <div className="loading">Loading…</div> : (
        <div className="table-wrapper fade-up">
          <table className="table">
            <thead><tr><th>Employee</th><th>Period</th><th>Rating</th><th>Strengths</th><th>Comments</th>{canManage && <th></th>}</tr></thead>
            <tbody>
              {reviews.map((r) => (
                <tr key={r.id}>
                  <td><strong>{r.first_name} {r.last_name}</strong></td>
                  <td>{r.review_period_start?.slice(0,10)} — {r.review_period_end?.slice(0,10)}</td>
                  <td><StarRating value={r.rating} /></td>
                  <td style={{maxWidth:200,fontSize:12.5,color:'var(--text-muted)'}}>{r.strengths}</td>
                  <td style={{maxWidth:200,fontSize:12.5,color:'var(--text-muted)'}}>{r.comments}</td>
                  {canManage && <td className="table-actions">
                    <button className="btn-secondary btn-sm" onClick={() => openEdit(r)}>Edit</button>
                    <button className="btn-danger btn-sm" onClick={() => remove(r.id)}>Delete</button>
                  </td>}
                </tr>
              ))}
              {reviews.length === 0 && <tr><td colSpan={canManage ? 6 : 5} className="empty-state">No performance reviews yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
      {modalOpen && (
        <Modal open onClose={() => setModalOpen(false)} title={editId ? 'Edit Review' : 'New Performance Review'} size="lg" footer={<><button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button><button className="btn-primary" onClick={submit} disabled={busy}>{busy ? 'Saving…' : 'Save Review'}</button></>}>
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-group"><label>Employee <span className="required">*</span></label>
            <select value={form.employeeId} onChange={(e) => setForm({...form, employeeId: e.target.value})} disabled={!!editId}>
              <option value="">Select…</option>
              {employees.map((e) => <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>)}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Period Start <span className="required">*</span></label><input type="date" value={form.reviewPeriodStart} onChange={(e) => setForm({...form, reviewPeriodStart: e.target.value})} /></div>
            <div className="form-group"><label>Period End <span className="required">*</span></label><input type="date" value={form.reviewPeriodEnd} onChange={(e) => setForm({...form, reviewPeriodEnd: e.target.value})} /></div>
          </div>
          <div className="form-group"><label>Rating</label><StarRating value={form.rating} onChange={(v) => setForm({...form, rating: v})} /></div>
          <div className="form-group"><label>Strengths</label><textarea value={form.strengths} onChange={(e) => setForm({...form, strengths: e.target.value})} /></div>
          <div className="form-group"><label>Areas for Improvement</label><textarea value={form.areasForImprovement} onChange={(e) => setForm({...form, areasForImprovement: e.target.value})} /></div>
          <div className="form-group"><label>Goals</label><textarea value={form.goals} onChange={(e) => setForm({...form, goals: e.target.value})} /></div>
          <div className="form-group"><label>Comments</label><textarea value={form.comments} onChange={(e) => setForm({...form, comments: e.target.value})} /></div>
        </Modal>
      )}
    </DashboardLayout>
  );
};

export default Reviews;
