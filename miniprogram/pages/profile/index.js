const api = require('../../utils/api');
const config = require('../../config');
const { resolveImage } = require('../../utils/i18n');
const { TRANSLATIONS } = require('../../utils/constants');

Page({
  data: {
    lang: 'zh',
    t: TRANSLATIONS.zh,
    user: null,
    isAuth: false,
    height: '',
    weight: '',
    targetWeight: '',
    feedback: '',
    saving: false,
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setSelected(3);
    }
    const app = getApp();
    const lang = app.getLanguage();
    this.setData({ lang, t: TRANSLATIONS[lang] });
    this.loadProfile();
  },

  async loadProfile() {
    const token = api.getToken();
    if (!token) {
      this.setData({ isAuth: false, user: null });
      return;
    }
    try {
      const user = await api.fetchProfile();
      getApp().globalData.user = user;
      this.setData({
        isAuth: true,
        user: {
          ...user,
          avatarUrl: resolveImage(user.avatar, config.apiHost),
        },
        height: user.height ? String(user.height) : '',
        weight: user.weight ? String(user.weight) : '',
        targetWeight: user.targetWeight ? String(user.targetWeight) : '',
      });
    } catch {
      api.setToken('');
      this.setData({ isAuth: false, user: null });
    }
  },

  goLogin() {
    wx.navigateTo({ url: '/pages/login/index' });
  },

  toggleLang() {
    const app = getApp();
    const lang = this.data.lang === 'zh' ? 'en' : 'zh';
    app.setLanguage(lang);
    this.setData({ lang, t: TRANSLATIONS[lang] });
  },

  onHeight(e) { this.setData({ height: e.detail.value }); },
  onWeight(e) { this.setData({ weight: e.detail.value }); },
  onTarget(e) { this.setData({ targetWeight: e.detail.value }); },
  onFeedback(e) { this.setData({ feedback: e.detail.value }); },

  async saveBody() {
    this.setData({ saving: true });
    try {
      const user = await api.updateBody({
        height: Number(this.data.height) || undefined,
        weight: Number(this.data.weight) || undefined,
        targetWeight: Number(this.data.targetWeight) || undefined,
      });
      getApp().globalData.user = user;
      wx.showToast({ title: '已保存' });
      this.loadProfile();
    } catch (err) {
      wx.showToast({ title: err.message, icon: 'none' });
    } finally {
      this.setData({ saving: false });
    }
  },

  async submitFeedback() {
    if (!this.data.feedback.trim()) return;
    try {
      await api.submitFeedback('App Experience', this.data.feedback.trim());
      wx.showToast({ title: '感谢反馈' });
      this.setData({ feedback: '' });
    } catch (err) {
      wx.showToast({ title: err.message, icon: 'none' });
    }
  },

  logout() {
    api.setToken('');
    getApp().globalData.user = null;
    this.setData({ isAuth: false, user: null });
    wx.showToast({ title: '已退出' });
  },
});
