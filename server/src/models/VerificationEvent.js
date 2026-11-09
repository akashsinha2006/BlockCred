import mongoose from 'mongoose';

const schema = new mongoose.Schema(
  {
    credentialId: { type: String, required: true, index: true },
    status: { type: String, enum: ['VERIFIED', 'REVOKED', 'INVALID'], required: true, index: true },
    details: { type: String, default: '' },
  },
  { timestamps: { createdAt: 'checkedAt', updatedAt: false } }
);

export const VerificationEvent = mongoose.model('VerificationEvent', schema);
