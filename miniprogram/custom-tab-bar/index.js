Component({
  data: {
    selected: 0,
    lang: 'zh',
    list: [
      { pagePath: '/pages/spin/index', text: '摇号', textEn: 'Spin', icon: '⚡' },
      { pagePath: '/pages/community/index', text: '社区', textEn: 'Community', icon: '👥' },
      { pagePath: '/pages/market/index', text: '代厨', textEn: 'Market', icon: '🧺' },
      { pagePath: '/pages/profile/index', text: '我的', textEn: 'Profile', icon: '👤' },
    ],
  },

  methods: {
    switchTab(e) {
      const index = e.currentTarget.dataset.index;
      const path = this.data.list[index].pagePath;
      wx.switchTab({ url: path });
    },

    setSelected(index) {
      const app = getApp();
      const lang = app.getLanguage();
      this.setData({ selected: index, lang });
    },
  },
});
