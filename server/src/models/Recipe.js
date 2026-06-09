/**
 * 菜谱模型 — 字段与前端 Recipe 接口对齐
 */
const mongoose = require('mongoose');
const { toFrontendRecipe, buildIngredientsEmoji } = require('../utils/recipeMapper');

const ingredientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    name_zh: { type: String },
    weight: { type: String, default: '' },
  },
  { _id: false }
);

const commentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userName: { type: String, default: '匿名' },
    text: { type: String, required: true },
    text_zh: { type: String },
  },
  { timestamps: true }
);

const slotEmojiSchema = new mongoose.Schema(
  {
    carbs: { type: String, default: '🍞' },
    protein: { type: String, default: '🍗' },
    veg: { type: String, default: '🥦' },
    fat: { type: String, default: '🥑' },
    cook: { type: String, default: '🍳' },
  },
  { _id: false }
);

const recipeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    title_zh: { type: String, trim: true },
    description: { type: String, default: '' },
    description_zh: { type: String, default: '' },
    taste: { type: String, default: '' },
    taste_zh: { type: String, default: '' },
    image: { type: String, required: true },
    kcal: { type: Number, default: 0, min: 0 },
    protein: { type: Number, default: 0, min: 0 },
    carbs: { type: Number, default: 0, min: 0 },
    fat: { type: Number, default: 0, min: 0 },
    category: {
      type: String,
      enum: ['staple', 'protein', 'vegetable', 'combo'],
      default: 'combo',
      index: true,
    },
    isVegan: { type: Boolean, default: false },
    /** 老虎机 emoji，与前端 ingredients 字段对应 */
    ingredients: slotEmojiSchema,
    ingredientsList: [ingredientSchema],
    instructions: [{ type: String }],
    instructions_zh: [{ type: String }],
    aiRaw: { type: mongoose.Schema.Types.Mixed },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    authorName: { type: String, default: '用户' },
    likes: { type: Number, default: 0, min: 0 },
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [commentSchema],
    published: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

recipeSchema.pre('save', function setDefaultIngredients(next) {
  if (!this.ingredients?.carbs) {
    this.ingredients = buildIngredientsEmoji(this.category);
  }
  if (!this.taste && this.description) {
    this.taste = this.description;
    this.taste_zh = this.description_zh || this.description;
  }
  next();
});

recipeSchema.methods.toFrontendJSON = function toFrontendJSON(userId = null) {
  return toFrontendRecipe(this, userId);
};

module.exports = mongoose.model('Recipe', recipeSchema);
