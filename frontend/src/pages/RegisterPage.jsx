import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function RegisterPage() {
  const [form, setForm] = useState({ displayName: '', emailAddress: '', password: '', accountRole: 'member' });
  const [busy, setBusy] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.post('/auth/register', form);
      login(data.token, data.account);
      toast.success('Account created!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem',
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: 'var(--accent)', display: 'inline-flex',
            alignItems: 'center', justifyContent: 'center', marginBottom: 16,
          }}>
            <Zap size={24} color="#fff" />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: 6 }}>Create your account</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Join your team on TaskFlow.</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="label">Full name</label>
              <input className="input" placeholder="Alex Rivera" value={form.displayName}
                onChange={(e) => setForm({ ...form, displayName: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="label">Email</label>
              <input className="input" type="email" placeholder="alex@company.com" value={form.emailAddress}
                onChange={(e) => setForm({ ...form, emailAddress: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="label">Password</label>
              <input className="input" type="password" placeholder="min 8 characters" value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={8} />
            </div>
            <div className="form-group">
              <label className="label">Role</label>
              <select className="select" value={form.accountRole}
                onChange={(e) => setForm({ ...form, accountRole: e.target.value })}>
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button className="btn btn-primary" type="submit" disabled={busy}
              style={{ width: '100%', justifyContent: 'center', height: 40, marginTop: 4 }}>
              {busy ? 'Creating account…' : 'Create account'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: 13, color: 'var(--text-muted)' }}>
          Already registered? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
