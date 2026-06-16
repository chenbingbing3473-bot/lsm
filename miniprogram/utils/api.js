const config = require('../config');

const TOKEN_KEY = 'kinetic_token';

function getToken() {
  return wx.getStorageSync(TOKEN_KEY) || '';
}

function setToken(token) {
  if (token) wx.setStorageSync(TOKEN_KEY, token);
  else wx.removeStorageSync(TOKEN_KEY);
}

function request(path, options = {}) {
  const token = getToken();
  const header = { ...(options.header || {}) };

  if (!(options.data instanceof Object && options.isForm)) {
    header['Content-Type'] = header['Content-Type'] || 'application/json';
  }

  if (token) header.Authorization = 'Bearer ' + token;

  return new Promise((resolve, reject) => {
    wx.request({
      url: config.apiBase + path,
      method: options.method || 'GET',
      data: options.data,
      header,
      success(res) {
        const json = res.data;
        if (res.statusCode === 401) {
          setToken('');
          reject(new Error('登录已过期，请重新登录'));
          return;
        }
        if (res.statusCode >= 400 || !json.success) {
          reject(new Error(json.message || '请求失败'));
          return;
        }
        resolve(json.data);
      },
      fail(err) {
        reject(new Error(err.errMsg || '网络错误，请检查合法域名或开发模式'));
      },
    });
  });
}

function uploadFile(path, filePath, formData) {
  const token = getToken();
  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: config.apiBase + path,
      filePath,
      name: 'image',
      formData,
      header: token ? { Authorization: 'Bearer ' + token } : {},
      success(res) {
        let json;
        try {
          json = JSON.parse(res.data);
        } catch {
          reject(new Error('上传失败'));
          return;
        }
        if (!json.success) {
          reject(new Error(json.message || '上传失败'));
          return;
        }
        resolve(json.data);
      },
      fail(err) {
        reject(new Error(err.errMsg || '上传失败'));
      },
    });
  });
}

module.exports = {
  getToken,
  setToken,
  sendCode: (phone) => request('/auth/send-code', { method: 'POST', data: { phone } }),
  loginByCode: (phone, code) =>
    request('/auth/login-by-code', { method: 'POST', data: { phone, code } }),
  fetchProfile: () => request('/users/profile'),
  updateProfile: (data) => request('/users/profile', { method: 'PUT', data }),
  updateBody: (data) => request('/users/body', { method: 'PUT', data }),
  fetchCommunityRecipes: (page = 1) =>
    request(`/community/recipes?page=${page}&limit=20`),
  fetchSpin: (diet = 'regular') =>
    request(diet === 'vegan' ? '/spin?diet=vegan' : '/spin'),
  toggleLike: (id) => request(`/recipes/${id}/like`, { method: 'POST' }),
  addComment: (id, text) =>
    request(`/recipes/${id}/comments`, { method: 'POST', data: { text, text_zh: text } }),
  postRecipe: (data) => {
    if (data.filePath) {
      return uploadFile('/recipes/post', data.filePath, {
        title: data.title,
        description: data.description || '',
        kcal: String(data.kcal || 450),
        protein: String(data.protein || 25),
      });
    }
    return request('/recipes/manual', {
      method: 'POST',
      data: {
        title: data.title,
        description: data.description || '',
        kcal: data.kcal || 450,
        protein: data.protein || 25,
      },
    });
  },
  fetchChefs: () => request('/chefs'),
  fetchMarketOrders: () => request('/orders/market'),
  registerChef: (data) => request('/chefs/register', { method: 'POST', data }),
  createOrder: (data) => request('/orders', { method: 'POST', data }),
  acceptOrder: (id) => request(`/orders/${id}/accept`, { method: 'POST' }),
  submitFeedback: (category, message) =>
    request('/community/feedback', { method: 'POST', data: { category, message } }),
};
