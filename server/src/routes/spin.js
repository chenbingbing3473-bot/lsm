/**
 * 摇一摇 — GET /api/spin
 * 返回结构与 src/lib/api.ts SpinResult 完全一致
 */
const express = require('express');
const Recipe = require('../models/Recipe');
const { toFrontendRecipe, buildSpinCombo } = require('../utils/recipeMapper');
const { ok, fail } = require('../utils/response');

const router = express.Router();

function randomOne(category, extraFilter = {}) {
  return Recipe.aggregate([
    { $match: { published: true, category, ...extraFilter } },
    { $sample: { size: 1 } },
  ]);
}

router.get('/', async (req, res) => {
  try {
    const isVegan = req.query.isVegan === 'true' || req.query.diet === 'vegan';
    const filter = isVegan ? { isVegan: true } : {};

    const categories = [
      { key: 'staple', label: '主食', labelEn: 'Carbs' },
      { key: 'protein', label: '蛋白质', labelEn: 'Protein' },
      { key: 'vegetable', label: '蔬菜', labelEn: 'Veg' },
    ];

    const results = await Promise.all(categories.map((c) => randomOne(c.key, filter)));

    const comboFallback = await Recipe.aggregate([
      { $match: { published: true, category: 'combo', ...filter } },
      { $sample: { size: 3 } },
    ]);

    const comboQueue = [...comboFallback];
    const slots = [];

    for (let i = 0; i < categories.length; i++) {
      const cat = categories[i];
      let doc = results[i][0] || null;
      if (!doc && comboQueue.length) doc = comboQueue.shift();

      slots.push({
        slot: cat.key,
        label: cat.label,
        labelEn: cat.labelEn,
        recipe: doc ? toFrontendRecipe(doc) : null,
      });
    }

    const valid = slots.filter((s) => s.recipe);
    if (!valid.length) {
      return fail(res, 404, '暂无菜谱，请先发布或运行 npm run seed');
    }

    const combined = valid.reduce(
      (acc, s) => ({
        kcal: acc.kcal + (s.recipe.kcal || 0),
        protein: acc.protein + (s.recipe.protein || 0),
        carbs: acc.carbs + (s.recipe.carbs || 0),
        fat: acc.fat + (s.recipe.fat || 0),
      }),
      { kcal: 0, protein: 0, carbs: 0, fat: 0 }
    );

    const hashIndex = (id, mod) => {
      let h = 0;
      for (let i = 0; i < id.length; i++) h = (h + id.charCodeAt(i)) % mod;
      return h;
    };

    const slotIndices = [
      slots[0]?.recipe ? hashIndex(slots[0].recipe.id, 5) : 2,
      slots[1]?.recipe ? hashIndex(slots[1].recipe.id, 5) : 2,
      slots[2]?.recipe ? hashIndex(slots[2].recipe.id, 5) : 2,
      Math.floor(Math.random() * 5),
      Math.floor(Math.random() * 5),
    ];

    const combo = buildSpinCombo(slots, combined, isVegan);

    return ok(res, { slots, slotIndices, combined, combo });
  } catch (err) {
    return fail(res, 500, err.message);
  }
});

module.exports = router;
