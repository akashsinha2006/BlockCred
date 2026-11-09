import mongoose from 'mongoose';
import { config } from '../src/config.js';

if (config.mongoUri.includes('YOUR_DB_PASSWORD')) {
  console.error('Open server/.env and replace YOUR_DB_PASSWORD with your Atlas database user password.');
  process.exit(1);
}
try {
  await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 8000 });
  console.log(`OK: connected to MongoDB Atlas (database "${mongoose.connection.name}").`);
  await mongoose.disconnect();
} catch (e) {
  console.error('FAILED:', e.message);
  console.error('Check: 1) the password in server/.env  2) Atlas > Network Access allows your IP  3) the user has read/write access.');
  process.exit(1);
}
