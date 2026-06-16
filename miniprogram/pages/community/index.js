const api = require('../../utils/api');
const config = require('../../config');
const { tProp, resolveImage } = require('../../utils/i18n');
const { TRANSLATIONS } = require('../../utils/constants');

Page({
  data: {
    lang: 'zh',
    t: TRANSLATIONS.zh,
    recipes: [],
    loading: true,
    isAuth: false,
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setSelected(1);
    }
    const app = getApp();
    const lang = app.getLanguage();
    this.setData({
      lang,
      t: TRANSLATIONS[lang],
      isAuth: !!api.getToken(),
    });
    this.loadRecipes();
  },

  async loadRecipes() {
    this.setData({ loading: true });
    try {
      const data = await api.fetchCommunityRecipes();
      const recipes = (data.recipes || []).map((r) => ({
        ...r,
        displayTitle: tProp(r, 'title', this.data.lang),
        imageUrl: resolveImage(r.image, config.apiHost),
      }));
      this.setData({ recipes, loading: false });
    } catch (err) {
      this.setData({ loading: false });
      wx.showToast({ title: err.message, icon: 'none' });
    }
  },

  goLogin() {
    wx.navigateTo({ url: '/pages/login/index' });
  },

  goPost() {
    if (!this.data.isAuth) {
      this.goLogin();
      return;
    }
    wx.navigateTo({ url: '/pages/post/index' });
  },

  openRecipe(e) {
    const id = e.currentTarget.dataset.id;
    const recipe = this.data.recipes.find((r) => r.id === id);
    if (!recipe) return;
    wx.navigateTo({
      url: '/pages/recipe-detail/index?id=' + recipe.id,
      success(res) {
        res.eventChannel.emit('recipe', recipe);
      },
    });
  },

  async onLike(e) {
    if (!this.data.isAuth) {
      this.goLogin();
      return;
    }
    const id = e.currentTarget.dataset.id;
    try {
      const updated = await api.toggleLike(id);
      const recipes = this.data.recipes.map((r) =>
        r.id === id
          ? {
              ...updated,
              displayTitle: tProp(updated, 'title', this.data.lang),
              imageUrl: resolveImage(updated.image, config.apiHost),
            }
          : r
      );
      this.setData({ recipes });
    } catch (err) {
      wx.showToast({ title: err.message, icon: 'none' });
    }
  },

  onPullDownRefresh() {
    this.loadRecipes().finally(() => wx.stopPullDownRefresh());
  },
});
