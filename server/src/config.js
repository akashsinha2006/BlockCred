import 'dotenv/config';

export const config = {
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/blockcred',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  adminEmail: process.env.ADMIN_EMAIL || 'admin@blockcred.local',
  adminPassword: process.env.ADMIN_PASSWORD || 'change-this-password',
  jwtSecret: process.env.JWT_SECRET || 'dev-only-secret-change-me',
  // Secret used to digitally sign each credential record (HMAC-SHA256).
  signingSecret: process.env.SIGNING_SECRET || 'dev-only-signing-secret-change-me',
};
