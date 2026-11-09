import { useEffect, useRef, useState } from 'react';
import { Check, Copy, CheckCircle2, Clock, Ban, XCircle } from 'lucide-react';

const STATUS = {
  VERIFIED: { cls: 'green', Icon: CheckCircle2, label: 'Verified' },
  ACTIVE: { cls: 'green', Icon: CheckCircle2, label: 'Active' },
  PENDING: { cls: 'amber', Icon: Clock, label: 'Pending' },
  REVOKED: { cls: 'red', Icon: Ban, label: 'Revoked' },
  INVALID: { cls: 'red', Icon: XCircle, label: 'Invalid' },
};

export function StatusBadge({ value }) {
  const s = STATUS[value] || STATUS.PENDING;
  return <span className={`badge ${s.cls}`}><s.Icon size={13} /> {s.label}</span>;
}

export const credentialState = (c) => (c.revoked ? 'REVOKED' : 'ACTIVE');

export function CopyButton({ text, label = 'Copy' }) {
  const [done, setDone] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1500); } catch { /* ignore */ }
  };
  return (
    <button type="button" className="icon-btn" onClick={copy} aria-label={label} title={label}>
      {done ? <Check size={14} /> : <Copy size={14} />}
    </button>
  );
}

export function Skeleton({ h = 16, w = '100%', style }) {
  return <span className="skeleton" style={{ height: h, width: w, ...style }} />;
}

export function Empty({ icon: Icon, title, text, action }) {
  return (
    <div className="empty">
      <div className="empty-icon"><Icon size={22} /></div>
      <b>{title}</b>
      {text && <p>{text}</p>}
      {action}
    </div>
  );
}

export function PageHead({ title, desc, action }) {
  return (
    <div className="page-head">
      <div><h1>{title}</h1>{desc && <p>{desc}</p>}</div>
      {action}
    </div>
  );
}

export function ConfirmDialog({ open, title, text, confirmLabel = 'Confirm', danger, busy, onConfirm, onCancel }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onCancel();
    window.addEventListener('keydown', onKey);
    ref.current?.focus();
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel]);
  if (!open) return null;
  return (
    <div className="overlay" onMouseDown={onCancel}>
      <div className="dialog" role="alertdialog" aria-modal="true" aria-labelledby="dlg-title" onMouseDown={(e) => e.stopPropagation()}>
        <h3 id="dlg-title">{title}</h3>
        <p>{text}</p>
        <div className="row end">
          <button ref={ref} className="btn ghost" onClick={onCancel} disabled={busy}>Cancel</button>
          <button className={`btn ${danger ? 'danger-solid' : 'primary'}`} onClick={onConfirm} disabled={busy}>{busy ? 'Working…' : confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

export const shortHash = (h) => (h ? `${h.slice(0, 10)}…${h.slice(-8)}` : '—');
export const fmtDate = (d) => (d ? new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '—');
export const fmtDateTime = (d) => (d ? new Date(d).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—');
