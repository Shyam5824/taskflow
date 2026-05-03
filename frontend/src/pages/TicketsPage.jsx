import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Filter } from 'lucide-react';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function TicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ resolution: '', urgency: '' });
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/tickets').then(({ data }) => setTickets(data.tickets)).finally(() => setLoading(false));
  }, []);

  const filtered = tickets.filter(t => {
    if (filter.resolution && t.resolution !== filter.resolution) return false;
    if (filter.urgency && t.urgency !== filter.urgency) return false;
    return true;
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="page-header">
        <div className="page-title">My Tickets</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Filter size={14} color="var(--text-muted)" />
          <select className="select" style={{ width: 130 }} value={filter.resolution}
            onChange={e => setFilter({ ...filter, resolution: e.target.value })}>
            <option value="">All statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
          <select className="select" style={{ width: 130 }} value={filter.urgency}
            onChange={e => setFilter({ ...filter, urgency: e.target.value })}>
            <option value="">All urgencies</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="normal">Normal</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: 28, marginBottom: 10 }}>🎯</div>
          <div style={{ fontWeight: 500 }}>No tickets match your filters</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(t => (
            <div key={t._id} className="card" style={{ cursor: 'pointer', transition: 'border-color 0.15s' }}
              onClick={() => navigate(`/tickets/${t._id}`)}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-hover)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  {t.workspaceRef && (
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 5, display: 'flex', alignItems: 'center', gap: 5 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: t.workspaceRef.colorTag }} />
                      {t.workspaceRef.title}
                    </div>
                  )}
                  <div style={{ fontWeight: 500 }}>{t.heading}</div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <span className={`badge badge-${t.urgency}`}>{t.urgency}</span>
                  <span className={`badge badge-${t.resolution}`}>{t.resolution.replace('_', ' ')}</span>
                </div>
              </div>
              {t.dueBy && (
                <div style={{ marginTop: 8, fontSize: 12, color: t.isOverdue ? 'var(--danger)' : 'var(--text-dim)' }}>
                  {t.isOverdue ? '⚠ Overdue · ' : ''}Due {format(new Date(t.dueBy), 'MMM d, yyyy')}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
