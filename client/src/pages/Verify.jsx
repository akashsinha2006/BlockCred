import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ScanSearch, CheckCircle2, Ban, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../context/Auth';
import { Brand } from '../components/Layout';
import ThemeToggle from '../components/ThemeToggle';
import { fmtDate, fmtDateTime } from '../components/Ui';

const HERO = {
  VERIFIED: { cls: 'green', Icon: CheckCircle2, title: 'Credential verified' },
  REVOKED: { cls: 'red', Icon: Ban, title: 'Credential revoked' },
  INVALID: { cls: 'red', Icon: XCircle, title: 'Credential not recognised' },
};

export default function Verify() {
  const { id: routeId } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const [id, setId] = useState(routeId || '');
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const run = useCallback(async (value) => {
    if (!value.trim()) return;
    setBusy(true); setError(''); setResult(null);
    try { setResult(await api(`/verify/${encodeURIComponent(value.trim())}`)); }
    catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }, []);

  useEffect(() => { if (routeId) { setId(routeId); run(routeId); } else { setResult(null); } }, [routeId, run]);

  const submit = (e) => { e.preventDefault(); const v = id.trim(); if (v) nav(`/verify/${encodeURIComponent(v)}`); };
  const hero = result && HERO[result.status];
  const c = result?.credential;

  return (
    <div className="public">
      <header className="public-bar">
        <Brand to="/" />
        <div className="row"><ThemeToggle />{user ? <Link className="btn secondary" to="/dashboard">Dashboard</Link> : <Link className="btn secondary" to="/login">Issuer sign in</Link>}</div>
      </header>
      <main className="public-main">
        <section className="verify-hero">
          <div className="verify-mark"><ScanSearch size={26} /></div>
          <h1>Verify a credential</h1>
          <p>Enter the credential ID on the certificate, or scan its QR code.</p>
          <form className="verify-form" onSubmit={submit}>
            <input value={id} onChange={(e) => setId(e.target.value)} placeholder="BC-A1B2C3D4E5F6" aria-label="Credential ID" autoFocus={!routeId} spellCheck="false" />
            <button className="btn primary lg" disabled={busy || !id.trim()}>{busy ? <Loader2 size={17} className="spin" /> : <>Verify <ArrowRight size={16} /></>}</button>
          </form>
        </section>

        {error && <div className="alert" role="alert">{error}</div>}
        {busy && <div className="card center"><span className="spinner" /><p className="muted">Checking the record…</p></div>}

        {result && (
          <section className={`card result ${hero.cls}`} aria-live="polite">
            <div className="result-hero">
              <div className={`result-icon ${hero.cls}`}><hero.Icon size={34} /></div>
              <div><h2>{hero.title}</h2><p>{result.message}</p></div>
            </div>
            {c && (
              <div className="details two">
                <div className="detail"><small>Student</small><b>{c.studentName}</b></div>
                <div className="detail"><small>Institution</small><b>{c.institution}</b></div>
                <div className="detail"><small>Qualification</small><b>{c.qualification}</b></div>
                <div className="detail"><small>Department</small><b>{c.department}</b></div>
                <div className="detail"><small>Graduation year</small><b>{c.graduationYear}</b></div>
                <div className="detail"><small>Issue date</small><b>{fmtDate(c.issueDate)}</b></div>
              </div>
            )}
            <p className="fine">Checked {fmtDateTime(result.checkedAt)}. This confirms the record is unaltered and not revoked; it does not prove the institution is accredited or that the award decision was correct.</p>
          </section>
        )}
      </main>
    </div>
  );
}
