/**
 * Lean-SpinMeal / Kinetic 后端入口
 */
const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config/env');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const recipeRoutes = require('./routes/recipes');
const communityRoutes = require('./routes/community');
const spinRoutes = require('./routes/spin');
const orderRoutes = require('./routes/orders');
const chefRoutes = require('./routes/chefs');

const app = express();

// ---------- 中间件 ----------
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// 静态文件：上传的图片
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 健康检查
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Lean-SpinMeal API is running',
    timestamp: new Date().toISOString(),
  });
});

// ---------- 路由 ----------
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/spin', spinRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/chefs', chefRoutes);

// 404
app.use((_req, res) => {
  res.status(404).json({ success: false, message: '接口不存在' });
});

// 全局错误
app.use((err, _req, res, _next) => {
  console.error('[Server Error]', err);
  res.status(500).json({ success: false, message: err.message || '服务器内部错误' });
});

// ---------- 启动 ----------
async function bootstrap() {
  await connectDB();

  // 开发环境：数据库为空时自动写入种子数据
  const Recipe = require('./models/Recipe');
  const recipeCount = await Recipe.countDocuments();
  if (recipeCount === 0) {
    console.log('[Bootstrap] 数据库为空，正在写入种子数据...');
    const { runSeed } = require('./scripts/seed');
    await runSeed({ disconnect: false });
  }

  app.listen(config.port, () => {
    console.log(`\n🚀 API 服务已启动: ${config.publicBaseUrl}`);
    console.log(`   健康检查: ${config.publicBaseUrl}/api/health`);
    console.log(`   允许跨域: ${config.corsOrigin}\n`);
  });
}

bootstrap().catch((err) => {
  console.error('启动失败:', err);
  process.exit(1);
});
