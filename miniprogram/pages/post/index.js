const api = require('../../utils/api');

Page({
  data: {
    title: '',
    description: '',
    kcal: 450,
    protein: 25,
    imagePath: '',
    submitting: false,
  },

  onTitle(e) { this.setData({ title: e.detail.value }); },
  onDesc(e) { this.setData({ description: e.detail.value }); },

  chooseImage() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      success: (res) => {
        this.setData({ imagePath: res.tempFiles[0].tempFilePath });
      },
    });
  },

  async submit() {
    if (!this.data.title.trim()) {
      wx.showToast({ title: '请填写菜名', icon: 'none' });
      return;
    }
    this.setData({ submitting: true });
    try {
      await api.postRecipe({
        title: this.data.title.trim(),
        description: this.data.description,
        kcal: this.data.kcal,
        protein: this.data.protein,
        filePath: this.data.imagePath || undefined,
      });
      wx.showToast({ title: '发布成功' });
      setTimeout(() => wx.navigateBack(), 500);
    } catch (err) {
      wx.showToast({ title: err.message, icon: 'none' });
    } finally {
      this.setData({ submitting: false });
    }
  },
});
