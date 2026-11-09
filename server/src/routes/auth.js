import { Router } from 'express';
import { z } from 'zod';
import { config } from '../config.js';
import { safeEqual, signToken, requireIssuer } from '../middleware/auth.js';
import { asyncHandler, HttpError } from '../utils/http.js';

const router = Router();
const schema = z.object({ email: z.string().email(), password: z.string().min(1) });

router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = schema.parse(req.body);
  const ok = safeEqual(email.toLowerCase(), config.adminEmail.toLowerCase()) & safeEqual(password, config.adminPassword);
  if (!ok) throw new HttpError(401, 'Incorrect email or password.');
  res.json({ token: signToken(email), user: { email } });
}));

router.get('/me', requireIssuer, (req, res) => res.json({ user: { email: req.user.sub } }));

export default router;
