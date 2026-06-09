/**
 * 社区路由 — 分页获取公开减脂菜谱
 */
const express = require('express');
const Recipe = require('../models/Recipe');
const Feedback = require('../models/Feedback');
const { authOptional } = require('../middleware/auth');
const { ok, fail } = require('../utils/response');

const router = express.Router();

/**
 * GET /api/community/recipes
 * query: page, limit, category, isVegan
 */
router.get('/recipes', authOptional, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(50, parseInt(req.query.limit || '10', 10));
    const skip = (page - 1) * limit;
    const userId = req.userId || null;

    const filter = { published: true };
    if (req.query.category) {
      filter.category = req.query.category;
    }
    if (req.query.isVegan === 'true') {
      filter.isVegan = true;
    }

    const [recipes, total] = await Promise.all([
      Recipe.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Recipe.countDocuments(filter),
    ]);

    return ok(res, {
      recipes: recipes.map((r) => r.toFrontendJSON(userId)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    });
  } catch (err) {
    return fail(res, 500, err.message);
  }
});

/** 提交反馈 */
router.post('/feedback', authOptional, async (req, res) => {
  try {
    const { category, message } = req.body;
    if (!message?.trim()) {
      return fail(res, 400, '请填写反馈内容');
    }

    await Feedback.create({
      user: req.userId || undefined,
      category: category || 'App Experience',
      message: message.trim(),
    });

    return ok(res, null, '反馈已提交，感谢您的意见');
  } catch (err) {
    return fail(res, 500, err.message);
  }
});

module.exports = router;
