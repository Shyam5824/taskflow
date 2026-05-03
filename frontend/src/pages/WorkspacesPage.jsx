import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Calendar, Users, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const PHASE_LABELS = { draft: 'Draft', active: 'Active', on_hold: 'On Hold', wrapped_up: 'Done' };
const PHASE_COLORS = { draft: 'var(--text-muted)', active: 'var(--success)', on_hold: 'var(--warning)', wrapped_up: 'var(--accent-light)' };

export default function WorkspacesPage() {
  const { isAdmin } = useAuth();
  const [workspaces, setWorkspaces] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', summary: '', dueOn: '', colorTag: '#6366f1', memberIds: [] });

  const fetchData = async () => {
    try {
      const [wsRes, mRes] = await Promise.all([
        api.get('/workspace'),
        isAdmin ? api.get('/members') : Promise.resolve({ data: { members: [] } }),
      ]);
      setWorkspaces(wsRes.data.workspaces);
      setMembers(mRes.data.members);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/workspace', form);
      setWorkspaces([data.workspace, ...workspaces]);
      setShowModal(false);
      setForm({ title: '', summary: '', dueOn: '', colorTag: '#6366f1', memberIds: [] });
      toast.success('Workspace created!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create.');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Workspaces</div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={15} /> New Workspace
          </button>
        )}
      </div>

      {workspaces.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: 32, marginBottom: 12 }}>📂</div>
          <div style={{ fontWeight: 500, marginBottom: 6 }}>No workspaces yet</div>
          {isAdmin && <div style={{ fontSize: 13 }}>Create your first workspace to get started.</div>}
        </div>
      ) : (
        <div className="grid-2">
          {workspaces.map((ws) => (
            <Link key={ws._id} to={`/workspaces/${ws._id}`} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ cursor: 'pointer', transition: 'border-color 0.15s', borderColor: 'var(--border)' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-hover)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                {/* Color bar */}
                <div style={{ height: 4, borderRadius: 4, background: ws.colorTag, marginBottom: 14, width: 40 }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 600 }}>{ws.title}</h3>
                  <span style={{ fontSize: 11, color: PHASE_COLORS[ws.currentPhase], fontWeight: 500 }}>
                    {PHASE_LABELS[ws.currentPhase]}
                  </span>
                </div>

                {ws.summary && (
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14, lineHeight: 1.5 }}>
                    {ws.summary.slice(0, 100)}{ws.summary.length > 100 ? '…' : ''}
                  </p>
                )}

                <div className="progress-track" style={{ marginBottom: 8 }}>
                  <div className="progress-fill" style={{ width: `${ws.progressPct}%`, background: ws.colorTag }} />
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 14 }}>{ws.progressPct}% complete · {ws.ticketCount} tickets</div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Users size={13} color="var(--text-muted)" />
                    <div style={{ display: 'flex' }}>
                      {ws.collaborators.slice(0, 4).map((c) => (
                        <div key={c.account._id} className="avatar" style={{ width: 24, height: 24, fontSize: 10, marginLeft: -6, border: '2px solid var(--surface)' }}>
                          {c.account.avatarInitials}
                        </div>
                      ))}
                    </div>
                  </div>
                  {ws.dueOn && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-muted)' }}>
                      <Calendar size={12} />
                      {format(new Date(ws.dueOn), 'MMM d, yyyy')}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">New Workspace</span>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}><X size={14} /></button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="label">Title *</label>
                <input className="input" placeholder="e.g. Q1 Marketing Campaign" value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="label">Summary</label>
                <textarea className="textarea" placeholder="What is this workspace about?" value={form.summary}
                  onChange={e => setForm({ ...form, summary: e.target.value })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10 }}>
                <div className="form-group">
                  <label className="label">Deadline</label>
                  <input className="input" type="date" value={form.dueOn}
                    onChange={e => setForm({ ...form, dueOn: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="label">Color</label>
                  <input type="color" value={form.colorTag}
                    onChange={e => setForm({ ...form, colorTag: e.target.value })}
                    style={{ height: 37, width: 48, border: '1px solid var(--border)', borderRadius: 8, background: 'none', cursor: 'pointer', padding: 2 }} />
                </div>
              </div>
              {members.length > 0 && (
                <div className="form-group">
                  <label className="label">Add members</label>
                  <select className="select" multiple style={{ height: 100 }}
                    onChange={e => setForm({ ...form, memberIds: [...e.target.selectedOptions].map(o => o.value) })}>
                    {members.map(m => (
                      <option key={m._id} value={m._id}>{m.displayName}</option>
                    ))}
                  </select>
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)} style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
