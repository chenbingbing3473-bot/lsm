/**
 * 短信验证码服务
 * 开发模式：控制台打印验证码
 * 生产模式：可接入阿里云 SMS（预留接口）
 */
const VerificationCode = require('../models/VerificationCode');
const config = require('../config/env');

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/**
 * 发送验证码
 * @param {string} phone
 * @returns {Promise<{ code: string, expiresIn: number }>}
 */
async function sendVerificationCode(phone) {
  const code = config.smsDevMode ? config.smsDevFixedCode || generateCode() : generateCode();
  const expiresAt = new Date(Date.now() + (config.smsCodeTtlMinutes || 5) * 60 * 1000);

  await VerificationCode.updateMany({ phone, used: false }, { used: true });
  await VerificationCode.create({ phone, code, expiresAt });

  if (config.smsDevMode) {
    console.log(`[SMS Dev] 手机号 ${phone} 验证码: ${code}（${config.smsCodeTtlMinutes || 5} 分钟内有效）`);
  } else if (config.aliyunSmsAccessKey) {
    // 预留：接入阿里云短信
    await sendAliyunSms(phone, code);
  } else {
    console.log(`[SMS] 手机号 ${phone} 验证码: ${code}`);
  }

  return {
    code: config.smsDevMode ? code : undefined,
    expiresIn: (config.smsCodeTtlMinutes || 5) * 60,
  };
}

/** 校验验证码 */
async function verifyCode(phone, code) {
  const record = await VerificationCode.findOne({
    phone,
    code,
    used: false,
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });

  if (!record) return false;

  record.used = true;
  await record.save();
  return true;
}

/** 预留：阿里云短信发送 */
async function sendAliyunSms(_phone, _code) {
  // TODO: 接入 @alicloud/dysmsapi20170525
  throw new Error('生产短信尚未配置，请设置 SMS_DEV_MODE=true');
}

module.exports = { sendVerificationCode, verifyCode };
