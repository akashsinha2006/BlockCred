import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Files, ChevronLeft, ChevronRight, FilePlus2 } from 'lucide-react';
import { api } from '../api';
import { PageHead, StatusBadge, credentialState, Skeleton, Empty, fmtDate } from '../components/Ui';

const FILTERS = [['', 'All'], ['active', 'Active'], ['revoked', 'Revoked']];

export default function Credentials() {
  const [params, setParams] = useSearchParams();
  const status = params.get('status') || '';
  const [input, setInput] = useState(params.get('q') || '');
  const [q, setQ] = useState(input);
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => { const t = setTimeout(() => { setQ(input.trim()); setPage(1); }, 300); return () => clearTimeout(t); }, [input]);

  useEffect(() => {
    let cancelled = false;
    setError('');
    api(`/credentials?${new URLSearchParams({ q, status, page, limit: 8 })}`)
      .then((d) => !cancelled && setData(d))
      .catch((e) => !cancelled && setError(e.message));
    return () => { cancelled = true; };
  }, [q, status, page]);

  const setStatus = (s) => { setPage(1); setParams(s ? { status: s } : {}); };

  return (
    <>
      <PageHead title="Credentials" desc="Search and manage every record you’ve issued." action={<Link to="/issue" className="btn primary"><FilePlus2 size={15} /> Issue new</Link>} />
      <div className="card">
        <div className="toolbar">
          <div className="search"><Search size={16} /><input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Search by ID, student, institution or degree…" aria-label="Search credentials" /></div>
          <div className="chips" role="tablist">
            {FILTERS.map(([v, l]) => <button key={l} role="tab" aria-selected={status === v} className={`chip ${status === v ? 'on' : ''}`} onClick={() => setStatus(v)}>{l}</button>)}
          </div>
        </div>
        {error && <div className="alert" role="alert">{error}</div>}
        {!data && !error ? <div className="stack">{[...Array(5)].map((_, i) => <Skeleton key={i} h={38} />)}</div>
          : data && !data.items.length ? <Empty icon={Files} title="No matching credentials" text={q || status ? 'Try a different search or filter.' : 'Issue a credential to get started.'} />
          : data && (
            <>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Credential ID</th><th>Student</th><th>Qualification</th><th>Institution</th><th>Issued</th><th>Status</th></tr></thead>
                  <tbody>
                    {data.items.map((c) => (
                      <tr key={c.credentialId}>
                        <td><Link className="mono link" to={`/credentials/${c.credentialId}`}>{c.credentialId}</Link></td>
                        <td>{c.studentName}</td><td>{c.qualification}</td><td>{c.institution}</td><td>{fmtDate(c.issueDate)}</td>
                        <td><StatusBadge value={credentialState(c)} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="pager">
                <span>{data.total} record{data.total !== 1 ? 's' : ''}</span>
                <div className="row">
                  <button className="icon-btn lg" disabled={page <= 1} onClick={() => setPage(page - 1)} aria-label="Previous page"><ChevronLeft size={16} /></button>
                  <span>Page {data.page} of {data.pages}</span>
                  <button className="icon-btn lg" disabled={page >= data.pages} onClick={() => setPage(page + 1)} aria-label="Next page"><ChevronRight size={16} /></button>
                </div>
              </div>
            </>
          )}
      </div>
    </>
  );
}
