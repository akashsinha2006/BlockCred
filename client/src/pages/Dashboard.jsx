import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Files, CheckCircle2, Ban, ScanSearch, RefreshCw, FilePlus2, ArrowRight, ShieldCheck } from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../context/Auth';
import { PageHead, StatusBadge, credentialState, Skeleton, Empty, fmtDate } from '../components/Ui';

function Stat({ label, value, Icon, tone, note }) {
  return (
    <div className="card stat">
      <div className={`stat-icon ${tone}`}><Icon size={19} /></div>
      <div>
        <small>{label}</small>
        <strong>{value ?? <Skeleton h={28} w={48} />}</strong>
        <em>{note}</em>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const load = useCallback(() => {
    setError('');
    api('/dashboard').then(setData).catch((e) => setError(e.message));
  }, []);
  useEffect(load, [load]);

  const t = data?.totals;
  const max = Math.max(1, ...(data?.activity.map((a) => a.count) || [1]));
  const name = user?.email?.split('@')[0];

  return (
    <>
      <PageHead
        title={`Welcome back${name ? `, ${name}` : ''}`}
        desc="Here’s what’s happening with your credentials."
        action={<div className="row"><button className="btn secondary" onClick={load}><RefreshCw size={15} /> Refresh</button><Link to="/issue" className="btn primary"><FilePlus2 size={15} /> Issue credential</Link></div>}
      />
      {error && <div className="alert" role="alert">{error}</div>}
      <div className="grid-4">
        <Stat label="Issued" value={t?.total} Icon={Files} tone="indigo" note="All records" />
        <Stat label="Active" value={t?.active} Icon={CheckCircle2} tone="green" note="Currently valid" />
        <Stat label="Revoked" value={t?.revoked} Icon={Ban} tone="red" note="Withdrawn by issuer" />
        <Stat label="Verified checks" value={t?.verified} Icon={ScanSearch} tone="amber" note={t ? `${t.invalid} failed lookups` : ''} />
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-head"><div><h3>Verification activity</h3><p>Checks over the last 7 days</p></div></div>
          {!data ? <Skeleton h={140} /> : (
            <div className="bars" role="img" aria-label="Verification checks per day">
              {data.activity.map((a) => (
                <div key={a.date} className="bar-col" title={`${a.count} checks`}>
                  <span className="bar-val">{a.count || ''}</span>
                  <div className="bar" style={{ height: `${(a.count / max) * 100}%`, minHeight: a.count ? 6 : 3 }} />
                  <span className="bar-label">{new Date(a.date + 'T00:00').toLocaleDateString(undefined, { weekday: 'short' })}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="card">
          <div className="card-head"><div><h3>Record integrity</h3><p>How credentials are protected</p></div><ShieldCheck size={20} className="muted" /></div>
          {!data ? <Skeleton h={90} /> : (
            <>
              <div className="conn ok"><span className="dot" /> Signing active</div>
              <p className="muted small">Every credential is digitally signed (HMAC-SHA256). If a record is edited after issuing, verification fails.</p>
              <dl className="kv" style={{ marginTop: 14 }}>
                <dt>Passed checks</dt><dd>{data.totals.verified}</dd>
                <dt>Failed lookups</dt><dd>{data.totals.invalid}</dd>
              </dl>
            </>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-head"><div><h3>Recent credentials</h3><p>Your latest five records</p></div><Link className="text-link" to="/credentials">View all <ArrowRight size={14} /></Link></div>
        {!data ? <div className="stack"><Skeleton h={38} /><Skeleton h={38} /><Skeleton h={38} /></div>
          : !data.recent.length ? <Empty icon={Files} title="No credentials yet" text="Issue your first fictional credential to see it here." action={<Link to="/issue" className="btn primary">Issue first credential</Link>} />
          : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Credential</th><th>Student</th><th>Qualification</th><th>Issued</th><th>Status</th></tr></thead>
                <tbody>
                  {data.recent.map((c) => (
                    <tr key={c.credentialId}>
                      <td><Link className="mono link" to={`/credentials/${c.credentialId}`}>{c.credentialId}</Link></td>
                      <td>{c.studentName}</td><td>{c.qualification}</td><td>{fmtDate(c.issueDate)}</td>
                      <td><StatusBadge value={credentialState(c)} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>
    </>
  );
}
