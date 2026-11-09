import { Router } from 'express';
import { Credential } from '../models/Credential.js';
import { VerificationEvent } from '../models/VerificationEvent.js';
import { requireIssuer } from '../middleware/auth.js';
import { asyncHandler } from '../utils/http.js';
import { serialize } from './credentials.js';

const router = Router();

router.get('/', requireIssuer, asyncHandler(async (_req, res) => {
  const since = new Date(Date.now() - 6 * 24 * 3600 * 1000);
  since.setHours(0, 0, 0, 0);
  const [total, revoked, verified, invalid, recent, daily] = await Promise.all([
    Credential.countDocuments(),
    Credential.countDocuments({ revoked: true }),
    VerificationEvent.countDocuments({ status: 'VERIFIED' }),
    VerificationEvent.countDocuments({ status: 'INVALID' }),
    Credential.find().sort({ createdAt: -1 }).limit(5),
    VerificationEvent.aggregate([
      { $match: { checkedAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$checkedAt' } }, count: { $sum: 1 } } },
    ]),
  ]);

  const byDay = Object.fromEntries(daily.map((d) => [d._id, d.count]));
  const activity = Array.from({ length: 7 }, (_, i) => {
    const key = new Date(since.getTime() + i * 24 * 3600 * 1000).toISOString().slice(0, 10);
    return { date: key, count: byDay[key] || 0 };
  });

  res.json({
    totals: { total, active: total - revoked, revoked, verified, invalid },
    activity,
    recent: recent.map(serialize),
  });
}));

export default router;
