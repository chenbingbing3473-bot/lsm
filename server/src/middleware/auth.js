/**
 * JWT 鉴权中间件
 * Header: Authorization: Bearer <token>
 */
const User = require('../models/User');
const { verifyToken } = require('../utils/jwt');
const { fail } = require('../utils/response');

async function authRequired(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      return fail(res, 401, '请先登录');
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return fail(res, 401, '用户不存在或 Token 已失效');
    }

    req.user = user;
    req.userId = user._id;
    next();
  } catch (err) {
    return fail(res, 401, 'Token 无效或已过期');
  }
}

/** 可选鉴权：有 Token 则解析，无 Token 也放行 */
async function authOptional(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (token) {
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.userId);
      if (user) {
        req.user = user;
        req.userId = user._id;
      }
    }
    next();
  } catch {
    next();
  }
}

module.exports = { authRequired, authOptional };
