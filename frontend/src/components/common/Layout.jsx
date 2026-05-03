import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, FolderKanban, Ticket, Users, LogOut, Zap
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { to: '/workspaces', icon: FolderKanban, label: 'Workspaces' },
  { to: '/tickets', icon: Ticket, label: 'Tickets' },
];

export default function Layout() {
  const { currentUser, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="layout">
      <aside className="sidebar">
        {/* Brand */}
        <div style={{ padding: '1.25rem 1rem 0.75rem', display: 'flex', alignItems: 'center', gap: '9px' }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={15} color="#fff" />
          </div>
          <span style={{ fontWeight: 600, fontSize: '0.95rem', letterSpacing: '-0.01em' }}>TaskFlow</span>
        </div>

        {/* Role chip */}
        <div style={{ padding: '0 1rem 1rem' }}>
          <span style={{
            fontSize: '10px', fontWeight: 500, letterSpacing: '0.06em',
            textTransform: 'uppercase', color: isAdmin ? 'var(--accent-light)' : 'var(--text-muted)',
            background: isAdmin ? 'var(--accent-dim)' : 'var(--surface2)',
            padding: '2px 8px', borderRadius: 20,
          }}>
            {currentUser?.accountRole}
          </span>
        </div>

        <hr className="divider" style={{ margin: '0 0 0.75rem' }} />

        {/* Nav */}
        <nav style={{ flex: 1, padding: '0 0.5rem' }}>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 9,
              padding: '8px 12px', borderRadius: 8, marginBottom: 3,
              fontSize: '13.5px', fontWeight: 500,
              color: isActive ? 'var(--accent-light)' : 'var(--text-muted)',
              background: isActive ? 'var(--accent-dim)' : 'transparent',
              textDecoration: 'none', transition: 'all 0.15s',
            })}>
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
          {isAdmin && (
            <NavLink to="/members" style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 9,
              padding: '8px 12px', borderRadius: 8, marginBottom: 3,
              fontSize: '13.5px', fontWeight: 500,
              color: isActive ? 'var(--accent-light)' : 'var(--text-muted)',
              background: isActive ? 'var(--accent-dim)' : 'transparent',
              textDecoration: 'none', transition: 'all 0.15s',
            })}>
              <Users size={16} />
              Members
            </NavLink>
          )}
        </nav>

        {/* Footer */}
        <div style={{ padding: '1rem', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 12 }}>
            <div className="avatar">{currentUser?.avatarInitials}</div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {currentUser?.displayName}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {currentUser?.emailAddress}
              </div>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout} style={{ width: '100%', justifyContent: 'center' }}>
            <LogOut size={13} /> Sign out
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
