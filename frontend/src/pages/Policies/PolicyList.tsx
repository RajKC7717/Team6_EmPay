import React, { useEffect, useState } from 'react';
import api, { getUser } from '../../api';
import DashboardLayout from '../../components/DashboardLayout';
import Modal from '../../components/Modal';

const PolicyList: React.FC = () => {
  const user = getUser();
  const isAdmin = user?.role === 'admin';
  const [policies, setPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ title: '', category: 'general', content: '' });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const r = await api.get('/policies');
      setPolicies(r.data.policies || []);
    } catch { setPolicies([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const categories = Array.from(new Set(policies.map((p) => p.category).filter(Boolean)));
  const filtered = filter ? policies.filter((p) => p.category === filter) : policies;

  const openCreate = () => { setEditId(null); setForm({ title: '', category: 'general', content: '' }); setError(null); setModalOpen(true); };
  const openEdit = (p: any) => { setEditId(p.id); setForm({ title: p.title, category: p.category || 'general', content: p.content || '' }); setError(null); setModalOpen(true); };

  const submit = async () => {
    setError(null);
    if (!form.title || !form.content) { setError('Title and content required'); return; }
    setBusy(true);
    try {
      if (editId) await api.put(`/policies/${editId}`, form);
      else await api.post('/policies', form);
      setModalOpen(false);
      fetchData();
    } catch (e: any) { setError(e.response?.data?.error || 'Failed'); }
    finally { setBusy(false); }
  };

  const remove = async (id: number) => {
    if (!window.confirm('Delete this policy?')) return;
    try { await api.delete(`/policies/${id}`); fetchData(); } catch {}
  };

  return (
    <DashboardLayout title="Policies">
      <div className="page-header">
        <div><h1>Company Policies</h1><p className="page-subtitle">{isAdmin ? 'Create and manage company policies' : 'Browse company policies'}</p></div>
        {isAdmin && <div className="page-actions"><button className="btn-primary" onClick={openCreate}>+ New Policy</button></div>}
      </div>
      <div className="filter-bar">
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
        </select>
      </div>
      {loading ? <div className="loading">Loading…</div> : filtered.length === 0 ? (
        <div className="empty"><div className="empty-icon">◐</div><div className="empty-title">No policies found</div><div className="empty-desc">{isAdmin ? 'Create your first company policy' : 'No policies published yet'}</div></div>
      ) : (
        <div className="policy-grid">
          {filtered.map((p, i) => (
            <div className="policy-card" key={p.id} style={{ animationDelay: `${i * 0.05}s` }}>
              <span className="policy-card-category">{(p.category || 'general').replace(/_/g, ' ')}</span>
              <div className="policy-card-title">{p.title}</div>
              <div className="policy-card-content">{p.content}</div>
              {isAdmin && (
                <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                  <button className="btn-secondary btn-sm" onClick={() => openEdit(p)}>Edit</button>
                  <button className="btn-danger btn-sm" onClick={() => remove(p.id)}>Delete</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {modalOpen && (
        <Modal open onClose={() => setModalOpen(false)} title={editId ? 'Edit Policy' : 'New Policy'} size="lg" footer={<><button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button><button className="btn-primary" onClick={submit} disabled={busy}>{busy ? 'Saving…' : 'Save Policy'}</button></>}>
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-row">
            <div className="form-group"><label>Title <span className="required">*</span></label><input value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} /></div>
            <div className="form-group"><label>Category</label>
              <select value={form.category} onChange={(e) => setForm({...form, category: e.target.value})}>
                <option value="general">General</option>
                <option value="attendance">Attendance</option>
                <option value="leave">Leave</option>
                <option value="payroll">Payroll</option>
                <option value="code_of_conduct">Code of Conduct</option>
              </select>
            </div>
          </div>
          <div className="form-group"><label>Content <span className="required">*</span></label><textarea value={form.content} onChange={(e) => setForm({...form, content: e.target.value})} style={{ minHeight: 200 }} /></div>
        </Modal>
      )}
    </DashboardLayout>
  );
};

export default PolicyList;
