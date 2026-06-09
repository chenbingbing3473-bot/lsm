/**
 * 统一 API 响应格式
 */
function ok(res, data, message = 'success') {
  return res.json({ success: true, message, data });
}

function fail(res, statusCode, message, errors = null) {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
}

module.exports = { ok, fail };
