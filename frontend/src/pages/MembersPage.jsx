import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function MembersPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/members').then(({ data }) => setMembers(data.members)).finally(() => setLoading(false));
  }, []);

  const handleRoleToggle = async (memberId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'member' : 'admin';
    try {
      const { data } = await api.patch(`/members/${memberId}/role`, { accountRole: newRole });
      setMembers(prev => prev.map(m => m._id === memberId ? data.account : m));
      toast.success(`Role updated to ${newRole}.`);
    } catch {
      toast.error('Failed to update role.');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Team Members</div>
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{members.length} total</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {members.map(m => (
          <div key={m._id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div className="avatar avatar-lg">{m.avatarInitials}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 500, marginBottom: 2 }}>{m.displayName}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{m.emailAddress}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>
                Joined {format(new Date(m.createdAt), 'MMM yyyy')}
              </span>
              <span className={`badge ${m.accountRole === 'admin' ? 'badge-high' : 'badge-open'}`}>
                {m.accountRole}
              </span>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => handleRoleToggle(m._id, m.accountRole)}
              >
                Toggle role
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
