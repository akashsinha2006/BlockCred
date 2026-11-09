import { PageHead } from '../components/Ui';

const STACK = [
  ['MongoDB Atlas', 'Stores credential records and verification history.'],
  ['Express + Node.js', 'REST API: validation, digital signatures, JWT auth.'],
  ['React + Vite', 'Issuer dashboard and the public verification page.'],
];

export default function About() {
  return (
    <>
      <PageHead title="About BlockCred" desc="A prototype for issuing and verifying tamper-evident academic credentials." />
      <div className="grid-2">
        <div className="card">
          <h3>The problem</h3>
          <p className="body">Manual credential checks are slow and forged documents are hard to spot. BlockCred digitally signs each credential so a verifier can confirm a record is genuine, unaltered and not revoked.</p>
          <h3>Limitations</h3>
          <p className="body">A single issuer account and a server-held signing secret make this a demonstration, not a production system. It does not establish institutional accreditation. Use fictional data only.</p>
        </div>
        <div className="card">
          <h3>MERN stack</h3>
          <ul className="stack-list">{STACK.map(([t, d]) => <li key={t}><b>{t}</b><span>{d}</span></li>)}</ul>
        </div>
      </div>
    </>
  );
}
