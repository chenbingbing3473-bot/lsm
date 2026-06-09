/**
 * 用户资料与体重管理路由
 */
const express = require('express');
const User = require('../models/User');
const WeightRecord = require('../models/WeightRecord');
const { authRequired } = require('../middleware/auth');
const { ok, fail } = require('../utils/response');

const router = express.Router();

/** 获取当前用户资料 */
router.get('/profile', authRequired, async (req, res) => {
  return ok(res, req.user.toPublicJSON());
});

/** 更新用户资料（姓名、头像等） */
router.put('/profile', authRequired, async (req, res) => {
  try {
    const { name, avatar } = req.body;
    if (name !== undefined) req.user.name = name;
    if (avatar !== undefined) req.user.avatar = avatar;
    await req.user.save();
    return ok(res, req.user.toPublicJSON(), '资料已更新');
  } catch (err) {
    return fail(res, 500, err.message);
  }
});

/**
 * 保存身高 / 当前体重 / 目标体重
 * PUT /api/users/body
 * body: { height, weight, targetWeight }
 */
router.put('/body', authRequired, async (req, res) => {
  try {
    const { height, weight, targetWeight } = req.body;

    if (height !== undefined) req.user.height = height;
    if (targetWeight !== undefined) req.user.targetWeight = targetWeight;

    // 更新体重时同步写入历史记录
    if (weight !== undefined) {
      req.user.weight = weight;
      await WeightRecord.create({
        user: req.user._id,
        weight,
        note: req.body.note || '',
      });
    }

    await req.user.save();
    return ok(res, req.user.toPublicJSON(), '身体数据已保存');
  } catch (err) {
    return fail(res, 500, err.message);
  }
});

/** 手动添加一条体重记录 */
router.post('/weight-records', authRequired, async (req, res) => {
  try {
    const { weight, note, recordedAt } = req.body;
    if (weight === undefined || weight <= 0) {
      return fail(res, 400, '请提供有效体重');
    }

    const record = await WeightRecord.create({
      user: req.user._id,
      weight,
      note: note || '',
      recordedAt: recordedAt ? new Date(recordedAt) : new Date(),
    });

    // 同步更新当前体重
    req.user.weight = weight;
    await req.user.save();

    return ok(res, record, '体重记录已添加');
  } catch (err) {
    return fail(res, 500, err.message);
  }
});

/** 获取体重历史（按时间倒序） */
router.get('/weight-records', authRequired, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(100, parseInt(req.query.limit || '30', 10));
    const skip = (page - 1) * limit;

    const [records, total] = await Promise.all([
      WeightRecord.find({ user: req.user._id })
        .sort({ recordedAt: -1 })
        .skip(skip)
        .limit(limit),
      WeightRecord.countDocuments({ user: req.user._id }),
    ]);

    return ok(res, {
      records,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    return fail(res, 500, err.message);
  }
});

module.exports = router;
