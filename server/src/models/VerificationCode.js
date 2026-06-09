/**
 * 短信验证码模型
 */
const mongoose = require('mongoose');

const verificationCodeSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, index: true },
    code: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: true },
    used: { type: Boolean, default: false },
  },
  { timestamps: true }
);

verificationCodeSchema.index({ phone: 1, createdAt: -1 });

module.exports = mongoose.model('VerificationCode', verificationCodeSchema);
