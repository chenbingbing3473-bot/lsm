/**
 * 订单路由
 */
const express = require('express');
const Order = require('../models/Order');
const Chef = require('../models/Chef');
const { authRequired } = require('../middleware/auth');
const { ok, fail } = require('../utils/response');

const router = express.Router();

/** 创建订单（发送周计划 / 发布需求） */
router.post('/', authRequired, async (req, res) => {
  try {
    const {
      chefId,
      title,
      description,
      price,
      type,
      dietaryPreferences,
      allergies,
      notes,
      tags,
    } = req.body;

    let chefName = '';
    if (chefId) {
      const chef = await Chef.findById(chefId);
      if (chef) chefName = chef.name;
    }

    const order = await Order.create({
      customer: req.user._id,
      customerName: req.user.name,
      chef: chefId || undefined,
      chefName,
      title: title || (chefName ? `周计划 - ${chefName}` : '个人代厨需求'),
      description: description || notes || '',
      price: Number(price) || 0,
      type: type || 'weekly_plan',
      dietaryPreferences: dietaryPreferences || '',
      allergies: allergies || '',
      notes: notes || '',
      tags: tags || [],
      status: chefId ? 'pending' : 'pending',
    });

    return ok(res, order.toFrontendJSON(), '订单已创建');
  } catch (err) {
    return fail(res, 500, err.message);
  }
});

/** 我的订单列表 */
router.get('/mine', authRequired, async (req, res) => {
  try {
    const status = req.query.status;
    const filter = { customer: req.user._id };
    if (status) filter.status = status;

    const orders = await Order.find(filter).sort({ createdAt: -1 }).limit(50);
    return ok(res, orders.map((o) => o.toFrontendJSON()));
  } catch (err) {
    return fail(res, 500, err.message);
  }
});

/** 公开市场需求（接单页） */
router.get('/market', async (req, res) => {
  try {
    const orders = await Order.find({
      type: 'market_request',
      status: 'pending',
    })
      .sort({ createdAt: -1 })
      .limit(20);
    return ok(res, orders.map((o) => o.toFrontendJSON()));
  } catch (err) {
    return fail(res, 500, err.message);
  }
});

/** 更新订单状态 */
router.patch('/:id/status', authRequired, async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['pending', 'ongoing', 'completed', 'cancelled'];
    if (!allowed.includes(status)) {
      return fail(res, 400, '无效状态');
    }

    const order = await Order.findById(req.params.id);
    if (!order) return fail(res, 404, '订单不存在');

    order.status = status;
    await order.save();

    return ok(res, order.toFrontendJSON(), '状态已更新');
  } catch (err) {
    return fail(res, 500, err.message);
  }
});

/** 厨师接单 */
router.post('/:id/accept', authRequired, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return fail(res, 404, '订单不存在');
    if (order.status !== 'pending') {
      return fail(res, 400, '订单已被处理');
    }

    order.status = 'ongoing';
    order.chefName = req.user.name;
    await order.save();

    return ok(res, order.toFrontendJSON(), '接单成功');
  } catch (err) {
    return fail(res, 500, err.message);
  }
});

module.exports = router;
