const api = require('../../utils/api');
const config = require('../../config');
const { tProp, resolveImage } = require('../../utils/i18n');
const { TRANSLATIONS } = require('../../utils/constants');

const SLOT_ICONS = [
  ['🍞', '🍚', '🍝', '🥔', '🥖'],
  ['🍗', '🐟', '🥩', '🥚', '🍤'],
  ['🥦', '🥬', '🥕', '🍅', '🫑'],
  ['🥑', '🫒', '🥜', '🧈', '🧀'],
  ['🍳', '🔥', '⏲️', '🔪', '🥗'],
];

Page({
  data: {
    lang: 'zh',
    t: TRANSLATIONS.zh,
    userWeight: 78,
    budget: 45,
    diet: 'regular',
    isSpinning: false,
    showResult: false,
    spinError: '',
    slotIcons: SLOT_ICONS,
    slotOffsets: [0, 0, 0, 0, 0],
    slotLabels: ['碳水', '蛋白质', '蔬菜', '脂肪', '烹饪'],
    combo: null,
    comboImage: '',
    comboTitle: '',
    comboKcal: 0,
    comboProtein: 0,
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setSelected(0);
    }
    const app = getApp();
    const lang = app.getLanguage();
    this.setData({
      lang,
      t: TRANSLATIONS[lang],
      slotLabels:
        lang === 'zh'
          ? ['碳水', '蛋白质', '蔬菜', '脂肪', '烹饪']
          : ['Carbs', 'Protein', 'Veg', 'Fat', 'Cook'],
    });
    if (app.globalData.user?.weight) {
      this.setData({ userWeight: app.globalData.user.weight });
    }
  },

  onWeightInput(e) {
    this.setData({ userWeight: parseInt(e.detail.value, 10) || 0 });
  },

  setDiet(e) {
    this.setData({ diet: e.currentTarget.dataset.diet });
  },

  onBudgetChange(e) {
    this.setData({ budget: e.detail.value });
  },

  getScaled(recipe) {
    const scale = (this.data.userWeight || 70) / 70;
    return {
      ...recipe,
      kcal: Math.round(recipe.kcal * scale),
      protein: Math.round(recipe.protein * scale),
    };
  },

  async handleSpin() {
    if (this.data.isSpinning) return;
    this.setData({ isSpinning: true, showResult: false, spinError: '' });

    try {
      const result = await api.fetchSpin(this.data.diet);
      const combo = this.getScaled(result.combo);
      const indices = result.slotIndices || [2, 2, 2, 0, 0];
      const offsets = indices.map((idx) => {
        const middle = idx + 5;
        return 128 - middle * 128;
      });

      setTimeout(() => {
        this.setData({
          isSpinning: false,
          slotOffsets: offsets,
          showResult: true,
          combo,
          comboImage: resolveImage(combo.image, config.apiHost),
          comboTitle: tProp(combo, 'title', this.data.lang),
          comboKcal: combo.kcal,
          comboProtein: combo.protein,
        });
      }, 2000);
    } catch (err) {
      this.setData({
        isSpinning: false,
        spinError: err.message || '摇号失败',
      });
    }
  },

  openDetail() {
    const { combo } = this.data;
    if (!combo) return;
    wx.navigateTo({
      url: '/pages/recipe-detail/index?id=' + (combo.id || 'combo'),
      success(res) {
        res.eventChannel.emit('recipe', combo);
      },
    });
  },
});
