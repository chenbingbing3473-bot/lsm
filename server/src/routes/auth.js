/**
 * 用户认证路由
 */
const express = require('express');
const User = require('../models/User');
const { signToken } = require('../utils/jwt');
const { sendVerificationCode, verifyCode } = require('../services/sms');
const { ok, fail } = require('../utils/response');

const router = express.Router();

/** 注册 */
router.post('/register', async (req, res) => {
  try {
    const { phone, password, name } = req.body;

    if (!phone || !password) {
      return fail(res, 400, '手机号和密码不能为空');
    }
    if (password.length < 6) {
      return fail(res, 400, '密码至少 6 位');
    }

    const exists = await User.findOne({ phone });
    if (exists) {
      return fail(res, 409, '该手机号已注册');
    }

    const user = await User.create({
      phone,
      password,
      name: name || '新用户',
    });

    const token = signToken({ userId: user._id.toString(), phone: user.phone });

    return ok(res, { token, user: user.toPublicJSON() }, '注册成功');
  } catch (err) {
    return fail(res, 500, err.message || '注册失败');
  }
});

/** 密码登录 */
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return fail(res, 400, '手机号和密码不能为空');
    }

    const user = await User.findOne({ phone }).select('+password');
    if (!user) {
      return fail(res, 401, '手机号或密码错误');
    }

    const match = await user.comparePassword(password);
    if (!match) {
      return fail(res, 401, '手机号或密码错误');
    }

    const token = signToken({ userId: user._id.toString(), phone: user.phone });

    return ok(res, { token, user: user.toPublicJSON() }, '登录成功');
  } catch (err) {
    return fail(res, 500, err.message || '登录失败');
  }
});

/**
 * 发送短信验证码
 * POST /api/auth/send-code
 */
router.post('/send-code', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone || !/^\d{10,15}$/.test(phone)) {
      return fail(res, 400, '请输入有效手机号');
    }

    const result = await sendVerificationCode(phone);

    return ok(
      res,
      {
        expiresIn: result.expiresIn,
        // 开发模式返回验证码，方便调试
        devCode: result.code,
      },
      '验证码已发送'
    );
  } catch (err) {
    return fail(res, 500, err.message || '发送失败');
  }
});

/**
 * 验证码登录（不存在则自动注册）
 * POST /api/auth/login-by-code
 */
router.post('/login-by-code', async (req, res) => {
  try {
    const { phone, code, name } = req.body;

    if (!phone || !code) {
      return fail(res, 400, '手机号和验证码不能为空');
    }

    const valid = await verifyCode(phone, code);
    if (!valid) {
      return fail(res, 401, '验证码错误或已过期');
    }

    let user = await User.findOne({ phone });
    if (!user) {
      user = await User.create({
        phone,
        password: `auto_${phone}_${Date.now()}`,
        name: name || '新用户',
      });
    }

    const token = signToken({ userId: user._id.toString(), phone: user.phone });
    return ok(res, { token, user: user.toPublicJSON() }, '登录成功');
  } catch (err) {
    return fail(res, 500, err.message || '登录失败');
  }
});

module.exports = router;
