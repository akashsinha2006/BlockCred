import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Sparkles, Loader2, ShieldCheck, FileSignature, QrCode, ExternalLink, Database } from 'lucide-react';
import { api, qrUrl } from '../api';
import { useToast } from '../context/Toast';
import { PageHead, CopyButton } from '../components/Ui';

const today = () => new Date().toISOString().slice(0, 10);
const EMPTY = { studentName: '', studentIdentifier: '', institution: '', qualification: '', department: '', graduationYear: new Date().getFullYear(), issueDate: today() };
const SAMPLE = { studentName: 'Aarav Sharma', studentIdentifier: 'DEMO-2026-001', institution: 'Northstar Institute of Technology', qualification: 'Bachelor of Computer Applications', department: 'Computer Science', graduationYear: 2026, issueDate: today() };

function Field({ label, name, form, errors, onChange, type = 'text', full, ...rest }) {
  return (
    <label className={`field ${full ? 'full' : ''} ${errors[name] ? 'has-error' : ''}`}>
      {label}
      <input name={name} type={type} value={form[name]} onChange={onChange} required {...rest} />
      {errors[name] && <span className="field-error">{errors[name]}</span>}
    </label>
  );
}

export default function Issue() {
  const toast = useToast();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  const onChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setErrors({ ...errors, [e.target.name]: undefined }); };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErrors({});
    try {
      const r = await api('/credentials', { method: 'POST', body: { ...form, graduationYear: Number(form.graduationYear) } });
      setResult(r);
      toast.success('Credential issued and signed.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setErrors(err.fields || {});
      toast.error(err.message);
    } finally { setBusy(false); }
  };

  if (result) {
    const c = result.credential;
    return (
      <>
        <PageHead title="Credential issued" desc="Share the verification link or QR code with the student." />
        <div className="card success-card">
          <div className="success-head">
            <CheckCircle2 size={26} />
            <div><h3>Issued and digitally signed</h3>
              <p>The credential is saved and ready to verify.</p></div>
          </div>
          <div className="success-body">
            <img className="qr" src={qrUrl(c.credentialId)} alt={`QR code for ${c.credentialId}`} width="150" height="150" />
            <dl className="kv wide">
              <dt>Credential ID</dt><dd><code>{c.credentialId}</code> <CopyButton text={c.credentialId} label="Copy ID" /></dd>
              <dt>Student</dt><dd>{c.studentName}</dd>
              <dt>Verification link</dt><dd><code className="trunc">{c.verificationUrl}</code> <CopyButton text={c.verificationUrl} label="Copy link" /></dd>
            </dl>
          </div>
          <div className="row">
            <Link className="btn primary" to={`/credentials/${c.credentialId}`}>View details</Link>
            <a className="btn secondary" href={c.verificationUrl} target="_blank" rel="noreferrer">Open verify page <ExternalLink size={14} /></a>
            <button className="btn ghost" onClick={() => { setResult(null); setForm(EMPTY); }}>Issue another</button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHead title="Issue a credential" desc="Create a digitally signed academic record that anyone can verify." />
      <div className="issue-layout">
        <form className="card" onSubmit={submit} noValidate={false}>
          <div className="card-head">
            <div><h3>Academic details</h3><p>Use fictional details for your presentation.</p></div>
            <button type="button" className="btn ghost sm" onClick={() => { setForm(SAMPLE); setErrors({}); }}><Sparkles size={14} /> Fill sample data</button>
          </div>
          <div className="form-grid">
            <Field label="Student full name" name="studentName" {...{ form, errors, onChange }} minLength={2} placeholder="e.g. Aarav Sharma" />
            <Field label="Student identifier" name="studentIdentifier" {...{ form, errors, onChange }} placeholder="e.g. DEMO-2026-001" />
            <Field label="Institution" name="institution" full {...{ form, errors, onChange }} minLength={2} placeholder="Institution name" />
            <Field label="Degree / qualification" name="qualification" full {...{ form, errors, onChange }} minLength={2} placeholder="e.g. Bachelor of Computer Applications" />
            <Field label="Department / field of study" name="department" full {...{ form, errors, onChange }} minLength={2} placeholder="e.g. Computer Science" />
            <Field label="Graduation year" name="graduationYear" type="number" min="1950" max="2100" {...{ form, errors, onChange }} />
            <Field label="Issue date" name="issueDate" type="date" {...{ form, errors, onChange }} />
          </div>
          <div className="banner info"><ShieldCheck size={18} /> <span><b>Tamper-proof.</b> Each record is digitally signed, so any later edit is detected during verification.</span></div>
          <button className="btn primary wide lg" disabled={busy}>{busy ? <><Loader2 size={17} className="spin" /> Issuing…</> : 'Issue credential'}</button>
        </form>
        <aside className="card side">
          <h3>What happens next</h3>
          <ol className="timeline">
            <li><span><ShieldCheck size={15} /></span><div><b>Validate</b><p>Fields are checked on the server.</p></div></li>
            <li><span><FileSignature size={15} /></span><div><b>Sign</b><p>A unique ID and digital signature are created.</p></div></li>
            <li><span><Database size={15} /></span><div><b>Save</b><p>The record is stored in MongoDB.</p></div></li>
            <li><span><QrCode size={15} /></span><div><b>Share</b><p>You get a QR code and a public verification link.</p></div></li>
          </ol>
        </aside>
      </div>
    </>
  );
}
