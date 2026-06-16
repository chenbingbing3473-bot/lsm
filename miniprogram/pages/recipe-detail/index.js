const api = require('../../utils/api');
const config = require('../../config');
const { tProp, resolveImage } = require('../../utils/i18n');

Page({
  data: {
    lang: 'zh',
    recipe: null,
    imageUrl: '',
    title: '',
    taste: '',
    kcal: 0,
    commentText: '',
    isAuth: false,
  },

  onLoad(options) {
    const app = getApp();
    this.setData({ lang: app.getLanguage(), isAuth: !!api.getToken() });

    const channel = this.getOpenerEventChannel();
    if (channel) {
      channel.on('recipe', (recipe) => this.setRecipe(recipe));
    }
  },

  setRecipe(recipe) {
    this.setData({
      recipe,
      imageUrl: resolveImage(recipe.image, config.apiHost),
      title: tProp(recipe, 'title', this.data.lang),
      taste: tProp(recipe, 'taste', this.data.lang) || tProp(recipe, 'description', this.data.lang),
      kcal: recipe.kcal,
    });
  },

  onComment(e) {
    this.setData({ commentText: e.detail.value });
  },

  async submitComment() {
    if (!this.data.recipe?.id) return;
    if (!this.data.isAuth) {
      wx.navigateTo({ url: '/pages/login/index' });
      return;
    }
    try {
      const updated = await api.addComment(this.data.recipe.id, this.data.commentText);
      this.setRecipe(updated);
      this.setData({ commentText: '' });
      wx.showToast({ title: '评论成功' });
    } catch (err) {
      wx.showToast({ title: err.message, icon: 'none' });
    }
  },

  async onLike() {
    if (!this.data.recipe?.id) return;
    if (!this.data.isAuth) {
      wx.navigateTo({ url: '/pages/login/index' });
      return;
    }
    try {
      const updated = await api.toggleLike(this.data.recipe.id);
      this.setRecipe(updated);
    } catch (err) {
      wx.showToast({ title: err.message, icon: 'none' });
    }
  },

  back() {
    wx.navigateBack();
  },
});
