/**
 * 厨师路由
 */
const express = require('express');
const Chef = require('../models/Chef');
const { authRequired } = require('../middleware/auth');
const { SITE_IMAGES } = require('../utils/siteImages');
const { ok, fail } = require('../utils/response');

const router = express.Router();

/** 附近厨师列表 */
router.get('/', async (_req, res) => {
  try {
    const chefs = await Chef.find({ isActive: true }).sort({ rating: -1 }).limit(50);
    return ok(res, chefs.map((c) => c.toFrontendJSON()));
  } catch (err) {
    return fail(res, 500, err.message);
  }
});

/** 注册成为代厨 */
router.post('/register', authRequired, async (req, res) => {
  try {
    const { name, specialty, specialty_zh, avatar } = req.body;

    const existing = await Chef.findOne({ user: req.user._id });
    if (existing) {
      return ok(res, existing.toFrontendJSON(), '您已是注册厨师');
    }

    const chef = await Chef.create({
      user: req.user._id,
      name: name || req.user.name,
      name_zh: name || req.user.name,
      specialty: specialty || 'HOME COOKING',
      specialty_zh: specialty_zh || specialty || '家常菜',
      avatar:
        req.user.avatar ||
        SITE_IMAGES.chef,
      distance: '0.5 miles',
      distance_zh: '0.5 英里',
      rating: 5.0,
      responseTime: '5m',
      responseTime_zh: '5分钟',
    });

    return ok(res, chef.toFrontendJSON(), '厨师注册成功');
  } catch (err) {
    return fail(res, 500, err.message);
  }
});

module.exports = router;
