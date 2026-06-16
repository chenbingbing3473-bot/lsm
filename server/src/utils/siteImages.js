/** 站点内静态图（由 Nginx 提供，国内可访问） */
const SITE_IMAGES = {
  staple: '/images/seed-staple.svg',
  protein: '/images/seed-protein.svg',
  vegetable: '/images/seed-vegetable.svg',
  combo: '/images/seed-combo.svg',
  chef: '/images/seed-chef.svg',
  user: '/images/seed-user.svg',
};

/** 将数据库里 Unsplash 外链替换为本地静态图 */
async function migrateExternalImages() {
  const Recipe = require('../models/Recipe');
  const Chef = require('../models/Chef');
  const User = require('../models/User');

  for (const cat of ['staple', 'protein', 'vegetable', 'combo']) {
    const r = await Recipe.updateMany(
      { category: cat, image: /unsplash\.com/i },
      { $set: { image: SITE_IMAGES[cat] } }
    );
    if (r.modifiedCount) console.log(`[Seed] 已更新 ${r.modifiedCount} 条 ${cat} 菜谱图片`);
  }

  const chefs = await Chef.updateMany(
    { avatar: /unsplash\.com/i },
    { $set: { avatar: SITE_IMAGES.chef } }
  );
  if (chefs.modifiedCount) console.log(`[Seed] 已更新 ${chefs.modifiedCount} 位厨师头像`);

  const users = await User.updateMany(
    { avatar: /unsplash\.com/i },
    { $set: { avatar: SITE_IMAGES.user } }
  );
  if (users.modifiedCount) console.log(`[Seed] 已更新 ${users.modifiedCount} 个用户头像`);
}

module.exports = { SITE_IMAGES, migrateExternalImages };
