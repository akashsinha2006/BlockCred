import { Router } from 'express';
import QRCode from 'qrcode';
import { z } from 'zod';
import { config } from '../config.js';
import { Credential } from '../models/Credential.js';
import { VerificationEvent } from '../models/VerificationEvent.js';
import { requireIssuer } from '../middleware/auth.js';
import { asyncHandler, HttpError } from '../utils/http.js';
import { credentialPayload, signPayload, newCredentialId } from '../utils/hash.js';

const router = Router();

const createSchema = z.object({
  studentName: z.string().trim().min(2).max(160),
  studentIdentifier: z.string().trim().min(1).max(100),
  institution: z.string().trim().min(2).max(200),
  qualification: z.string().trim().min(2).max(200),
  department: z.string().trim().min(2).max(200),
  graduationYear: z.coerce.number().int().min(1950).max(2100),
  issueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD'),
});

export const serialize = (c) => ({
  credentialId: c.credentialId,
  studentName: c.studentName,
  studentIdentifier: c.studentIdentifier,
  institution: c.institution,
  qualification: c.qualification,
  department: c.department,
  graduationYear: c.graduationYear,
  issueDate: c.issueDate,
  signature: c.signature,
  revoked: c.revoked,
  revokedAt: c.revokedAt,
  createdAt: c.createdAt,
  verificationUrl: `${config.clientUrl}/verify/${c.credentialId}`,
});

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// QR is public: it only encodes the verification link.
router.get('/:id/qr', asyncHandler(async (req, res) => {
  const png = await QRCode.toBuffer(`${config.clientUrl}/verify/${req.params.id}`, { width: 360, margin: 1 });
  res.set('Content-Type', 'image/png').set('Cache-Control', 'public, max-age=3600').send(png);
}));

router.use(requireIssuer);

router.get('/', asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
  const filter = {};
  const q = String(req.query.q || '').trim();
  if (q) {
    const rx = { $regex: escapeRegex(q), $options: 'i' };
    filter.$or = [{ credentialId: rx }, { studentName: rx }, { institution: rx }, { qualification: rx }];
  }
  const status = String(req.query.status || '');
  if (status === 'active') filter.revoked = false;
  if (status === 'revoked') filter.revoked = true;

  const [items, total] = await Promise.all([
    Credential.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Credential.countDocuments(filter),
  ]);
  res.json({ items: items.map(serialize), total, page, pages: Math.max(1, Math.ceil(total / limit)) });
}));

router.post('/', asyncHandler(async (req, res) => {
  const data = createSchema.parse(req.body);
  const credentialId = newCredentialId();
  const signature = signPayload(credentialPayload({ credentialId, ...data }), config.signingSecret);
  const doc = await Credential.create({ credentialId, ...data, signature });
  res.status(201).json({ credential: serialize(doc) });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const doc = await Credential.findOne({ credentialId: req.params.id });
  if (!doc) throw new HttpError(404, 'Credential not found.');
  const events = await VerificationEvent.find({ credentialId: doc.credentialId }).sort({ checkedAt: -1 }).limit(10);
  res.json({
    credential: serialize(doc),
    events: events.map((e) => ({ status: e.status, details: e.details, checkedAt: e.checkedAt })),
  });
}));

router.post('/:id/revoke', asyncHandler(async (req, res) => {
  const doc = await Credential.findOne({ credentialId: req.params.id });
  if (!doc) throw new HttpError(404, 'Credential not found.');
  if (doc.revoked) throw new HttpError(409, 'Credential is already revoked.');
  doc.revoked = true;
  doc.revokedAt = new Date();
  await doc.save();
  res.json({ credential: serialize(doc) });
}));

export default router;
