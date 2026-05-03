import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function TicketDetailPage() {
  const { id } = useParams();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchTicket = () =>
    api.get(`/tickets/${id}`).then(({ data }) => setTicket(data.ticket)).finally(() => setLoading(false));

  useEffect(() => { fetchTicket(); }, [id]);

  const handleStatusChange = async (resolution) => {
    try {
      const { data } = await api.patch(`/tickets/${id}`, { resolution });
      setTicket(prev => ({ ...prev, ...data.ticket }));
      toast.success('Status updated.');
    } catch {
      toast.error('Update failed.');
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await api.post(`/tickets/${id}/comment`, { body: comment });
      setTicket(prev => ({ ...prev, activityLog: data.activityLog }));
      setComment('');
    } catch {
      toast.error('Failed to post comment.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!ticket) return null;

  const statusOptions = [
    { value: 'open', label: 'Open' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'done', label: 'Done' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.5rem' }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}><ArrowLeft size={14} /></button>
        {ticket.workspaceRef && (
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: ticket.workspaceRef.colorTag, marginRight: 5 }} />
            {ticket.workspaceRef.title}
          </span>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1.25rem', alignItems: 'start' }}>
        {/* Main */}
        <div>
          <h1 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.75rem' }}>{ticket.heading}</h1>

          {ticket.description && (
            <div className="card" style={{ marginBottom: '1.25rem', fontSize: 13, lineHeight: 1.7, color: 'var(--text-muted)' }}>
              {ticket.description}
            </div>
          )}

          {/* Activity log */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              Activity
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {ticket.activityLog.map((entry, i) => (
                <div key={i} style={{ display: 'flex', gap: 10 }}>
                  <div className="avatar" style={{ flexShrink: 0 }}>{entry.postedBy?.avatarInitials || '?'}</div>
                  <div style={{ flex: 1, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '9px 12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontWeight: 500, fontSize: 13 }}>{entry.postedBy?.displayName}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>
                        {format(new Date(entry.createdAt), 'MMM d, h:mm a')}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, color: entry.entryType === 'comment' ? 'var(--text)' : 'var(--text-muted)', fontStyle: entry.entryType !== 'comment' ? 'italic' : 'normal' }}>
                      {entry.body}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Comment box */}
          <form onSubmit={handleComment} style={{ display: 'flex', gap: 8 }}>
            <input
              className="input"
              placeholder="Add a comment…"
              value={comment}
              onChange={e => setComment(e.target.value)}
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn btn-primary" disabled={submitting || !comment.trim()}>
              <Send size={13} />
            </button>
          </form>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {/* Status */}
          <div className="card">
            <div className="label" style={{ marginBottom: 10 }}>Status</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {statusOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => handleStatusChange(opt.value)}
                  className="btn btn-ghost"
                  style={{
                    justifyContent: 'flex-start',
                    background: ticket.resolution === opt.value ? 'var(--accent-dim)' : undefined,
                    color: ticket.resolution === opt.value ? 'var(--accent-light)' : undefined,
                    borderColor: ticket.resolution === opt.value ? 'var(--accent)' : undefined,
                  }}
                >
                  <span className={`badge badge-${opt.value}`} style={{ pointerEvents: 'none' }}>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Meta */}
          <div className="card" style={{ fontSize: 13 }}>
            <div className="label" style={{ marginBottom: 10 }}>Details</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 3 }}>URGENCY</div>
                <span className={`badge badge-${ticket.urgency}`}>{ticket.urgency}</span>
              </div>
              {ticket.assignedTo && (
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 3 }}>ASSIGNED TO</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <div className="avatar" style={{ width: 24, height: 24, fontSize: 10 }}>{ticket.assignedTo.avatarInitials}</div>
                    <span>{ticket.assignedTo.displayName}</span>
                  </div>
                </div>
              )}
              {ticket.dueBy && (
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 3 }}>DUE BY</div>
                  <span style={{ color: ticket.isOverdue ? 'var(--danger)' : 'var(--text)' }}>
                    {ticket.isOverdue ? '⚠ ' : ''}{format(new Date(ticket.dueBy), 'MMM d, yyyy')}
                  </span>
                </div>
              )}
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 3 }}>RAISED BY</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <div className="avatar" style={{ width: 24, height: 24, fontSize: 10 }}>{ticket.raisedBy?.avatarInitials}</div>
                  <span>{ticket.raisedBy?.displayName}</span>
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 3 }}>CREATED</div>
                <span>{format(new Date(ticket.createdAt), 'MMM d, yyyy')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
