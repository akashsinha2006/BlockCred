import mongoose from 'mongoose';

const credentialSchema = new mongoose.Schema(
  {
    credentialId: { type: String, required: true, unique: true },
    studentName: { type: String, required: true, trim: true, maxlength: 160 },
    studentIdentifier: { type: String, required: true, trim: true, maxlength: 100 },
    institution: { type: String, required: true, trim: true, maxlength: 200 },
    qualification: { type: String, required: true, trim: true, maxlength: 200 },
    department: { type: String, required: true, trim: true, maxlength: 200 },
    graduationYear: { type: Number, required: true, min: 1950, max: 2100 },
    issueDate: { type: String, required: true }, // YYYY-MM-DD
    signature: { type: String, required: true }, // HMAC-SHA256 of the record
    revoked: { type: Boolean, default: false },
    revokedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

credentialSchema.index({ createdAt: -1 });

export const Credential = mongoose.model('Credential', credentialSchema);
