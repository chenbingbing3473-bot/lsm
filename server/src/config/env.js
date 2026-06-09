/**
 * 环境变量集中读取与校验
 */
require('dotenv').config();

const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  mongodbUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/lean_spinmeal',
  useMemoryDb: process.env.USE_MEMORY_DB === 'true',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  dashscopeApiKey: process.env.DASHSCOPE_API_KEY || '',
  qwenVlModel: process.env.QWEN_VL_MODEL || 'qwen-vl-plus',
  corsOrigin: (process.env.CORS_ORIGIN || 'http://localhost:8080,http://localhost:3000')
    .split(',')
    .map((s) => s.trim()),
  publicBaseUrl: process.env.PUBLIC_BASE_URL || 'http://localhost:3001',
  smsDevMode: process.env.SMS_DEV_MODE !== 'false',
  smsDevFixedCode: process.env.SMS_DEV_FIXED_CODE || '',
  smsCodeTtlMinutes: parseInt(process.env.SMS_CODE_TTL_MINUTES || '5', 10),
  aliyunSmsAccessKey: process.env.ALIYUN_SMS_ACCESS_KEY || '',
};

module.exports = config;
