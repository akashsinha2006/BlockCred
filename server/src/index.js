import { config } from './config.js';
import { connectDB } from './db.js';
import { createApp } from './app.js';

if (config.jwtSecret === 'dev-only-secret-change-me') console.warn('WARNING: set JWT_SECRET in server/.env');
if (config.signingSecret === 'dev-only-signing-secret-change-me') console.warn('WARNING: set SIGNING_SECRET in server/.env');
if (config.adminPassword === 'change-this-password') console.warn('WARNING: set ADMIN_PASSWORD in server/.env');

if (config.mongoUri.includes('YOUR_DB_PASSWORD')) console.warn('WARNING: replace YOUR_DB_PASSWORD in server/.env with your Atlas database password.');

const app = createApp();
app.listen(config.port, () => console.log(`BlockCred API on http://localhost:${config.port}`));

connectDB().catch((err) => {
  console.error('MongoDB connection failed:', err.message);
  console.error('Check MONGODB_URI, database user credentials, and Atlas Network Access (IP allow list).');
});
