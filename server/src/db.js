import mongoose from 'mongoose';
import { config } from './config.js';

export async function connectDB() {
  mongoose.set('strictQuery', true);
  await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 8000 });
  console.log(`MongoDB connected (db: ${mongoose.connection.name})`);
}
