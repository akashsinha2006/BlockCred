import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft, ScanSearch, Printer, Ban, ShieldCheck } from 'lucide-react';
import { api, qrUrl } from '../api';
import { useToast } from '../context/Toast';
import { StatusBadge, credentialState, CopyButton, ConfirmDialog, Skeleton, fmtDate, fmtDateTime } from '../components/Ui';

function Row({ label, value, mono, copy }) {
  return (
    <div className="detail">
      <small>{label}</small>
      <div><span className={mono ? 'mono wrap' : ''}>{value || '—'}</span>{copy && value && <CopyButton text={value} />}</div>
    </div>
  );
}

export default function Details() {
  const { id } = useParams();
  const toast = useToast();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => api(`/credentials/${encodeURIComponent(id)}`).then(setData).catch((e) => setError(e.message)), [id]);
  useEffect(() => { load(); }, [load]);

  const act = async (path, okMsg) => {
    setBusy(true);
    try { await api(`/credentials/${id}/${path}`, { method: 'POST' }); toast.success(okMsg); setConfirm(false); await load(); }
    catch (e) { toast.error(e.message); setConfirm(false); }
    finally { setBusy(false); }
  };

  if (error) return <div className="card"><div className="alert">{error}</div><Link to="/credentials" className="btn secondary">Back to credentials</Link></div>;
  if (!data) return <div className="card stack"><Skeleton h={28} w="40%" /><Skeleton h={120} /><Skeleton h={120} /></div>;

  const c = data.credential;
  const state = credentialState(c);

  return (
    <>
      <Link to="/credentials" className="back"><ChevronLeft size={16} /> All credentials</Link>
      <div className="page-head">
        <div>
          <div className="row"><h1 className="mono-title">{c.credentialId}</h1><StatusBadge value={state} /></div>
          <p>{c.qualification} · {c.institution}</p>
        </div>
        <div className="row wrap">
          <Link className="btn secondary" to={`/verify/${c.credentialId}`}><ScanSearch size={15} /> Verify</Link>
          <button className="btn secondary" onClick={() => window.print()}><Printer size={15} /> Print certificate</button>
          {!c.revoked && <button className="btn danger" onClick={() => setConfirm(true)}><Ban size={15} /> Revoke</button>}
        </div>
      </div>

      {c.revoked && <div className="banner danger">Revoked on {fmtDate(c.revokedAt)}. Verifiers will see this credential as revoked.</div>}

      <div className="grid-main">
        <div className="card">
          <div className="card-head"><h3>Record</h3></div>
          <div className="details">
            <Row label="Student" value={c.studentName} /><Row label="Student identifier" value={c.studentIdentifier} />
            <Row label="Department" value={c.department} /><Row label="Graduation year" value={String(c.graduationYear)} />
            <Row label="Issue date" value={fmtDate(c.issueDate)} /><Row label="Created" value={fmtDateTime(c.createdAt)} />
            <Row label="Digital signature (HMAC-SHA256)" value={c.signature} mono copy />
          </div>
        </div>
        <div className="stack gap">
          <div className="card center">
            <img className="qr" src={qrUrl(c.credentialId)} alt="Verification QR code" width="170" height="170" />
            <p className="muted small">Scan to open the public verification page</p>
            <div className="row center-row"><code className="trunc">{c.verificationUrl}</code><CopyButton text={c.verificationUrl} label="Copy link" /></div>
          </div>
          <div className="card">
            <div className="card-head"><h3>Verification history</h3></div>
            {!data.events.length ? <p className="muted small">No one has verified this credential yet.</p> : (
              <ul className="history">
                {data.events.map((e, i) => <li key={i}><StatusBadge value={e.status} /><span>{fmtDateTime(e.checkedAt)}</span></li>)}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Print-only certificate */}
      <section className="certificate">
        <div className="cert-frame">
          <ShieldCheck size={40} />
          <p className="cert-kicker">{c.institution}</p>
          <h1>Certificate of Achievement</h1>
          <p>This certifies that</p>
          <h2>{c.studentName}</h2>
          <p>has been awarded</p>
          <h3>{c.qualification}</h3>
          <p>{c.department} · Class of {c.graduationYear}</p>
          <div className="cert-foot">
            <div><small>Issued</small><b>{fmtDate(c.issueDate)}</b><small>ID</small><b>{c.credentialId}</b></div>
            <img src={qrUrl(c.credentialId)} alt="" width="110" height="110" />
          </div>
          <p className="cert-note">Verify at {c.verificationUrl}. Demonstration document — fictional data.</p>
        </div>
      </section>

      <ConfirmDialog open={confirm} danger busy={busy} title="Revoke this credential?" confirmLabel="Revoke credential"
        text="Anyone verifying this credential will see it as revoked. This cannot be undone."
        onConfirm={() => act('revoke', 'Credential revoked.')} onCancel={() => setConfirm(false)} />
    </>
  );
}
