import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const URGENCY_ORDER = { critical: 0, high: 1, normal: 2, low: 3 };

export default function WorkspaceDetailPage() {
  const { id } = useParams();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const [ws, setWs] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ heading: '', description: '', urgency: 'normal', dueBy: '', assignedTo: '' });

  const fetchData = async () => {
    try {
      const [wsRes, mRes] = await Promise.all([
        api.get(`/workspace/${id}`),
        isAdmin ? api.get('/members') : Promise.resolve({ data: { members: [] } }),
      ]);
      setWs(wsRes.data.workspace);
      setTickets(wsRes.data.tickets);
      setMembers(mRes.data.members);
    } catch {
      toast.error('Failed to load workspace.');
      navigate('/workspaces');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, workspaceRef: id };
      if (!payload.assignedTo) delete payload.assignedTo;
      const { data } = await api.post('/tickets', payload);
      setTickets([data.ticket, ...tickets]);
      setShowModal(false);
      setForm({ heading: '', description: '', urgency: 'normal', dueBy: '', assignedTo: '' });
      toast.success('Ticket created!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed.');
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${ws.title}" and all its tickets?`)) return;
    await api.delete(`/workspace/${id}`);
    toast.success('Workspace deleted.');
    navigate('/workspaces');
  };

  if (loading) return <LoadingSpinner />;
  if (!ws) return null;

  const sortedTickets = [...tickets].sort((a, b) => URGENCY_ORDER[a.urgency] - URGENCY_ORDER[b.urgency]);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.5rem' }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/workspaces')}><ArrowLeft size={14} /></button>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: ws.colorTag }} />
            <h1 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{ws.title}</h1>
          </div>
          {ws.summary && <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 3 }}>{ws.summary}</p>}
        </div>
        {isAdmin && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}><Plus size={13} /> Ticket</button>
            <button className="btn btn-danger btn-sm" onClick={handleDelete}><Trash2 size={13} /></button>
          </div>
        )}
      </div>

      {/* Progress */}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 13 }}>
          <span style={{ color: 'var(--text-muted)' }}>Progress</span>
          <span style={{ fontWeight: 600, color: 'var(--accent-light)' }}>{ws.progressPct}%</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${ws.progressPct}%`, background: ws.colorTag }} />
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', marginTop: 12, fontSize: 12, color: 'var(--text-muted)' }}>
          <span>📋 {tickets.length} total</span>
          <span>✅ {tickets.filter(t => t.resolution === 'done').length} done</span>
          <span>⏳ {tickets.filter(t => t.resolution === 'in_progress').length} in progress</span>
          {ws.dueOn && <span>📅 Due {format(new Date(ws.dueOn), 'MMM d, yyyy')}</span>}
        </div>
      </div>

      {/* Ticket list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {sortedTickets.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: 28, marginBottom: 10 }}>🎯</div>
            <div style={{ fontWeight: 500 }}>No tickets yet</div>
            {isAdmin && <div style={{ fontSize: 13, marginTop: 4 }}>Add tickets to track work.</div>}
          </div>
        ) : sortedTickets.map((t) => (
          <div key={t._id} className="card" style={{ cursor: 'pointer', transition: 'border-color 0.15s' }}
            onClick={() => navigate(`/tickets/${t._id}`)}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-hover)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, marginBottom: 5 }}>{t.heading}</div>
                {t.description && (
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {t.description.slice(0, 80)}{t.description.length > 80 ? '…' : ''}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <span className={`badge badge-${t.urgency}`}>{t.urgency}</span>
                <span className={`badge badge-${t.resolution}`}>{t.resolution.replace('_', ' ')}</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-muted)' }}>
                {t.assignedTo && (
                  <>
                    <div className="avatar" style={{ width: 20, height: 20, fontSize: 9 }}>{t.assignedTo.avatarInitials}</div>
                    <span>{t.assignedTo.displayName}</span>
                  </>
                )}
              </div>
              {t.dueBy && (
                <span style={{ fontSize: 11, color: t.isOverdue ? 'var(--danger)' : 'var(--text-dim)' }}>
                  {t.isOverdue ? '⚠ ' : ''}Due {format(new Date(t.dueBy), 'MMM d')}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create ticket modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">New Ticket</span>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}><X size={14} /></button>
            </div>
            <form onSubmit={handleCreateTicket}>
              <div className="form-group">
                <label className="label">Heading *</label>
                <input className="input" placeholder="Short description of work" value={form.heading}
                  onChange={e => setForm({ ...form, heading: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="label">Details</label>
                <textarea className="textarea" placeholder="More context…" value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div className="form-group">
                  <label className="label">Urgency</label>
                  <select className="select" value={form.urgency} onChange={e => setForm({ ...form, urgency: e.target.value })}>
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="label">Due by</label>
                  <input className="input" type="date" value={form.dueBy} onChange={e => setForm({ ...form, dueBy: e.target.value })} />
                </div>
              </div>
              {members.length > 0 && (
                <div className="form-group">
                  <label className="label">Assign to</label>
                  <select className="select" value={form.assignedTo} onChange={e => setForm({ ...form, assignedTo: e.target.value })}>
                    <option value="">Unassigned</option>
                    {ws.collaborators?.map(c => (
                      <option key={c.account._id} value={c.account._id}>{c.account.displayName}</option>
                    ))}
                  </select>
                </div>
              )}
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)} style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Create Ticket</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
