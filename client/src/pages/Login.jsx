import { useState } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, FileSignature, ScanLine, QrCode, Loader2 } from 'lucide-react';
import { useAuth } from '../context/Auth';
import ThemeToggle from '../components/ThemeToggle';

export default function Login() {
  const { user, login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (user) return <Navigate to="/dashboard" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    try { await login(email, password); nav('/dashboard'); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };

  return (
    <div className="auth">
      <section className="auth-hero">
        <div className="brand light"><span className="brand-icon"><ShieldCheck size={20} /></span><span><b>BlockCred</b><small>Credential trust layer</small></span></div>
        <h1>Credentials that<br />can’t be quietly forged.</h1>
        <p>Issue academic records, digitally sign them, and let anyone verify them in seconds.</p>
        <ul>
          <li><FileSignature size={18} /> Every record is digitally signed</li>
          <li><ScanLine size={18} /> Edited or forged records fail verification</li>
          <li><QrCode size={18} /> One-scan public verification</li>
        </ul>
      </section>
      <section className="auth-form">
        <div className="auth-top"><ThemeToggle /></div>
        <form onSubmit={submit} className="auth-card">
          <h2>Issuer sign in</h2>
          <p className="muted">Sign in to issue and manage credentials.</p>
          <label className="field">Email
            <input type="email" required autoFocus autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@blockcred.local" />
          </label>
          <label className="field">Password
            <input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </label>
          {error && <div className="alert" role="alert">{error}</div>}
          <button className="btn primary wide" disabled={busy}>{busy ? <><Loader2 size={16} className="spin" /> Signing in…</> : 'Sign in'}</button>
          <p className="hint">Credentials are set in <code>server/.env</code>.</p>
          <div className="divider"><span>or</span></div>
          <Link to="/verify" className="btn secondary wide">Verify a credential (no sign-in)</Link>
        </form>
      </section>
    </div>
  );
}
