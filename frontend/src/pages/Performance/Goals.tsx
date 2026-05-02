import React, { useEffect, useState } from 'react';
import api, { getUser } from '../../api';
import DashboardLayout from '../../components/DashboardLayout';
import Modal from '../../components/Modal';

const Goals: React.FC = () => {
  const user = getUser();
  const role = user?.role;
  const canManage = role === 'admin' || role === 'hr_officer';
  const [goals, setGoals] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [progressModal, setProgressModal] = useState<any | null>(null);
  const [progressVal, setProgressVal] = useState(0);
  const [form, setForm] = useState({ employeeId: '', title: '', description: '', targetDate: '' });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const [g, e] = await Promise.all([
      api.get('/performance/goals').catch(() => ({ data: { goals: [] } })),
      canManage ? api.get('/employees').catch(() => ({ data: { employees: [] } })) : Promise.resolve({ data: { employees: [] } }),
    ]);
    setGoals(g.data.goals || []);
    setEmployees(e.data.employees || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const createGoal = async () => {
    setError(null);
    if (!form.employeeId || !form.title || !form.targetDate) { setError('Fill required fields'); return; }
    setBusy(true);
    try {
      await api.post('/performance/goals', { ...form, employeeId: Number(form.employeeId) });
      setModalOpen(false);
      setForm({ employeeId: '', title: '', description: '', targetDate: '' });
      fetchData();
    } catch (e: any) { setError(e.response?.data?.error || 'Failed'); }
    finally { setBusy(false); }
  };

  const updateProgress = async () => {
    if (!progressModal) return;
    setBusy(true);
    try {
      await api.put(`/performance/goals/${progressModal.id}`, { progress: progressVal, status: progressVal >= 100 ? 'completed' : 'in_progress' });
      setProgressModal(null);
      fetchData();
    } catch (e: any) { alert(e.response?.data?.error || 'Failed'); }
    finally { setBusy(false); }
  };

  const removeGoal = async (id: number) => {
    if (!window.confirm('Delete this goal?')) return;
    try { await api.delete(`/performance/goals/${id}`); fetchData(); } catch {}
  };

  return (
    <DashboardLayout title="Goals">
      <div className="page-header">
        <div><h1>Performance Goals</h1><p className="page-subtitle">{canManage ? 'Set and track employee goals' : 'Track your progress'}</p></div>
        {canManage && <div className="page-actions"><button className="btn-primary" onClick={() => { setError(null); setModalOpen(true); }}>+ New Goal</button></div>}
      </div>
      {loading ? <div className="loading">Loading…</div> : goals.length === 0 ? (
        <div className="empty"><div className="empty-icon">◑</div><div className="empty-title">No goals set</div><div className="empty-desc">{canManage ? 'Create goals for your team' : 'Ask your manager to set goals'}</div></div>
      ) : (
        <div className="policy-grid">
          {goals.map((g, i) => (
            <div className="card fade-up" key={g.id} style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="card-header">
                <h3 className="card-title">{g.title}</h3>
                <StatusPill status={g.status} />
              </div>
              {g.first_name && <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 8 }}>Assigned to {g.first_name} {g.last_name}</p>}
              <p style={{ fontSize: 13.5, color: 'var(--text-muted)', marginBottom: 14 }}>{g.description || 'No description'}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 8 }}>
                <span style={{ color: 'var(--text-muted)' }}>Target: {g.target_date ? new Date(g.target_date).toLocaleDateString() : '—'}</span>
                <span style={{ fontWeight: 600 }}>{g.progress || 0}%</span>
              </div>
              <div className="progress"><div className="progress-fill" style={{ width: `${g.progress || 0}%` }} /></div>
              <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                <button className="btn-secondary btn-sm" onClick={() => { setProgressModal(g); setProgressVal(g.progress || 0); }}>Update Progress</button>
                {canManage && <button className="btn-danger btn-sm" onClick={() => removeGoal(g.id)}>Delete</button>}
              </div>
            </div>
          ))}
        </div>
      )}
      {modalOpen && (
        <Modal open onClose={() => setModalOpen(false)} title="New Goal" footer={<><button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button><button className="btn-primary" onClick={createGoal} disabled={busy}>{busy ? 'Creating…' : 'Create Goal'}</button></>}>
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-group"><label>Employee <span className="required">*</span></label>
            <select value={form.employeeId} onChange={(e) => setForm({...form, employeeId: e.target.value})}>
              <option value="">Select…</option>
              {employees.map((e) => <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>)}
            </select>
          </div>
          <div className="form-group"><label>Title <span className="required">*</span></label><input value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} /></div>
          <div className="form-group"><label>Description</label><textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} /></div>
          <div className="form-group"><label>Target Date <span className="required">*</span></label><input type="date" value={form.targetDate} onChange={(e) => setForm({...form, targetDate: e.target.value})} /></div>
        </Modal>
      )}
      {progressModal && (
        <Modal open onClose={() => setProgressModal(null)} title={`Update — ${progressModal.title}`} size="sm" footer={<><button className="btn-secondary" onClick={() => setProgressModal(null)}>Cancel</button><button className="btn-primary" onClick={updateProgress} disabled={busy}>Save</button></>}>
          <div className="form-group"><label>Progress ({progressVal}%)</label>
            <input type="range" min={0} max={100} value={progressVal} onChange={(e) => setProgressVal(Number(e.target.value))} style={{ width: '100%' }} />
          </div>
          <div className="progress" style={{ marginTop: 8 }}><div className="progress-fill" style={{ width: `${progressVal}%` }} /></div>
        </Modal>
      )}
    </DashboardLayout>
  );
};

const StatusPill: React.FC<{status: string}> = ({ status }) => {
  const colors: Record<string, string> = { not_started: 'var(--gray-600)', in_progress: 'var(--amber-600)', completed: 'var(--green-600)' };
  const bg: Record<string, string> = { not_started: 'var(--gray-100)', in_progress: 'var(--amber-100)', completed: 'var(--green-100)' };
  return <span style={{ fontSize: 11.5, fontWeight: 600, padding: '4px 10px', borderRadius: 999, background: bg[status] || bg.not_started, color: colors[status] || colors.not_started, textTransform: 'capitalize' }}>{(status || 'not_started').replace(/_/g, ' ')}</span>;
};

export default Goals;
