import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { AlertTriangle, CheckCircle2, Clock, FolderOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const PIE_COLORS = { low: '#7b849a', normal: '#818cf8', high: '#fbbf24', critical: '#f87171' };

export default function DashboardPage() {
  const { currentUser, isAdmin } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/overview').then(({ data }) => {
      setData(data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!data) return null;

  const { stats, urgencyBreakdown, last7, teamStats } = data;

  const statCards = [
    { label: 'Total Tickets', value: stats.totalTickets, icon: Clock, color: 'var(--info)' },
    { label: 'In Progress', value: stats.inProgressTickets, icon: Clock, color: 'var(--warning)' },
    { label: 'Completed', value: stats.doneTickets, icon: CheckCircle2, color: 'var(--success)' },
    { label: 'Overdue', value: stats.overdueTickets, icon: AlertTriangle, color: 'var(--danger)' },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Good to see you, {currentUser?.displayName.split(' ')[0]} 👋</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 3 }}>
            Here's what's happening across your workspaces.
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div className="stat-card" key={label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <span className="stat-label">{label}</span>
              <Icon size={16} color={color} style={{ opacity: 0.8 }} />
            </div>
            <div className="stat-value" style={{ color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        {/* Bar chart: tickets this week */}
        <div className="card">
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: '1.1rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: 11 }}>
            Tickets — last 7 days
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={last7} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="label" tick={{ fill: '#7b849a', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#7b849a', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: '#1e2535', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, fontSize: 12 }}
                cursor={{ fill: 'rgba(99,102,241,0.07)' }}
              />
              <Bar dataKey="count" fill="var(--accent)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart: urgency breakdown */}
        <div className="card">
          <div style={{ fontSize: 11, fontWeight: 600, marginBottom: '1.1rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Urgency distribution
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={urgencyBreakdown} dataKey="count" nameKey="label" cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                {urgencyBreakdown.map((entry) => (
                  <Cell key={entry.label} fill={PIE_COLORS[entry.label]} />
                ))}
              </Pie>
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={(val) => <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>{val}</span>}
              />
              <Tooltip
                contentStyle={{ background: '#1e2535', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, fontSize: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Workspace summary */}
      <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
        <div className="stat-card" style={{ flex: '0 0 auto', minWidth: 180 }}>
          <div className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <FolderOpen size={13} /> Workspaces
          </div>
          <div className="stat-value" style={{ color: 'var(--accent-light)' }}>{stats.totalWorkspaces}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{stats.activeWorkspaces} active</div>
        </div>

        {/* Team productivity (admin only) */}
        {isAdmin && teamStats && teamStats.length > 0 && (
          <div className="card" style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 600, marginBottom: '1rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Team productivity
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {teamStats.map(({ member, total, done, overdue }) => (
                <div key={member._id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className="avatar">{member.avatarInitials}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{member.displayName}</span>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {done}/{total} done
                        {overdue > 0 && <span style={{ color: 'var(--danger)', marginLeft: 8 }}>· {overdue} overdue</span>}
                      </span>
                    </div>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${total ? Math.round((done / total) * 100) : 0}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
