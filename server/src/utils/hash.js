import crypto from 'node:crypto';

// Fields covered by the signature. Keys are sorted, so order does not matter.
export function credentialPayload(c) {
  return {
    credentialId: c.credentialId,
    studentName: c.studentName,
    studentIdentifier: c.studentIdentifier,
    institution: c.institution,
    qualification: c.qualification,
    department: c.department,
    graduationYear: c.graduationYear,
    issueDate: c.issueDate,
  };
}

// Stable JSON: sorted keys, compact, UTF-8 (flat objects only).
export function canonicalJson(obj) {
  return JSON.stringify(obj, Object.keys(obj).sort());
}

// HMAC-SHA256 signature. Without the server's secret, a record can't be edited
// in the database and still produce a matching signature.
export function signPayload(payload, secret) {
  return crypto.createHmac('sha256', secret).update(canonicalJson(payload), 'utf8').digest('hex');
}

export function signaturesMatch(a, b) {
  const x = Buffer.from(String(a)), y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

export function newCredentialId() {
  return 'BC-' + crypto.randomBytes(6).toString('hex').toUpperCase();
}
