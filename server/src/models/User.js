/**
 * 用户模型
 * - 手机号 + 密码登录
 * - 身高/体重/目标体重
 * - 体重历史通过 WeightRecord 关联
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: [/^\d{10,15}$/, '手机号格式不正确'],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false, // 默认查询不返回密码
    },
    name: {
      type: String,
      default: '新用户',
      trim: true,
    },
    avatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=400',
    },
    height: { type: Number, min: 0 }, // cm
    weight: { type: Number, min: 0 }, // kg 当前体重
    targetWeight: { type: Number, min: 0 }, // kg 目标体重
    streak: { type: Number, default: 0 },
    wallet: { type: Number, default: 0 },
  },
  { timestamps: true }
);

/** 保存前加密密码 */
userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

/** 校验密码 */
userSchema.methods.comparePassword = function comparePassword(plain) {
  return bcrypt.compare(plain, this.password);
};

/** 对外暴露的安全字段 */
userSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id.toString(),
    phone: this.phone,
    name: this.name,
    avatar: this.avatar,
    height: this.height,
    weight: this.weight,
    targetWeight: this.targetWeight,
    streak: this.streak,
    wallet: this.wallet,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

module.exports = mongoose.model('User', userSchema);
