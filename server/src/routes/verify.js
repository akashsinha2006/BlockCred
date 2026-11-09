import { Router } from 'express';
import { config } from '../config.js';
import { Credential } from '../models/Credential.js';
import { VerificationEvent } from '../models/VerificationEvent.js';
import { asyncHandler } from '../utils/http.js';
import { credentialPayload, signPayload, signaturesMatch } from '../utils/hash.js';

const router = Router();

// Public: expose only what a verifier needs (no student identifier, no signature).
const publicView = (c) => ({
  credentialId: c.credentialId,
  studentName: c.studentName,
  institution: c.institution,
  qualification: c.qualification,
  department: c.department,
  graduationYear: c.graduationYear,
  issueDate: c.issueDate,
  revokedAt: c.revokedAt,
});

router.get('/:id', asyncHandler(async (req, res) => {
  const id = String(req.params.id).trim();
  const doc = await Credential.findOne({ credentialId: id });
  let status;
  let message;

  if (!doc) {
    status = 'INVALID';
    message = 'No credential with this ID was found.';
  } else if (!signaturesMatch(signPayload(credentialPayload(doc), config.signingSecret), doc.signature)) {
    status = 'INVALID';
    message = 'This record no longer matches its original digital signature. It may have been altered.';
  } else if (doc.revoked) {
    status = 'REVOKED';
    message = 'This credential has been revoked by the issuer.';
  } else {
    status = 'VERIFIED';
    message = 'The record is authentic: its digital signature is intact and it has not been revoked.';
  }

  await VerificationEvent.create({ credentialId: id.slice(0, 80), status, details: message });
  res.json({ status, message, credential: doc && status !== 'INVALID' ? publicView(doc) : null, checkedAt: new Date() });
}));

export default router;
