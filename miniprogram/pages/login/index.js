const api = require('../../utils/api');

Page({
  data: {
    lang: 'zh',
    phone: '13800138000',
    code: '',
    devCode: '',
    sending: false,
    loading: false,
  },

  onLoad() {
    this.setData({ lang: getApp().getLanguage() });
  },

  onPhone(e) {
    this.setData({ phone: e.detail.value });
  },

  onCode(e) {
    this.setData({ code: e.detail.value });
  },

  async sendCode() {
    if (!this.data.phone) {
      wx.showToast({ title: '请输入手机号', icon: 'none' });
      return;
    }
    this.setData({ sending: true });
    try {
      const res = await api.sendCode(this.data.phone);
      this.setData({ devCode: res.devCode || '' });
      wx.showToast({
        title: res.devCode ? '验证码: ' + res.devCode : '已发送',
        icon: 'none',
        duration: 3000,
      });
    } catch (err) {
      wx.showToast({ title: err.message, icon: 'none' });
    } finally {
      this.setData({ sending: false });
    }
  },

  async login() {
    if (!this.data.phone || !this.data.code) {
      wx.showToast({ title: '请填写手机号和验证码', icon: 'none' });
      return;
    }
    this.setData({ loading: true });
    try {
      const { token, user } = await api.loginByCode(this.data.phone, this.data.code);
      api.setToken(token);
      getApp().globalData.user = user;
      wx.showToast({ title: '登录成功' });
      setTimeout(() => wx.navigateBack(), 500);
    } catch (err) {
      wx.showToast({ title: err.message, icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },
});
