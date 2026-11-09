import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { HttpError } from '../utils/http.js';

export function safeEqual(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

export function signToken(email) {
  return jwt.sign({ sub: email, role: 'issuer' }, config.jwtSecret, { expiresIn: '8h' });
}

export function requireIssuer(req, _res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next(new HttpError(401, 'Please sign in as an issuer.'));
  try {
    req.user = jwt.verify(token, config.jwtSecret);
    next();
  } catch {
    next(new HttpError(401, 'Your session expired. Please sign in again.'));
  }
}
