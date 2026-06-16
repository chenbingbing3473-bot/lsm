const api = require('../../utils/api');

App({
  globalData: {
    user: null,
    language: 'zh',
  },

  onLaunch() {
    const token = api.getToken();
    if (token) {
      api.fetchProfile()
        .then((user) => {
          this.globalData.user = user;
        })
        .catch(() => api.setToken(''));
    }
  },

  setLanguage(lang) {
    this.globalData.language = lang;
    wx.setStorageSync('language', lang);
  },

  getLanguage() {
    return wx.getStorageSync('language') || this.globalData.language || 'zh';
  },
});
