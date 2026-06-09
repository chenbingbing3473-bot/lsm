/**
 * JWT 工具
 */
const jwt = require('jsonwebtoken');
const config = require('../config/env');

/** 签发 Token */
function signToken(payload) {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
}

/** 验证 Token，失败抛错 */
function verifyToken(token) {
  return jwt.verify(token, config.jwtSecret);
}

module.exports = { signToken, verifyToken };
