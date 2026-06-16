const api = require('../../utils/api');
const config = require('../../config');
const { tProp, resolveImage } = require('../../utils/i18n');
const { TRANSLATIONS } = require('../../utils/constants');

Page({
  data: {
    lang: 'zh',
    t: TRANSLATIONS.zh,
    mode: 'find',
    chefs: [],
    requests: [],
    showChefForm: false,
    chefName: '',
    chefSpecialty: 'HOME COOKING',
    specialties: ['KETO SPECIALIST', 'PLANT BASED', 'HOME COOKING', 'GOURMET'],
    specialtiesZh: ['生酮专家', '植物基', '家常菜', '美食家'],
    isAuth: false,
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setSelected(2);
    }
    const app = getApp();
    const lang = app.getLanguage();
    this.setData({ lang, t: TRANSLATIONS[lang], isAuth: !!api.getToken() });
    this.loadData();
  },

  async loadData() {
    try {
      const [chefs, requests] = await Promise.all([
        api.fetchChefs(),
        api.fetchMarketOrders(),
      ]);
      this.setData({
        chefs: chefs.map((c) => ({
          ...c,
          displayName: tProp(c, 'name', this.data.lang),
          displaySpecialty: tProp(c, 'specialty', this.data.lang),
          displayDistance: tProp(c, 'distance', this.data.lang),
          displayResponse: tProp(c, 'responseTime', this.data.lang),
          avatarUrl: resolveImage(c.avatar, config.apiHost),
        })),
        requests,
      });
    } catch (err) {
      wx.showToast({ title: err.message, icon: 'none' });
    }
  },

  setMode(e) {
    this.setData({ mode: e.currentTarget.dataset.mode });
  },

  goLogin() {
    wx.navigateTo({ url: '/pages/login/index' });
  },

  openChefForm() {
    if (!this.data.isAuth) {
      this.goLogin();
      return;
    }
    this.setData({ showChefForm: true });
  },

  closeChefForm() {
    this.setData({ showChefForm: false });
  },

  onChefName(e) {
    this.setData({ chefName: e.detail.value });
  },

  onSpecialtyChange(e) {
    const idx = e.detail.value;
    this.setData({
      chefSpecialty: this.data.specialties[idx],
    });
  },

  async submitChef() {
    if (!this.data.chefName.trim()) {
      wx.showToast({ title: '请填写姓名', icon: 'none' });
      return;
    }
    try {
      await api.registerChef({
        name: this.data.chefName,
        specialty: this.data.chefSpecialty,
      });
      wx.showToast({ title: '注册成功' });
      this.setData({ showChefForm: false, chefName: '' });
      this.loadData();
    } catch (err) {
      wx.showToast({ title: err.message, icon: 'none' });
    }
  },

  async acceptOrder(e) {
    if (!this.data.isAuth) {
      this.goLogin();
      return;
    }
    const id = e.currentTarget.dataset.id;
    try {
      await api.acceptOrder(id);
      wx.showToast({ title: '接单成功' });
      this.loadData();
    } catch (err) {
      wx.showToast({ title: err.message, icon: 'none' });
    }
  },

  async sendPlan(e) {
    if (!this.data.isAuth) {
      this.goLogin();
      return;
    }
    const id = e.currentTarget.dataset.id;
    const chef = this.data.chefs.find((c) => c.id === id);
    if (!chef) return;
    try {
      await api.createOrder({
        chefId: chef.id,
        type: 'weekly_plan',
        description: 'Weekly meal plan request',
      });
      wx.showToast({ title: '已发送' });
    } catch (err) {
      wx.showToast({ title: err.message, icon: 'none' });
    }
  },
});
