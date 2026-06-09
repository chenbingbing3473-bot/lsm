export type Tab = 'spin' | 'community' | 'market' | 'profile';

export interface Recipe {
  id: string;
  title: string;
  title_zh?: string;
  description: string;
  description_zh?: string;
  image: string;
  kcal: number;
  protein: number;
  author?: string;
  author_zh?: string;
  likes?: number;
  isLiked?: boolean;
  isVegan?: boolean;
  taste?: string;
  taste_zh?: string;
  comments?: { user: string; text: string; text_zh?: string; date: string }[];
  ingredients?: {
    carbs: string;
    protein: string;
    veg: string;
    fat: string;
    cook: string;
  };
  ingredientsList?: { name: string; name_zh?: string; weight: string }[];
  instructions?: string[];
  instructions_zh?: string[];
}

export interface Chef {
  id: string;
  name: string;
  name_zh?: string;
  avatar: string;
  distance: string;
  distance_zh?: string;
  rating: number;
  specialty: string;
  specialty_zh?: string;
  responseTime: string;
  responseTime_zh?: string;
}

export interface MarketRequest {
  id: string;
  title: string;
  title_zh?: string;
  description: string;
  description_zh?: string;
  price: number;
  tags: string[];
  tags_zh?: string[];
}

export const MOCK_RECIPES: Recipe[] = [
  {
    id: '1',
    title: 'Minty Lemon Chicken & Broccoli',
    title_zh: '薄荷柠檬鸡肉西兰花',
    description: 'A high-protein, zesty dish paired with iron-rich greens. Perfect for recovery and lean muscle growth.',
    description_zh: '高蛋白、清爽口味，搭配富含铁元素的绿色蔬菜。非常适合恢复和增加瘦肌肉。',
    image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&q=80&w=800',
    kcal: 620,
    protein: 150,
    author: 'Chef Marcus',
    author_zh: '马库斯厨师',
    likes: 124,
    isVegan: false,
    taste: 'Zesty, refreshing with a hint of mint and savory grilled notes.',
    taste_zh: '清爽提神，带有淡淡的薄荷味和咸香的烤肉味。',
    comments: [
      { user: 'FitFoodie', text: 'Love the minty twist!', text_zh: '喜欢这个薄荷味的创意！', date: '2d ago' },
      { user: 'GymRat99', text: 'Great protein source.', text_zh: '很棒的蛋白质来源。', date: '1d ago' }
    ],
    ingredients: { carbs: '🍚', protein: '🍗', veg: '🥦', fat: '🫒', cook: '🍳' },
    ingredientsList: [
      { name: 'Chicken Breast', name_zh: '鸡胸肉', weight: '200g' },
      { name: 'Broccoli', name_zh: '西兰花', weight: '150g' },
      { name: 'Brown Rice', name_zh: '糙米', weight: '100g' },
      { name: 'Lemon Juice', name_zh: '柠檬汁', weight: '15ml' },
      { name: 'Olive Oil', name_zh: '橄榄油', weight: '10ml' }
    ],
    instructions: [
      'Marinate chicken with lemon juice and salt.',
      'Grill chicken until golden brown and cooked through.',
      'Steam broccoli for 5 minutes until tender.',
      'Serve chicken and broccoli over cooked brown rice.'
    ],
    instructions_zh: [
      '用柠檬汁和盐腌制鸡肉。',
      '烤制鸡肉直到金黄色且全熟。',
      '将西兰花蒸5分钟直到变软。',
      '在煮熟的糙米上放上鸡肉和西兰花。'
    ]
  },
  {
    id: '2',
    title: 'Supergreen Detox Bowl',
    title_zh: '超级绿叶排毒碗',
    description: 'Top down view of a vibrant green detox bowl with avocado, kale, seeds, and microgreens.',
    description_zh: '俯瞰充满活力的绿色排毒碗，包含鳄梨、羽衣甘蓝、种子和微型蔬菜。',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800',
    kcal: 340,
    protein: 12,
    author: 'HealthyLife',
    author_zh: '健康生活',
    likes: 89,
    isVegan: true,
    taste: 'Earthiness of kale balanced by creamy avocado and nutty seeds.',
    taste_zh: '羽衣甘蓝的泥土气息与鳄梨的奶油味和种子的坚果味相得益彰。',
    comments: [
      { user: 'VeganQueen', text: 'My go-to lunch!', text_zh: '我的午餐首选！', date: '3d ago' }
    ],
    ingredients: { carbs: '🥖', protein: '🥚', veg: '🥬', fat: '🥑', cook: '🥗' },
    ingredientsList: [
      { name: 'Kale', name_zh: '羽衣甘蓝', weight: '100g' },
      { name: 'Avocado', name_zh: '鳄梨', weight: '80g' },
      { name: 'Boiled Egg', name_zh: '煮鸡蛋', weight: '1 pc' },
      { name: 'Whole Wheat Bread', name_zh: '全麦面包', weight: '1 slice' },
      { name: 'Mixed Seeds', name_zh: '混合种子', weight: '10g' }
    ],
    instructions: [
      'Massage kale with a bit of olive oil and lemon.',
      'Slice avocado and place on top of kale.',
      'Add boiled egg and toasted bread.',
      'Sprinkle with mixed seeds and serve cold.'
    ],
    instructions_zh: [
      '用少量橄榄油和柠檬按摩羽衣甘蓝。',
      '切开鳄梨并放在羽衣甘蓝上。',
      '加入煮鸡蛋和烤面包。',
      '撒上混合种子，冷餐食用。'
    ]
  },
  {
    id: '3',
    title: 'Sesame Miso Tofu',
    title_zh: '芝麻味噌豆腐',
    description: 'Miso tofu cubes with sesame seeds and green onions served on a bed of quinoa.',
    description_zh: '芝麻味增豆腐块，搭配芝麻和绿洋葱，铺在藜麦上。',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800',
    kcal: 280,
    protein: 22,
    author: 'VeganVibes',
    author_zh: '素食氛围',
    likes: 56,
    isVegan: true,
    taste: 'Umami-rich miso with a perfect balance of sweet and salty sesame.',
    taste_zh: '鲜味十足的味噌，甜咸芝麻的完美平衡。',
    comments: [
      { user: 'TofuLover', text: 'The miso glaze is everything.', text_zh: '味增釉面真是一绝。', date: '5h ago' }
    ],
    ingredients: { carbs: '🍚', protein: '🥩', veg: '🥕', fat: '🥜', cook: '🔥' },
    ingredientsList: [
      { name: 'Firm Tofu', name_zh: '硬豆腐', weight: '150g' },
      { name: 'Quinoa', name_zh: '藜麦', weight: '80g' },
      { name: 'Carrots', name_zh: '胡萝卜', weight: '50g' },
      { name: 'Miso Paste', name_zh: '味噌酱', weight: '20g' },
      { name: 'Peanuts', name_zh: '花生', weight: '10g' }
    ],
    instructions: [
      'Press tofu to remove excess water and cut into cubes.',
      'Stir-fry tofu with miso paste until crispy.',
      'Cook quinoa according to package instructions.',
      'Mix tofu with quinoa and shredded carrots, top with peanuts.'
    ],
    instructions_zh: [
      '压榨豆腐以去除多余水分并切成块。',
      '将豆腐与味噌酱炒至酥脆。',
      '按照包装说明煮藜麦。',
      '将豆腐与藜麦和切碎的胡萝卜混合，撒上花生。'
    ]
  },
  {
    id: '4',
    title: 'Zesty Salmon Salad',
    title_zh: '清爽三文鱼沙拉',
    description: 'Fresh mediterranean salmon salad with cherry tomatoes, cucumber, olives and feta cheese.',
    description_zh: '新鲜地中海三文鱼沙拉，包含樱桃番茄、黄瓜、橄榄和费塔奶酪。',
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&q=80&w=800',
    kcal: 410,
    protein: 35,
    author: 'Chef Elena',
    author_zh: '埃琳娜厨师',
    likes: 210,
    isVegan: false,
    taste: 'Classic Mediterranean flavors with a tangy citrus finish.',
    taste_zh: '经典地中海风味，带有清新的柑橘余味。',
    comments: [
      { user: 'SaladDays', text: 'So fresh and filling.', text_zh: '非常新鲜且顶饱。', date: '1w ago' }
    ],
    ingredients: { carbs: '🍝', protein: '🐟', veg: '🍅', fat: '🧀', cook: '⏲️' },
    ingredientsList: [
      { name: 'Salmon Fillet', name_zh: '三文鱼柳', weight: '150g' },
      { name: 'Whole Wheat Pasta', name_zh: '全麦面食', weight: '60g' },
      { name: 'Cherry Tomatoes', name_zh: '樱桃番茄', weight: '100g' },
      { name: 'Feta Cheese', name_zh: '费塔奶酪', weight: '30g' },
      { name: 'Cucumber', name_zh: '黄瓜', weight: '50g' }
    ],
    instructions: [
      'Bake salmon at 200°C for 12-15 minutes.',
      'Boil pasta until al dente.',
      'Toss pasta with halved tomatoes, sliced cucumber, and olives.',
      'Top with flaked salmon and crumbled feta cheese.'
    ],
    instructions_zh: [
      '在200°C下烘烤三文鱼12-15分钟。',
      '将面食煮至有嚼劲。',
      '将面食与减半的西红柿、切好的黄瓜和橄榄拌匀。',
      '放上剥碎的三文鱼和碎费塔奶酪。'
    ]
  }
];

export const MOCK_CHEFS: Chef[] = [
  {
    id: 'c1',
    name: 'Chef Marcus',
    name_zh: '马库斯厨师',
    avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&q=80&w=400',
    distance: '1.2 miles',
    distance_zh: '1.2 英里',
    rating: 4.9,
    specialty: 'KETO SPECIALIST',
    specialty_zh: '生酮专家',
    responseTime: '5m',
    responseTime_zh: '5分钟'
  },
  {
    id: 'c2',
    name: 'Chef Elena',
    name_zh: '埃琳娜厨师',
    avatar: 'https://images.unsplash.com/photo-1583394293214-28ded15ee548?auto=format&fit=crop&q=80&w=400',
    distance: '0.8 miles',
    distance_zh: '0.8 英里',
    rating: 4.8,
    specialty: 'PLANT BASED',
    specialty_zh: '植物基饮食',
    responseTime: '15m',
    responseTime_zh: '15分钟'
  }
];

export const MOCK_REQUESTS: MarketRequest[] = [
  {
    id: 'r1',
    title: 'Weekly Keto Meal Prep',
    title_zh: '每周生酮餐准备',
    description: 'Need 5 lunches and 5 dinners for next week. Strictly keto.',
    description_zh: '下周需要5顿午餐和5顿晚餐。严格生酮。',
    price: 150.00,
    tags: ['Keto', 'Weekly', 'High Protein'],
    tags_zh: ['生酮', '每周', '高蛋白']
  },
  {
    id: 'r2',
    title: 'Vegan Dinner for 4',
    title_zh: '4人份纯素晚餐',
    description: 'Looking for a fresh vegan dinner tonight. Local ingredients preferred.',
    description_zh: '今晚寻找新鲜的纯素晚餐。首选当地食材。',
    price: 85.00,
    tags: ['Vegan', 'Dinner', 'Fresh'],
    tags_zh: ['纯素', '晚餐', '新鲜']
  }
];

export const TRANSLATIONS = {
  en: {
    spin: 'Spin',
    community: 'Community',
    market: 'Market',
    profile: 'Profile',
    weight: 'Weight',
    diet: 'Diet',
    regular: 'Regular',
    vegan: 'Vegan',
    budget: 'Daily Budget',
    repetition: 'Repetition',
    spinBtn: 'SPIN',
    latest: 'Latest',
    trending: 'Trending',
    following: 'Following',
    findChef: 'Find Chef',
    acceptOrders: 'Accept Orders',
    nearby: 'Nearby Chefs',
    requests: 'Live Requests',
    streak: 'Streak',
    wallet: 'Wallet',
    healthTrends: 'Health Trends',
    feedback: 'Feedback',
    away: 'away',
    response: 'Response',
    online: 'Online',
    filter: 'Filter',
    postRequest: 'Post Request',
    uploadPlan: 'Upload Weekly Plan',
    becomeChef: 'Become a Chef',
    registerNow: 'Register Now',
    pending: 'Pending',
    ongoing: 'Ongoing',
    completed: 'Completed',
    recipeLibrary: 'Recipe Library',
    savedItems: 'saved items',
    balance: 'Balance',
    thisWeek: 'This Week',
    justNow: 'Just now',
    savePlan: 'Save Plan',
    ingredients: 'Ingredients',
    instructions: 'Instructions',
    kcal: 'Kcal',
    protein: 'Protein',
    carbs: 'Carbs',
    fat: 'Fat',
    cook: 'Cook',
    postNow: 'Post Now'
  },
  zh: {
    spin: '摇号',
    community: '社区',
    market: '代厨',
    profile: '我的',
    weight: '体重',
    diet: '饮食偏好',
    regular: '常规',
    vegan: '纯素',
    budget: '每日预算',
    repetition: '重复度',
    spinBtn: '摇一摇',
    latest: '最新',
    trending: '热门',
    following: '关注',
    findChef: '找厨师',
    acceptOrders: '接单',
    nearby: '附近厨师',
    requests: '实时需求',
    streak: '连续打卡',
    wallet: '钱包',
    healthTrends: '健康趋势',
    feedback: '意见反馈',
    away: '距离',
    response: '响应',
    online: '在线',
    filter: '筛选',
    postRequest: '发布需求',
    uploadPlan: '上传周计划',
    becomeChef: '成为代厨',
    registerNow: '立即注册',
    pending: '待处理',
    ongoing: '进行中',
    completed: '已完成',
    recipeLibrary: '菜谱库',
    savedItems: '个已保存',
    balance: '余额',
    thisWeek: '本周',
    justNow: '刚刚',
    savePlan: '保存计划',
    ingredients: '食材',
    instructions: '步骤',
    kcal: '千卡',
    protein: '蛋白质',
    carbs: '碳水',
    fat: '脂肪',
    cook: '烹饪',
    postNow: '立即发布'
  }
};
