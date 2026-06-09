/**
 * 菜谱 → 前端 Recipe 结构映射
 * 与 src/constants.ts 及 src/lib/api.ts 完全对齐
 */

const CATEGORY_EMOJI = {
  staple: { carbs: '🍚', protein: '🍗', veg: '🥦', fat: '🫒', cook: '🍳' },
  protein: { carbs: '🍞', protein: '🍗', veg: '🥕', fat: '🥑', cook: '🔥' },
  vegetable: { carbs: '🥖', protein: '🐟', veg: '🥬', fat: '🥜', cook: '🥗' },
  combo: { carbs: '🍝', protein: '🥩', veg: '🍅', fat: '🧀', cook: '⏲️' },
};

/** 根据分类生成老虎机 emoji */
function buildIngredientsEmoji(category = 'combo', custom) {
  if (custom?.carbs) return custom;
  return CATEGORY_EMOJI[category] || CATEGORY_EMOJI.combo;
}

/** 从摇一摇三槽组合生成 combo 的 ingredients */
function buildComboIngredients(slots) {
  const staple = slots.find((s) => s.slot === 'staple')?.recipe;
  const protein = slots.find((s) => s.slot === 'protein')?.recipe;
  const vegetable = slots.find((s) => s.slot === 'vegetable')?.recipe;
  return {
    carbs: staple ? CATEGORY_EMOJI.staple.carbs : '🍞',
    protein: protein ? CATEGORY_EMOJI.protein.protein : '🍗',
    veg: vegetable ? CATEGORY_EMOJI.vegetable.veg : '🥦',
    fat: '🥑',
    cook: '🍳',
  };
}

/** Mongoose Recipe 文档 → 前端 Recipe JSON */
function toFrontendRecipe(doc, userId = null) {
  if (!doc) return null;

  const uid = userId ? userId.toString() : null;
  const likedBy = doc.likedBy || [];
  const isLiked = uid ? likedBy.some((id) => id.toString() === uid) : false;

  const category = doc.category || 'combo';
  const ingredients = doc.ingredients?.carbs
    ? doc.ingredients
    : buildIngredientsEmoji(category, doc.ingredients);

  return {
    id: doc._id.toString(),
    title: doc.title,
    title_zh: doc.title_zh || doc.title,
    description: doc.description || '',
    description_zh: doc.description_zh || doc.description || '',
    image: doc.image,
    kcal: doc.kcal || 0,
    protein: doc.protein || 0,
    carbs: doc.carbs || 0,
    fat: doc.fat || 0,
    category,
    isVegan: Boolean(doc.isVegan),
    taste: doc.taste || doc.description || '',
    taste_zh: doc.taste_zh || doc.description_zh || doc.description || '',
    ingredients,
    ingredientsList: doc.ingredientsList || [],
    instructions: doc.instructions || [],
    instructions_zh: doc.instructions_zh || doc.instructions || [],
    author: doc.authorName || '用户',
    author_zh: doc.authorName || '用户',
    likes: doc.likes || 0,
    isLiked,
    comments: (doc.comments || []).map((c) => ({
      user: c.userName || '匿名',
      text: c.text || '',
      text_zh: c.text_zh || c.text || '',
      date: c.createdAt ? new Date(c.createdAt).toLocaleDateString('zh-CN') : '',
    })),
    createdAt: doc.createdAt,
  };
}

/** 构建摇一摇 combo 对象 */
function buildSpinCombo(slots, combined, isVegan) {
  const recipes = slots.filter((s) => s.recipe).map((s) => s.recipe);
  if (!recipes.length) return null;

  const ingredientsList = recipes.flatMap((r) => r.ingredientsList || []);
  const descriptions = recipes.map((r) => r.title_zh || r.title).join(' + ');

  return {
    title: descriptions,
    title_zh: descriptions,
    description: recipes.map((r) => r.title).join(' + '),
    description_zh: descriptions,
    kcal: combined.kcal,
    protein: combined.protein,
    carbs: combined.carbs,
    fat: combined.fat,
    image: recipes[0].image,
    ingredientsList,
    ingredients: buildComboIngredients(slots),
    instructions: [],
    instructions_zh: [],
    isVegan,
  };
}

module.exports = {
  CATEGORY_EMOJI,
  buildIngredientsEmoji,
  buildComboIngredients,
  toFrontendRecipe,
  buildSpinCombo,
};
