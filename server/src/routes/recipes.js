/**
 * 菜谱路由
 * POST /api/recipes  上传图片 + 描述，VL 识别后入库
 */
const express = require('express');
const Recipe = require('../models/Recipe');
const { authOptional, authRequired } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');
const { analyzeFoodImage } = require('../services/qwenVL');
const config = require('../config/env');
const { SITE_IMAGES } = require('../utils/siteImages');
const { ok, fail } = require('../utils/response');

const router = express.Router();

/**
 * 上传菜谱
 * multipart/form-data:
 *   - image: 图片文件（必填）
 *   - description: 文字描述（可选）
 */
router.post(
  '/',
  authRequired,
  upload.single('image'),
  handleUploadError,
  async (req, res) => {
    try {
      if (!req.file) {
        return fail(res, 400, '请上传菜品图片');
      }

      const description = req.body.description || '';
      const imagePath = req.file.path;
      const imageUrl = `${config.publicBaseUrl}/uploads/${req.file.filename}`;

      // 调用通义千问 VL 识别营养（无 Key 或失败时用手动字段兜底）
      const manualTitle = req.body.title || req.body.description?.slice(0, 50) || '用户上传菜品';
      const manualDesc = req.body.description || '';
      let analysis = null;

      if (config.dashscopeApiKey && config.dashscopeApiKey !== 'sk-your-dashscope-api-key') {
        try {
          analysis = await analyzeFoodImage(imagePath, manualDesc);
        } catch (aiErr) {
          console.warn('[Qwen VL] 识别失败，使用手动信息发布:', aiErr.message);
        }
      } else {
        console.log('[Qwen VL] 未配置 API Key，跳过 AI 识别，直接发布');
      }

      const recipe = await Recipe.create({
        title: analysis?.title_en || analysis?.title || manualTitle,
        title_zh: analysis?.title || manualTitle,
        description: analysis?.description_en || analysis?.description || manualDesc,
        description_zh: analysis?.description || manualDesc,
        image: imageUrl,
        kcal: analysis?.kcal ?? (Number(req.body.kcal) || 450),
        protein: analysis?.protein ?? (Number(req.body.protein) || 25),
        carbs: analysis?.carbs ?? (Number(req.body.carbs) || 0),
        fat: analysis?.fat ?? (Number(req.body.fat) || 0),
        category: analysis?.category || 'combo',
        isVegan: analysis?.isVegan ?? false,
        ingredientsList: analysis?.ingredientsList || [],
        instructions: analysis?.instructions_en || analysis?.instructions || [],
        instructions_zh: analysis?.instructions_zh || analysis?.instructions || [],
        aiRaw: analysis?.aiRaw,
        author: req.user._id,
        authorName: req.user.name,
        published: true,
      });

      return ok(res, recipe.toFrontendJSON(req.user?._id), analysis ? '菜谱识别并发布成功' : '菜谱发布成功');
    } catch (err) {
      return fail(res, 500, err.message || '菜谱上传失败');
    }
  }
);

/**
 * 社区发帖（图片可选，不依赖 AI）
 * POST /api/recipes/post
 */
router.post(
  '/post',
  authRequired,
  upload.single('image'),
  handleUploadError,
  async (req, res) => {
    try {
      const { title, description, kcal, protein, carbs, fat } = req.body;
      if (!title?.trim()) {
        return fail(res, 400, '请填写菜名');
      }

      const imageUrl = req.file
        ? `${config.publicBaseUrl}/uploads/${req.file.filename}`
        : SITE_IMAGES.combo;

      const recipe = await Recipe.create({
        title: title.trim(),
        title_zh: title.trim(),
        description: description || '',
        description_zh: description || '',
        taste: description || title.trim(),
        taste_zh: description || title.trim(),
        image: imageUrl,
        kcal: Number(kcal) || 450,
        protein: Number(protein) || 25,
        carbs: Number(carbs) || 0,
        fat: Number(fat) || 0,
        category: 'combo',
        author: req.user._id,
        authorName: req.user.name,
        published: true,
      });

      return ok(res, recipe.toFrontendJSON(req.user._id), '发布成功');
    } catch (err) {
      return fail(res, 500, err.message);
    }
  }
);

/**
 * 手动创建菜谱（无 AI 识别，用于表单填写）
 * POST /api/recipes/manual
 */
router.post('/manual', authRequired, async (req, res) => {
  try {
    const {
      title,
      title_zh,
      description,
      description_zh,
      image,
      kcal,
      protein,
      carbs,
      fat,
      category,
      isVegan,
      ingredientsList,
      instructions,
      instructions_zh,
    } = req.body;

    if (!title) {
      return fail(res, 400, '请填写菜名');
    }

    const recipe = await Recipe.create({
      title,
      title_zh: title_zh || title,
      description: description || '',
      description_zh: description_zh || description || '',
      image: image || SITE_IMAGES.combo,
      kcal: Number(kcal) || 0,
      protein: Number(protein) || 0,
      carbs: Number(carbs) || 0,
      fat: Number(fat) || 0,
      category: category || 'combo',
      isVegan: Boolean(isVegan),
      ingredientsList: ingredientsList || [],
      instructions: instructions || [],
      instructions_zh: instructions_zh || instructions || [],
      author: req.user._id,
      authorName: req.user.name,
      published: true,
    });

    return ok(res, recipe.toFrontendJSON(req.user._id), '菜谱发布成功');
  } catch (err) {
    return fail(res, 500, err.message);
  }
});

/** 点赞 / 取消点赞 */
router.post('/:id/like', authRequired, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return fail(res, 404, '菜谱不存在');

    const uid = req.user._id.toString();
    const liked = (recipe.likedBy || []).some((id) => id.toString() === uid);

    if (liked) {
      recipe.likedBy = recipe.likedBy.filter((id) => id.toString() !== uid);
      recipe.likes = Math.max(0, recipe.likes - 1);
    } else {
      recipe.likedBy.push(req.user._id);
      recipe.likes += 1;
    }

    await recipe.save();
    return ok(res, recipe.toFrontendJSON(req.user._id), liked ? '已取消点赞' : '点赞成功');
  } catch (err) {
    return fail(res, 500, err.message);
  }
});

/** 添加评论 */
router.post('/:id/comments', authRequired, async (req, res) => {
  try {
    const { text, text_zh } = req.body;
    if (!text?.trim()) {
      return fail(res, 400, '评论内容不能为空');
    }

    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return fail(res, 404, '菜谱不存在');

    recipe.comments.push({
      user: req.user._id,
      userName: req.user.name,
      text: text.trim(),
      text_zh: text_zh || text.trim(),
    });

    await recipe.save();
    return ok(res, recipe.toFrontendJSON(req.user._id), '评论成功');
  } catch (err) {
    return fail(res, 500, err.message);
  }
});

/** 获取当前用户发布的菜谱（须在 /:id 之前注册） */
router.get('/mine/list', authRequired, async (req, res) => {
  try {
    const recipes = await Recipe.find({ author: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    return ok(res, recipes.map((r) => r.toFrontendJSON(req.user._id)));
  } catch (err) {
    return fail(res, 500, err.message);
  }
});

/** 获取单个菜谱详情 */
router.get('/:id', authOptional, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id).populate('author', 'name avatar');
    if (!recipe) {
      return fail(res, 404, '菜谱不存在');
    }
    return ok(res, recipe.toFrontendJSON(req.userId));
  } catch (err) {
    return fail(res, 500, err.message);
  }
});

module.exports = router;
