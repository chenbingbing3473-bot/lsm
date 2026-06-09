/**
 * 种子数据脚本
 * 写入示例用户 + 分类菜谱，供社区与摇一摇测试
 *
 * 运行: npm run seed
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Recipe = require('../models/Recipe');
const Chef = require('../models/Chef');
const Order = require('../models/Order');

const SEED_RECIPES = [
  {
    category: 'staple',
    title: 'Brown Rice Bowl',
    title_zh: '糙米饭',
    description: 'Steamed brown rice, fiber-rich staple.',
    description_zh: '蒸糙米饭，富含膳食纤维的主食。',
    taste: 'Nutty and wholesome brown rice.',
    taste_zh: '坚果香气的健康糙米饭。',
    image: 'https://images.unsplash.com/photo-1516684732162-798a0062be75?auto=format&fit=crop&q=80&w=800',
    kcal: 220, protein: 5, carbs: 45, fat: 2, isVegan: true,
    ingredientsList: [{ name: 'Brown Rice', name_zh: '糙米', weight: '150g' }],
  },
  {
    category: 'staple',
    title: 'Whole Wheat Pasta',
    title_zh: '全麦意面',
    description: 'Al dente whole wheat pasta.',
    description_zh: '有嚼劲的全麦意面。',
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&q=80&w=800',
    kcal: 280, protein: 10, carbs: 52, fat: 3, isVegan: true,
    ingredientsList: [{ name: 'Whole Wheat Pasta', name_zh: '全麦意面', weight: '80g' }],
  },
  {
    category: 'protein',
    title: 'Grilled Chicken Breast',
    title_zh: '香煎鸡胸肉',
    description: 'Lean high-protein chicken breast.',
    description_zh: '低脂高蛋白鸡胸肉。',
    image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&q=80&w=800',
    kcal: 320, protein: 48, carbs: 0, fat: 8, isVegan: false,
    ingredientsList: [{ name: 'Chicken Breast', name_zh: '鸡胸肉', weight: '200g' }],
  },
  {
    category: 'protein',
    title: 'Baked Salmon',
    title_zh: '烤三文鱼',
    description: 'Omega-3 rich salmon fillet.',
    description_zh: '富含 Omega-3 的三文鱼。',
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&q=80&w=800',
    kcal: 350, protein: 36, carbs: 0, fat: 18, isVegan: false,
    ingredientsList: [{ name: 'Salmon Fillet', name_zh: '三文鱼', weight: '150g' }],
  },
  {
    category: 'protein',
    title: 'Miso Tofu',
    title_zh: '味噌豆腐',
    description: 'Pan-seared tofu with miso glaze.',
    description_zh: '味噌釉面煎豆腐。',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800',
    kcal: 180, protein: 16, carbs: 8, fat: 9, isVegan: true,
    ingredientsList: [{ name: 'Firm Tofu', name_zh: '硬豆腐', weight: '150g' }],
  },
  {
    category: 'vegetable',
    title: 'Supergreen Salad',
    title_zh: '超级绿叶沙拉',
    description: 'Kale, avocado and mixed seeds.',
    description_zh: '羽衣甘蓝、牛油果与混合种子。',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800',
    kcal: 180, protein: 6, carbs: 12, fat: 12, isVegan: true,
    ingredientsList: [
      { name: 'Kale', name_zh: '羽衣甘蓝', weight: '80g' },
      { name: 'Avocado', name_zh: '牛油果', weight: '50g' },
    ],
  },
  {
    category: 'vegetable',
    title: 'Steamed Broccoli',
    title_zh: '清蒸西兰花',
    description: 'Simple steamed broccoli florets.',
    description_zh: '简单清蒸西兰花。',
    image: 'https://images.unsplash.com/photo-1459411552885-841a9a7e7337?auto=format&fit=crop&q=80&w=800',
    kcal: 55, protein: 4, carbs: 8, fat: 1, isVegan: true,
    ingredientsList: [{ name: 'Broccoli', name_zh: '西兰花', weight: '150g' }],
  },
  {
    category: 'combo',
    title: 'Detox Power Bowl',
    title_zh: '排毒能量碗',
    description: 'Complete balanced meal bowl.',
    description_zh: '均衡营养完整餐。',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800',
    kcal: 420, protein: 22, carbs: 38, fat: 16, isVegan: true,
    ingredientsList: [
      { name: 'Quinoa', name_zh: '藜麦', weight: '80g' },
      { name: 'Chickpeas', name_zh: '鹰嘴豆', weight: '60g' },
    ],
  },
];

async function runSeed({ disconnect = false } = {}) {
  console.log('[Seed] 开始写入种子数据');

  // 演示用户
  let user = await User.findOne({ phone: '13800138000' });
  if (!user) {
    user = await User.create({
      phone: '13800138000',
      password: '123456',
      name: 'Demo User',
      height: 175,
      weight: 78,
      targetWeight: 70,
      streak: 5,
      wallet: 1240.5,
    });
    console.log('[Seed] 创建演示用户: 13800138000 / 123456');
  } else {
    console.log('[Seed] 演示用户已存在，跳过');
  }

  const existing = await Recipe.countDocuments();
  if (existing >= SEED_RECIPES.length) {
    console.log(`[Seed] 已有 ${existing} 条菜谱，跳过写入`);
  } else {
    await Recipe.deleteMany({});
    await Recipe.insertMany(
      SEED_RECIPES.map((r) => ({
        ...r,
        author: user._id,
        authorName: user.name,
        published: true,
      }))
    );
    console.log(`[Seed] 写入 ${SEED_RECIPES.length} 条示例菜谱`);
  }

  const chefCount = await Chef.countDocuments();
  if (chefCount === 0) {
    await Chef.insertMany([
      {
        user: user._id,
        name: 'Chef Marcus',
        name_zh: '马库斯厨师',
        avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&q=80&w=400',
        distance: '1.2 miles',
        distance_zh: '1.2 英里',
        rating: 4.9,
        specialty: 'KETO SPECIALIST',
        specialty_zh: '生酮专家',
        responseTime: '5m',
        responseTime_zh: '5分钟',
      },
      {
        name: 'Chef Elena',
        name_zh: '埃琳娜厨师',
        avatar: 'https://images.unsplash.com/photo-1583394293214-28ded15ee548?auto=format&fit=crop&q=80&w=400',
        distance: '0.8 miles',
        distance_zh: '0.8 英里',
        rating: 4.8,
        specialty: 'PLANT BASED',
        specialty_zh: '植物基饮食',
        responseTime: '15m',
        responseTime_zh: '15分钟',
      },
    ]);
    console.log('[Seed] 写入 2 位示例厨师');
  }

  const orderCount = await Order.countDocuments({ type: 'market_request' });
  if (orderCount === 0) {
    await Order.insertMany([
      {
        customer: user._id,
        customerName: user.name,
        title: 'Weekly Keto Meal Prep',
        description: 'Need 5 lunches and 5 dinners for next week. Strictly keto.',
        price: 150,
        type: 'market_request',
        status: 'pending',
        tags: ['Keto', 'Weekly', 'High Protein'],
      },
      {
        customer: user._id,
        customerName: user.name,
        title: 'Vegan Dinner for 4',
        description: 'Looking for a fresh vegan dinner tonight.',
        price: 85,
        type: 'market_request',
        status: 'pending',
        tags: ['Vegan', 'Dinner', 'Fresh'],
      },
    ]);
    console.log('[Seed] 写入 2 条市场需求订单');
  }

  if (disconnect) {
    await mongoose.disconnect();
  }
  console.log('[Seed] 完成');
}

module.exports = { runSeed };

if (require.main === module) {
  const connectDB = require('../config/db');
  connectDB()
    .then(() => runSeed({ disconnect: true }))
    .catch((err) => {
      console.error('[Seed] 失败:', err);
      process.exit(1);
    });
}
