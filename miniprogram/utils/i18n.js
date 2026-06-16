function tProp(obj, key, lang) {
  if (!obj) return '';
  if (lang === 'zh' && obj[key + '_zh']) return obj[key + '_zh'];
  return obj[key] || '';
}

function resolveImage(url, apiHost) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return apiHost + (url.startsWith('/') ? url : '/' + url);
}

module.exports = { tProp, resolveImage };
