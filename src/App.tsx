import { useState, FormEvent, useEffect, useCallback, type MouseEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bolt, 
  Users, 
  ShoppingBasket, 
  User, 
  Menu, 
  Bell,
  Plus,
  ArrowRight,
  Heart,
  Bookmark,
  Star,
  ChefHat,
  Wallet,
  TrendingUp,
  MessageSquare,
  Share2,
  MessageCircle,
  ArrowLeft,
  X,
  Languages,
  Calendar,
  CheckCircle2,
  Camera,
  Image as ImageIcon,
  Phone
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Tab, TRANSLATIONS } from '@/src/constants';
import {
  getToken,
  setToken,
  fetchProfile,
  fetchCommunityRecipes,
  fetchChefs,
  fetchMarketOrders,
  fetchMyOrders,
  fetchSpin,
  sendCode,
  loginByCode,
  uploadRecipe,
  postRecipe,
  createRecipeManual,
  toggleLike,
  addComment,
  updateBody,
  updateProfile,
  createOrder,
  registerChef,
  acceptOrder,
  submitFeedback,
  mapApiUser,
  mapApiChef,
  mapApiOrder,
} from '@/src/lib/api';
import { 
  BarChart, 
  Bar, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';

// --- Sub-components ---

const TopBar = ({ onMenuClick, onNotificationClick }: { onMenuClick: () => void, onNotificationClick: () => void }) => (
  <header className="flex justify-between items-center px-6 py-4 w-full sticky top-0 z-50 bg-surface/80 backdrop-blur-md">
    <button 
      onClick={onMenuClick}
      className="p-2 hover:bg-surface-container rounded-full transition-colors"
    >
      <Menu size={24} className="text-on-surface" />
    </button>
    <h1 className="text-2xl font-black tracking-tighter text-on-surface">KINETIC</h1>
    <button 
      onClick={onNotificationClick}
      className="p-2 hover:bg-surface-container rounded-full transition-colors relative"
    >
      <Bell size={24} className="text-on-surface" />
      <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-surface" />
    </button>
  </header>
);

const Sidebar = ({ 
  isOpen, 
  onClose, 
  language, 
  onLanguageChange 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  language: 'en' | 'zh', 
  onLanguageChange: (l: 'en' | 'zh') => void 
}) => {
  const checkIns = [
    { date: '2026-04-13', status: 'Completed', meal: language === 'zh' ? '清爽三文鱼' : 'Zesty Salmon' },
    { date: '2026-04-12', status: 'Completed', meal: language === 'zh' ? '味噌豆腐' : 'Miso Tofu' },
    { date: '2026-04-11', status: 'Missed', meal: '-' },
    { date: '2026-04-10', status: 'Completed', meal: language === 'zh' ? '排毒碗' : 'Detox Bowl' },
    { date: '2026-04-09', status: 'Completed', meal: language === 'zh' ? '柠檬鸡' : 'Lemon Chicken' },
  ];

  const t = {
    en: {
      checkIn: 'Check-in Records',
      language: 'Language',
      close: 'Close',
      records: 'Records',
      status: 'Status',
      meal: 'Meal'
    },
    zh: {
      checkIn: '打卡记录',
      language: '语言设置',
      close: '关闭',
      records: '记录',
      status: '状态',
      meal: '餐食'
    }
  }[language];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-[100]"
          />
          <motion.div 
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 w-80 bg-surface z-[101] shadow-2xl p-8 flex flex-col"
          >
            <div className="flex justify-between items-center mb-12">
              <h2 className="text-2xl font-black tracking-tight text-on-surface uppercase">{language === 'zh' ? '菜单' : 'Menu'}</h2>
              <button onClick={onClose} className="p-2 bg-surface-container rounded-full">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 space-y-10 overflow-y-auto no-scrollbar">
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-primary">
                  <Calendar size={20} />
                  <h3 className="text-xs font-black uppercase tracking-widest">{t.checkIn}</h3>
                </div>
                <div className="space-y-3">
                  {checkIns.map((item, i) => (
                    <div key={i} className="bg-surface-container-low p-4 rounded-xl flex justify-between items-center border border-outline-variant/5">
                      <div>
                        <p className="text-[10px] font-bold text-outline uppercase">{item.date}</p>
                        <p className="font-bold text-sm">{item.meal}</p>
                      </div>
                      <div className={cn(
                        "flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold",
                        item.status === 'Completed' ? "bg-primary/10 text-primary" : "bg-on-surface/5 text-on-surface/40"
                      )}>
                        {item.status === 'Completed' && <CheckCircle2 size={12} />}
                        {item.status === 'Completed' ? (language === 'zh' ? '已完成' : 'Completed') : (language === 'zh' ? '未打卡' : 'Missed')}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-2 text-secondary">
                  <Languages size={20} />
                  <h3 className="text-xs font-black uppercase tracking-widest">{t.language}</h3>
                </div>
                <div className="flex bg-surface-container p-1 rounded-full">
                  <button 
                    onClick={() => onLanguageChange('en')}
                    className={cn(
                      "flex-1 py-3 rounded-full text-xs font-bold transition-all",
                      language === 'en' ? "bg-on-surface text-surface shadow-md" : "text-on-surface/40"
                    )}
                  >
                    English
                  </button>
                  <button 
                    onClick={() => onLanguageChange('zh')}
                    className={cn(
                      "flex-1 py-3 rounded-full text-xs font-bold transition-all",
                      language === 'zh' ? "bg-on-surface text-surface shadow-md" : "text-on-surface/40"
                    )}
                  >
                    中文
                  </button>
                </div>
              </section>
            </div>

            <div className="mt-auto pt-8 border-t border-outline-variant/10">
              <p className="text-[10px] font-bold text-outline text-center uppercase tracking-widest opacity-40">Kinetic v1.2.0</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const BottomNav = ({ activeTab, onTabChange, language }: { activeTab: Tab, onTabChange: (tab: Tab) => void, language: 'en' | 'zh' }) => {
  const t = TRANSLATIONS[language];
  const tabs: { id: Tab, label: string, icon: any }[] = [
    { id: 'spin', label: t.spin, icon: Bolt },
    { id: 'community', label: t.community, icon: Users },
    { id: 'market', label: t.market, icon: ShoppingBasket },
    { id: 'profile', label: t.profile, icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 px-4 pb-8 pt-4 bg-surface/80 backdrop-blur-xl border-t border-outline-variant/10 rounded-t-[3rem] shadow-2xl">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex flex-col items-center justify-center px-5 py-2 rounded-full transition-all duration-300 active:scale-90",
                isActive ? "bg-primary text-surface" : "text-on-surface/60 hover:bg-surface-container"
              )}
            >
              <Icon size={24} fill={isActive ? "currentColor" : "none"} />
              <span className="text-[10px] font-bold uppercase tracking-widest mt-1">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

// --- Views ---

const SpinView = ({ language, initialWeight, onWeightChange }: { language: 'en' | 'zh', initialWeight?: number, onWeightChange?: (w: number) => void }) => {
  const t = TRANSLATIONS[language];
  const [isSpinning, setIsSpinning] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  const [offsets, setOffsets] = useState([0, 0, 0, 0, 0]);
  const [showDetails, setShowDetails] = useState(false);
  const [budget, setBudget] = useState(45);
  const [diet, setDiet] = useState<'regular' | 'vegan'>('regular');
  const [userWeight, setUserWeight] = useState(initialWeight || 78);
  const [spinError, setSpinError] = useState('');

  useEffect(() => {
    if (initialWeight) setUserWeight(initialWeight);
  }, [initialWeight]);

  useEffect(() => {
    if (!onWeightChange || userWeight <= 0) return;
    const timer = setTimeout(() => onWeightChange(userWeight), 600);
    return () => clearTimeout(timer);
  }, [userWeight, onWeightChange]);

  // Helper to scale recipe based on weight
  const getScaledRecipe = (recipe: any) => {
    const scale = userWeight / 70; // Baseline 70kg
    return {
      ...recipe,
      kcal: Math.round(recipe.kcal * scale),
      protein: Math.round(recipe.protein * scale),
      ingredientsList: recipe.ingredientsList?.map((ing: any) => {
        const weightMatch = ing.weight.match(/(\d+)(g|ml|pc)/);
        if (weightMatch) {
          const value = parseInt(weightMatch[1]);
          const unit = weightMatch[2];
          return { ...ing, weight: `${Math.round(value * scale)}${unit}` };
        }
        return ing;
      })
    };
  };

  const scaledRecipe = selectedRecipe ? getScaledRecipe(selectedRecipe) : null;

  const tProp = (obj: any, key: string) => {
    if (!obj) return '';
    if (language === 'zh' && obj[key + '_zh']) return obj[key + '_zh'];
    return obj[key];
  };

  const handleSpin = async () => {
    setIsSpinning(true);
    setShowResult(false);
    setShowDetails(false);
    setSpinError('');

    try {
      const result = await fetchSpin(diet);
      setSelectedRecipe(result.combo);

      const indices = result.slotIndices || [2, 2, 2, 0, 0];
      const newOffsets = indices.map((idx) => {
        const middleSetIndex = idx + 5;
        return 64 - (middleSetIndex * 64);
      });

      setTimeout(() => {
        setIsSpinning(false);
        setOffsets(newOffsets);
        setShowResult(true);
      }, 2000);
    } catch (err: any) {
      setIsSpinning(false);
      setSpinError(err.message || (language === 'zh' ? '摇号失败，请确认后端已启动' : 'Spin failed'));
    }
  };

  const slotIcons = [
    ['🍞', '🍚', '🍝', '🥔', '🥖'],
    ['🍗', '🐟', '🥩', '🥚', '🍤'],
    ['🥦', '🥬', '🥕', '🍅', '🫑'],
    ['🥑', '🫒', '🥜', '🧈', '🧀'],
    ['🍳', '🔥', '⏲️', '🔪', '🥗']
  ];

  return (
    <div className="space-y-8 pb-10">
      <section className="mt-4">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-2 block">{language === 'zh' ? '餐食生成器' : 'Meal Generator'}</span>
        <h2 className="text-[3.5rem] leading-tight font-bold tracking-tight text-on-surface">{language === 'zh' ? '旋饭' : 'Spin your next fuel.'}</h2>
      </section>

      <section className="grid grid-cols-2 gap-4">
        <div className="bg-surface-container-low p-6 rounded-xl">
          <span className="text-[10px] font-bold text-outline uppercase tracking-widest block mb-2">{t.weight}</span>
          <div className="flex items-end gap-1">
            <input 
              type="number" 
              value={userWeight}
              onChange={(e) => setUserWeight(parseInt(e.target.value) || 0)}
              className="bg-transparent border-none p-0 text-3xl font-bold text-on-surface w-16 focus:ring-0"
            />
            <span className="text-sm font-medium pb-1 opacity-60">kg</span>
          </div>
        </div>
        <div className="bg-surface-container-low p-6 rounded-xl flex flex-col justify-between">
          <span className="text-[10px] font-bold text-outline uppercase tracking-widest mb-4">{t.diet}</span>
          <div className="flex bg-surface-container p-1 rounded-full">
            <button 
              onClick={() => setDiet('regular')}
              className={cn(
                "flex-1 py-1.5 rounded-full text-[10px] font-bold transition-all",
                diet === 'regular' ? "bg-on-surface text-surface" : "text-on-surface-variant"
              )}
            >
              {t.regular}
            </button>
            <button 
              onClick={() => setDiet('vegan')}
              className={cn(
                "flex-1 py-1.5 rounded-full text-[10px] font-bold transition-all",
                diet === 'vegan' ? "bg-on-surface text-surface" : "text-on-surface-variant"
              )}
            >
              {t.vegan}
            </button>
          </div>
        </div>
        <div className="col-span-2 bg-surface-container-low p-6 rounded-xl space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-outline uppercase tracking-widest">{t.budget}</span>
            <span className="text-lg font-bold text-on-surface">${budget}</span>
          </div>
          <input 
            type="range" 
            min="10" 
            max="100" 
            value={budget}
            onChange={(e) => setBudget(parseInt(e.target.value))}
            className="w-full accent-primary" 
          />
          <div className="flex justify-between text-[10px] font-bold text-outline">
            <span>$10</span>
            <span>$100+</span>
          </div>
        </div>
      </section>

      {spinError && (
        <p className="text-sm text-primary font-bold text-center bg-primary/10 py-3 rounded-xl">{spinError}</p>
      )}

      <section className="relative bg-on-surface rounded-xl overflow-hidden py-8">
        <div className="grid grid-cols-5 gap-1 px-4 relative h-48">
          {slotIcons.map((col, i) => (
            <div key={i} className="flex flex-col items-center overflow-hidden">
              <motion.div
                animate={isSpinning ? { y: [0, -640] } : { y: offsets[i] }}
                transition={isSpinning ? { repeat: Infinity, duration: 0.5, ease: "linear" } : { type: "spring", stiffness: 40, damping: 12 }}
                className="flex flex-col"
              >
                {col.concat(col).concat(col).map((icon, j) => (
                  <div key={j} className="h-16 w-full flex items-center justify-center">
                    <span className="text-4xl filter grayscale opacity-40">{icon}</span>
                  </div>
                ))}
              </motion.div>
            </div>
          ))}
          <div className="absolute inset-0 pointer-events-none slot-gradient opacity-20" />
          <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 h-16 border-y border-primary-container/20 pointer-events-none" />
        </div>
        <div className="grid grid-cols-5 px-4 mt-4">
          {[(language === 'zh' ? '碳水' : 'Carbs'), (language === 'zh' ? '蛋白质' : 'Protein'), (language === 'zh' ? '蔬菜' : 'Veg'), (language === 'zh' ? '脂肪' : 'Fat'), (language === 'zh' ? '烹饪' : 'Cook')].map((label, idx) => (
            <span key={idx} className="text-[8px] font-black uppercase text-surface/40 text-center">{label}</span>
          ))}
        </div>
      </section>

      <div className="flex justify-center -mt-12 relative z-10">
        <button 
          onClick={handleSpin}
          disabled={isSpinning}
          className="bg-primary text-surface h-24 w-24 rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-transform duration-200 group disabled:opacity-70"
        >
          <div className="flex flex-col items-center">
            <Bolt size={32} fill="currentColor" className={cn(isSpinning && "animate-pulse")} />
            <span className="text-[10px] font-black uppercase tracking-tighter">{isSpinning ? (language === 'zh' ? '正在摇' : 'SPINNING') : t.spinBtn}</span>
          </div>
        </button>
      </div>

      <AnimatePresence>
        {showResult && scaledRecipe && (
          <motion.section
            initial={{ opacity: 0, y: 100, scale: 0.9, rotateX: 30 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1, 
              rotateX: 0,
              transition: {
                type: "spring",
                stiffness: 100,
                damping: 20,
                mass: 1
              }
            }}
            className="space-y-4"
          >
            <div className="flex justify-between items-end">
              <h3 className="text-2xl font-bold">{language === 'zh' ? '摇号结果' : 'New Result'}</h3>
              <span className="text-xs font-bold text-primary">{language === 'zh' ? '刚刚' : 'Just now'}</span>
            </div>
            <div 
              onClick={() => setShowDetails(true)}
              className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-xl cursor-pointer active:scale-[0.98] transition-transform"
            >
              <div className="relative h-64">
                <img 
                  src={selectedRecipe.image} 
                  alt={selectedRecipe.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 right-4 bg-surface/90 backdrop-blur-md px-4 py-2 rounded-full flex gap-3 items-center">
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black text-on-surface/40 uppercase">{language === 'zh' ? '千卡' : 'Kcal'}</span>
                    <span className="text-sm font-bold">{scaledRecipe.kcal}</span>
                  </div>
                  <div className="w-[1px] h-4 bg-outline-variant/30" />
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black text-on-surface/40 uppercase">{language === 'zh' ? '蛋白' : 'Prot'}</span>
                    <span className="text-sm font-bold">{scaledRecipe.protein}g</span>
                  </div>
                </div>
              </div>
              <div className="p-8 space-y-6">
                <div>
                  <h4 className="text-2xl font-bold tracking-tight text-on-surface">{tProp(scaledRecipe, 'title')}</h4>
                  <p className="text-on-surface-variant text-sm mt-2 leading-relaxed">{tProp(scaledRecipe, 'description')}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button className="bg-on-surface text-surface py-4 rounded-full font-bold text-sm active:scale-95 transition-transform">
                    {language === 'zh' ? '保存计划' : 'Save Plan'}
                  </button>
                  <button className="bg-secondary-container text-secondary py-4 rounded-full font-bold text-sm active:scale-95 transition-transform flex items-center justify-center gap-2">
                    <User size={18} />
                    {language === 'zh' ? '找代厨' : 'Find a Chef'}
                  </button>
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDetails && scaledRecipe && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-on-surface/40 backdrop-blur-sm flex items-end justify-center"
            onClick={() => setShowDetails(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-surface w-full max-w-md rounded-t-[32px] p-8 max-h-[85vh] overflow-y-auto no-scrollbar"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-12 h-1.5 bg-outline-variant/30 rounded-full mx-auto mb-8" />
              
              <div className="space-y-8">
                <header>
                  <h2 className="text-3xl font-bold tracking-tight">{tProp(scaledRecipe, 'title')}</h2>
                  <p className="text-on-surface-variant mt-2">{tProp(scaledRecipe, 'description')}</p>
                </header>

                <section className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-primary">{language === 'zh' ? '食材与重量' : 'Ingredients & Weights'}</h3>
                  <div className="grid gap-3">
                    {scaledRecipe.ingredientsList?.map((item: any, i: number) => (
                      <div key={i} className="flex justify-between items-center p-4 bg-surface-container-low rounded-xl">
                        <span className="font-bold text-on-surface">{tProp(item, 'name')}</span>
                        <span className="text-sm font-black text-primary bg-primary/10 px-3 py-1 rounded-full">{item.weight}</span>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-primary">{language === 'zh' ? '烹饪步骤' : 'Cooking Instructions'}</h3>
                  <div className="space-y-6">
                    {(tProp(selectedRecipe, 'instructions') || []).map((step: string, i: number) => (
                      <div key={i} className="flex gap-4">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-on-surface text-surface flex items-center justify-center text-[10px] font-bold">
                          {i + 1}
                        </span>
                        <p className="text-sm leading-relaxed text-on-surface-variant font-medium">{step}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <button 
                  onClick={() => setShowDetails(false)}
                  className="w-full bg-on-surface text-surface py-5 rounded-full font-bold text-lg shadow-xl active:scale-95 transition-transform"
                >
                  {language === 'zh' ? '知道了' : 'Got it!'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CommunityView = ({ 
  recipes, 
  loading,
  onAddRecipe, 
  onLikeRecipe,
  onCommentRecipe,
  language,
  isAuthenticated,
  onLoginClick
}: { 
  recipes: any[], 
  loading?: boolean,
  onAddRecipe: (r: any) => void, 
  onLikeRecipe: (id: string) => Promise<any>,
  onCommentRecipe: (id: string, text: string) => Promise<any>,
  language: 'en' | 'zh',
  isAuthenticated: boolean,
  onLoginClick: () => void
}) => {
  const t = TRANSLATIONS[language];
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const handleCreateClick = () => {
    if (!isAuthenticated) {
      onLoginClick();
    } else {
      setShowCreate(true);
    }
  };

  const tProp = (obj: any, key: string) => {
    if (language === 'zh' && obj[key + '_zh']) return obj[key + '_zh'];
    return obj[key];
  };

  const handleLike = async (e: MouseEvent, recipeId: string) => {
    e.stopPropagation();
    if (!isAuthenticated) { onLoginClick(); return; }
    setActionLoading(true);
    try {
      const updated = await onLikeRecipe(recipeId);
      if (selectedRecipe?.id === recipeId) setSelectedRecipe(updated);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCommentSubmit = async () => {
    if (!commentText.trim() || !selectedRecipe) return;
    if (!isAuthenticated) { onLoginClick(); return; }
    setActionLoading(true);
    try {
      const updated = await onCommentRecipe(selectedRecipe.id, commentText.trim());
      setSelectedRecipe(updated);
      setCommentText('');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <section className="bg-primary rounded-xl p-6 text-surface shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Bolt size={120} fill="currentColor" />
        </div>
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">{language === 'zh' ? '总积分' : 'Total Score'}</p>
              <h2 className="text-4xl font-extrabold tracking-tight">12,450 <span className="text-lg font-medium opacity-80">KP</span></h2>
            </div>
            <div className="bg-surface/20 px-3 py-1 rounded-full backdrop-blur-md">
              <span className="text-xs font-bold">July</span>
            </div>
          </div>
          <div className="mt-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold">{language === 'zh' ? '连胜奖励' : 'Bonus streak'}</span>
              <span className="text-xs font-bold">7 {language === 'zh' ? '天' : 'days'}</span>
            </div>
            <div className="h-3 w-full bg-surface/20 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '85%' }}
                className="h-full bg-surface rounded-full" 
              />
            </div>
          </div>
        </div>
      </section>

      <nav className="flex gap-6 items-center overflow-x-auto no-scrollbar">
        {[t.latest, t.trending, t.following].map((tab, i) => (
          <button key={tab} className={cn(
            "text-lg font-bold whitespace-nowrap relative",
            i === 0 ? "text-primary" : "text-on-surface/40"
          )}>
            {tab}
            {i === 0 && <span className="absolute -bottom-1 left-0 w-4 h-1 bg-primary rounded-full" />}
          </button>
        ))}
      </nav>

      {loading ? (
        <p className="text-center text-on-surface-variant py-8">{language === 'zh' ? '加载中...' : 'Loading...'}</p>
      ) : recipes.length === 0 ? (
        <p className="text-center text-on-surface-variant py-8">{language === 'zh' ? '暂无菜谱，快来发布第一条吧' : 'No recipes yet'}</p>
      ) : (
      <div className="columns-2 gap-4 space-y-4">
        {recipes.map((recipe) => (
          <motion.article 
            key={recipe.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => setSelectedRecipe(recipe)}
            className="break-inside-avoid bg-surface-container-low rounded-xl overflow-hidden border border-outline-variant/10 group cursor-pointer active:scale-95 transition-transform"
          >
            <div className="relative">
              <img src={recipe.image} alt={recipe.title} className="w-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
              <button onClick={(e) => handleLike(e, recipe.id)} className="absolute top-2 right-2 p-2 bg-surface/80 backdrop-blur-sm rounded-full text-primary shadow-sm">
                <Heart size={16} fill={recipe.isLiked ? "currentColor" : "none"} />
              </button>
            </div>
            <div className="p-4 space-y-2">
              <h3 className="font-bold text-on-surface leading-tight text-sm">{tProp(recipe, 'title')}</h3>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-secondary uppercase tracking-wider bg-secondary-container px-2 py-0.5 rounded-full">{recipe.kcal} kcal</span>
                <Bookmark size={16} className="text-outline" />
              </div>
            </div>
          </motion.article>
        ))}
      </div>
      )}

      <AnimatePresence>
        {selectedRecipe && (
          <motion.div 
            key="recipe-detail"
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 z-[70] bg-surface overflow-y-auto no-scrollbar"
          >
            <div className="relative h-80">
              <img 
                src={selectedRecipe.image} 
                alt={selectedRecipe.title} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <button 
                onClick={() => setSelectedRecipe(null)}
                className="absolute top-6 left-6 w-10 h-10 bg-surface/80 backdrop-blur-md rounded-full flex items-center justify-center text-on-surface shadow-lg"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-surface to-transparent" />
            </div>

            <div className="px-6 -mt-12 relative z-10 space-y-8 pb-12">
              <header className="space-y-4">
                <div className="flex justify-between items-start">
                  <h2 className="text-3xl font-black tracking-tight text-on-surface leading-tight flex-1 pr-4">
                    {tProp(selectedRecipe, 'title')}
                  </h2>
                  <div className="flex flex-col items-end">
                    <span className="text-2xl font-black text-primary">{selectedRecipe.kcal}</span>
                    <span className="text-[10px] font-bold text-outline uppercase tracking-widest">Kcal</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-secondary font-bold text-xs">
                    {tProp(selectedRecipe, 'author')?.charAt(0)}
                  </div>
                  <span className="text-sm font-bold text-on-surface-variant">{language === 'zh' ? '由' : 'by'} {tProp(selectedRecipe, 'author')}</span>
                </div>
              </header>

              <section className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-widest text-primary">{language === 'zh' ? '味道描述' : 'Taste Profile'}</h3>
                <p className="text-on-surface-variant leading-relaxed italic">
                  "{tProp(selectedRecipe, 'taste') || (language === 'zh' ? "一份为您动力生活设计的均衡营养餐。" : "A balanced and nutritious meal designed for your kinetic lifestyle.")}"
                </p>
              </section>

              <div className="flex gap-4">
                <button 
                  onClick={async () => {
                    if (!isAuthenticated) { onLoginClick(); return; }
                    try {
                      const updated = await onLikeRecipe(selectedRecipe.id);
                      setSelectedRecipe(updated);
                    } catch (err: any) { alert(err.message); }
                  }}
                  className="flex-1 bg-surface-container-highest py-4 rounded-2xl flex flex-col items-center gap-1 active:scale-95 transition-transform"
                >
                  <Heart size={20} className="text-primary" fill={selectedRecipe.isLiked ? "currentColor" : "none"} />
                  <span className="text-[10px] font-bold uppercase">{selectedRecipe.likes} {language === 'zh' ? '点赞' : 'Likes'}</span>
                </button>
                <button className="flex-1 bg-surface-container-highest py-4 rounded-2xl flex flex-col items-center gap-1 active:scale-95 transition-transform">
                  <MessageCircle size={20} className="text-secondary" />
                  <span className="text-[10px] font-bold uppercase">{selectedRecipe.comments?.length || 0} {language === 'zh' ? '评论' : 'Comments'}</span>
                </button>
                <button 
                  onClick={() => navigator.share?.({ title: tProp(selectedRecipe, 'title'), url: window.location.href })}
                  className="flex-1 bg-surface-container-highest py-4 rounded-2xl flex flex-col items-center gap-1 active:scale-95 transition-transform"
                >
                  <Share2 size={20} className="text-on-surface" />
                  <span className="text-[10px] font-bold uppercase">{language === 'zh' ? '分享' : 'Share'}</span>
                </button>
              </div>

              <section className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-primary">{language === 'zh' ? '食材' : 'Ingredients'}</h3>
                <div className="grid gap-2">
                  {selectedRecipe.ingredientsList?.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between items-center p-4 bg-surface-container-low rounded-xl border border-outline-variant/5">
                      <span className="font-bold text-on-surface">{tProp(item, 'name')}</span>
                      <span className="text-sm font-black text-primary">{item.weight}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="space-y-6">
                <h3 className="text-xs font-black uppercase tracking-widest text-primary">{language === 'zh' ? '评论' : 'Comments'}</h3>
                <div className="space-y-4">
                  {selectedRecipe.comments?.map((comment: any, i: number) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-[10px] font-bold">
                        {comment.user.charAt(0)}
                      </div>
                      <div className="flex-1 bg-surface-container-low p-3 rounded-2xl rounded-tl-none">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-bold">{comment.user}</span>
                          <span className="text-[10px] text-outline">{comment.date}</span>
                        </div>
                        <p className="text-xs text-on-surface-variant">{tProp(comment, 'text')}</p>
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-3 mt-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-[10px]">
                      Y
                    </div>
                    <input 
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCommentSubmit()}
                      placeholder={language === 'zh' ? '添加评论...' : "Add a comment..."} 
                      className="flex-1 bg-surface-container border-none rounded-full px-4 text-xs focus:ring-1 focus:ring-primary"
                      disabled={actionLoading}
                    />
                  </div>
                </div>
              </section>
            </div>
          </motion.div>
        )}

        {showCreate && (
          <CreatePostModal 
            onClose={() => setShowCreate(false)} 
            onAdd={(r) => {
              onAddRecipe(r);
              setShowCreate(false);
            }}
            language={language}
          />
        )}
      </AnimatePresence>

      <button 
        onClick={handleCreateClick}
        className="fixed bottom-32 right-6 w-14 h-14 bg-on-surface text-surface rounded-full shadow-lg flex items-center justify-center active:scale-90 transition-transform z-40"
      >
        <Plus size={32} />
      </button>
    </div>
  );
};

const CreatePostModal = ({ onClose, onAdd, language }: { onClose: () => void, onAdd: (r: any) => void, language: 'en' | 'zh' }) => {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError(language === 'zh' ? '请填写菜名' : 'Please enter a title');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const recipe = await postRecipe({
        title: title.trim(),
        description: desc.trim(),
        image: imageFile,
      });
      onAdd(recipe);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        className="relative w-full max-w-lg bg-surface rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-black tracking-tight">{language === 'zh' ? '发布动态' : 'Create Post'}</h2>
          <button onClick={onClose} className="p-2 bg-surface-container rounded-full"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <label className="aspect-video bg-surface-container rounded-3xl border-2 border-dashed border-outline-variant flex flex-col items-center justify-center gap-2 text-outline cursor-pointer hover:bg-surface-container-highest transition-colors relative overflow-hidden">
            <input type="file" accept="image/*" className="hidden" onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) { setImageFile(file); setImagePreview(URL.createObjectURL(file)); }
            }} />
            {imagePreview ? (
              <img src={imagePreview} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <>
                <Camera size={32} />
                <span className="text-xs font-bold uppercase tracking-widest">{language === 'zh' ? '点击上传照片' : 'Click to upload photo'}</span>
              </>
            )}
          </label>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-outline-variant px-1">{language === 'zh' ? '标题' : 'Title'}</label>
              <input 
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                placeholder={language === 'zh' ? '给你的美食起个名字...' : 'Name your creation...'}
                className="w-full bg-surface-container border-none rounded-2xl py-4 px-6 text-on-surface font-bold focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-outline-variant px-1">{language === 'zh' ? '描述' : 'Description'}</label>
              <textarea 
                value={desc}
                onChange={e => setDesc(e.target.value)}
                placeholder={language === 'zh' ? '分享一下味道和做法...' : 'Share the taste and recipe...'}
                rows={3}
                className="w-full bg-surface-container border-none rounded-2xl py-4 px-6 text-on-surface font-medium focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-primary font-bold bg-primary/10 px-4 py-3 rounded-xl">{error}</p>
          )}

          <button 
            type="submit"
            disabled={submitting}
            className="w-full bg-primary text-surface py-4 rounded-full font-bold text-lg shadow-lg shadow-primary/20 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {submitting ? (language === 'zh' ? '发布中...' : 'Posting...') : (language === 'zh' ? '立即发布' : 'Post Now')}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const MarketView = ({ chefs, requests, onAddChef, onCreateOrder, onAcceptOrder, language }: { chefs: any[], requests: any[], onAddChef: (c: any) => Promise<void>, onCreateOrder: (data: any) => Promise<void>, onAcceptOrder: (id: string) => Promise<void>, language: 'en' | 'zh' }) => {
  const t = TRANSLATIONS[language];
  const [mode, setMode] = useState<'find' | 'accept'>('find');
  const [showChefForm, setShowChefForm] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [selectedChef, setSelectedChef] = useState<any>(null);
  const [newChef, setNewChef] = useState({
    name: '',
    specialty: language === 'zh' ? '生酮专家' : 'KETO SPECIALIST',
    avatar: 'https://images.unsplash.com/photo-1583394293214-28ded15ee548?auto=format&fit=crop&q=80&w=400'
  });

  const tProp = (obj: any, key: string) => {
    if (language === 'zh' && obj[key + '_zh']) return obj[key + '_zh'];
    return obj[key];
  };

  const handleChefSubmit = async (e: any) => {
    e.preventDefault();
    try {
      await onAddChef(newChef);
      setShowChefForm(false);
      setMode('find');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSendPlan = (chef: any) => {
    setSelectedChef(chef);
    setShowRequestForm(true);
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="bg-surface-container p-1 rounded-full flex items-center justify-between mt-4">
        <button 
          onClick={() => setMode('find')}
          className={cn(
            "flex-1 py-3 px-4 rounded-full text-sm font-bold tracking-tight transition-all",
            mode === 'find' ? "bg-on-surface text-surface" : "text-on-surface-variant"
          )}
        >
          {language === 'zh' ? '找代厨' : 'Find Chef'}
        </button>
        <button 
          onClick={() => setMode('accept')}
          className={cn(
            "flex-1 py-3 px-4 rounded-full text-sm font-bold tracking-tight transition-all",
            mode === 'accept' ? "bg-on-surface text-surface" : "text-on-surface-variant"
          )}
        >
          {language === 'zh' ? '接单' : 'Accept Orders'}
        </button>
      </div>

      {mode === 'find' ? (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight">{mode === 'find' ? t.nearby : t.requests}</h2>
            <button className="text-primary text-xs font-bold uppercase tracking-widest">{language === 'zh' ? '筛选' : 'Filter'}</button>
          </div>

          <button 
            onClick={() => { setSelectedChef(null); setShowRequestForm(true); }}
            className="w-full bg-primary-container text-on-primary-container py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-sm"
          >
            <Plus size={20} />
            {language === 'zh' ? '发布个人需求 / 上传周计划' : 'Post Request / Upload Weekly Plan'}
          </button>

          <div className="space-y-6">
            {chefs.map((chef) => (
              <div key={chef.id} className="bg-surface-container-lowest border border-outline-variant/10 rounded-xl p-5 shadow-sm">
                <div className="flex gap-4">
                  <div className="relative">
                    <img 
                      src={chef.avatar} 
                      alt={chef.name} 
                      className="w-20 h-20 rounded-lg object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute -bottom-2 -right-2 bg-surface p-1 rounded-full shadow-sm">
                      <div className="bg-primary text-surface flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        <Star size={10} fill="currentColor" />
                        {chef.rating}
                      </div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-on-surface text-lg">{tProp(chef, 'name')}</h3>
                    <p className="text-xs text-on-surface-variant">{tProp(chef, 'distance')} {t.away} • {t.response}: {tProp(chef, 'responseTime')}</p>
                    <div className="mt-2">
                      <span className="inline-block bg-primary-container/20 text-primary text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest">
                        {tProp(chef, 'specialty')}
                      </span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => handleSendPlan(chef)}
                  className="w-full mt-5 py-3 border-2 border-on-surface text-on-surface rounded-full font-bold text-sm hover:bg-on-surface hover:text-surface transition-all uppercase tracking-widest"
                >
                  {language === 'zh' ? '发送周计划' : 'SEND WEEKLY PLAN'}
                </button>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight">{t.requests}</h2>
            <div className="flex items-center gap-2 bg-secondary-container px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span className="text-xs font-bold text-secondary uppercase tracking-widest">{t.online}</span>
            </div>
          </div>
          
          <div className="bg-surface-container-low rounded-xl p-8 text-center space-y-4">
            <ChefHat size={48} className="mx-auto text-on-surface/20" />
            <h3 className="font-bold text-lg">{language === 'zh' ? '成为代厨' : 'Become a Chef'}</h3>
            <p className="text-sm text-on-surface-variant">{language === 'zh' ? '开始接受邻居的订单并赚取积分。' : 'Start accepting orders from neighbors and earn points.'}</p>
            <button 
              onClick={() => setShowChefForm(true)}
              className="bg-on-surface text-surface px-8 py-3 rounded-full font-bold text-sm"
            >
              {language === 'zh' ? '立即注册' : 'Register Now'}
            </button>
          </div>

          <AnimatePresence>
            {showChefForm && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="fixed inset-0 z-[60] bg-surface p-6 flex flex-col"
              >
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold">{language === 'zh' ? '厨师注册' : 'Chef Registration'}</h2>
                  <button onClick={() => setShowChefForm(false)} className="text-on-surface/60">{language === 'zh' ? '取消' : 'Cancel'}</button>
                </div>
                <form onSubmit={handleChefSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-outline">{language === 'zh' ? '全名' : 'Full Name'}</label>
                    <input 
                      required
                      value={newChef.name}
                      onChange={e => setNewChef({...newChef, name: e.target.value})}
                      className="w-full bg-surface-container border-none rounded-xl p-4"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-outline">{language === 'zh' ? '擅长' : 'Specialty'}</label>
                    <select 
                      value={newChef.specialty}
                      onChange={e => setNewChef({...newChef, specialty: e.target.value})}
                      className="w-full bg-surface-container border-none rounded-xl p-4"
                    >
                      <option>{language === 'zh' ? '生酮专家' : 'KETO SPECIALIST'}</option>
                      <option>{language === 'zh' ? '植物基' : 'PLANT BASED'}</option>
                      <option>{language === 'zh' ? '家常菜' : 'HOME COOKING'}</option>
                      <option>{language === 'zh' ? '美食家' : 'GOURMET'}</option>
                    </select>
                  </div>
                  <button type="submit" className="w-full bg-primary text-surface py-4 rounded-full font-bold">
                    {language === 'zh' ? '开始接单' : 'Start Accepting Orders'}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {requests.map((req) => (
            <div key={req.id} className="bg-surface-container-low rounded-xl p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                <span className="text-primary font-black text-lg">${req.price.toFixed(2)}</span>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container">
                    <ChefHat size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-on-surface">{req.title}</h3>
                    <p className="text-xs text-on-surface-variant">{req.description}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {req.tags.map(tag => (
                    <span key={tag} className="bg-surface-container-highest text-[10px] font-bold px-3 py-1 rounded-full text-on-surface-variant uppercase tracking-tighter">
                      {tag}
                    </span>
                  ))}
                </div>
                <button 
                  onClick={() => onAcceptOrder(req.id).catch((e: any) => alert(e.message))}
                  className="w-full bg-on-surface text-surface py-3 rounded-full font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all"
                >
                  {language === 'zh' ? '查看详情' : 'VIEW DETAILS'}
                </button>
              </div>
            </div>
          ))}
        </section>
      )}

      <AnimatePresence>
        {showRequestForm && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed inset-0 z-[60] bg-surface p-6 flex flex-col overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">
                {selectedChef 
                  ? (language === 'zh' ? `发送给 ${selectedChef.name}` : `Send to ${selectedChef.name}`)
                  : (language === 'zh' ? '发布个人需求' : 'Post Request')}
              </h2>
              <button onClick={() => setShowRequestForm(false)} className="text-on-surface/60">
                {language === 'zh' ? '取消' : 'Cancel'}
              </button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const dietary = (form.elements.namedItem('dietary') as HTMLInputElement)?.value || '';
              const allergies = (form.elements.namedItem('allergies') as HTMLInputElement)?.value || '';
              const notes = (form.elements.namedItem('notes') as HTMLTextAreaElement)?.value || '';
              try {
                await onCreateOrder({
                  chefId: selectedChef?.id,
                  dietaryPreferences: dietary,
                  allergies,
                  notes,
                  description: notes,
                  type: selectedChef ? 'weekly_plan' : 'market_request',
                });
                setShowRequestForm(false);
              } catch (err: any) {
                alert(err.message);
              }
            }} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-outline">{language === 'zh' ? '饮食偏好' : 'Dietary Preferences'}</label>
                <input 
                  name="dietary"
                  required
                  placeholder={language === 'zh' ? '例如：低碳水、高蛋白...' : 'e.g., Low carb, high protein...'}
                  className="w-full bg-surface-container border-none rounded-xl p-4"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-outline">{language === 'zh' ? '过敏史 / 忌口' : 'Allergies / Avoid'}</label>
                <input 
                  name="allergies"
                  placeholder={language === 'zh' ? '例如：花生、海鲜...' : 'e.g., Peanuts, seafood...'}
                  className="w-full bg-surface-container border-none rounded-xl p-4"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-outline">{language === 'zh' ? '上传周计划 (图片/文档)' : 'Upload Weekly Plan'}</label>
                <div className="w-full bg-surface-container border-2 border-dashed border-outline-variant/30 rounded-xl p-8 flex flex-col items-center justify-center gap-2 text-outline-variant cursor-pointer hover:bg-surface-container-highest transition-colors">
                  <Plus size={32} />
                  <span className="text-sm font-bold">{language === 'zh' ? '点击上传' : 'Click to Upload'}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-outline">{language === 'zh' ? '备注' : 'Additional Notes'}</label>
                <textarea 
                  name="notes"
                  rows={3}
                  placeholder={language === 'zh' ? '其他需要代厨注意的事项...' : 'Any other notes for the chef...'}
                  className="w-full bg-surface-container border-none rounded-xl p-4"
                />
              </div>

              <button type="submit" className="w-full bg-primary text-surface py-4 rounded-full font-bold">
                {language === 'zh' ? '确认发送' : 'Confirm & Send'}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ProfileView = ({ 
  profile, 
  onUpdateProfile, 
  language,
  isAuthenticated,
  onLoginClick,
  onLogout,
  onMenuUploadClick
}: { 
  profile: any, 
  onUpdateProfile: (p: any) => void, 
  language: 'en' | 'zh',
  isAuthenticated: boolean,
  onLoginClick: () => void,
  onLogout: () => void,
  onMenuUploadClick: () => void
}) => {
  const t = TRANSLATIONS[language];
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(profile?.name || '');
  const [editAvatar, setEditAvatar] = useState(profile?.avatar || '');
  const [height, setHeight] = useState<number | ''>(profile?.height ?? '');
  const [weight, setWeight] = useState<number | ''>(profile?.weight ?? '');
  const [targetWeight, setTargetWeight] = useState<number | ''>(profile?.targetWeight ?? '');
  const [feedbackCategory, setFeedbackCategory] = useState(language === 'zh' ? '应用体验' : 'App Experience');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setEditName(profile.name || '');
    setEditAvatar(profile.avatar || '');
    setHeight(profile.height ?? '');
    setWeight(profile.weight ?? '');
    setTargetWeight(profile.targetWeight ?? '');
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdateProfile({
        name: editName,
        avatar: editAvatar,
        height: height === '' ? undefined : Number(height),
        weight: weight === '' ? undefined : Number(weight),
        targetWeight: targetWeight === '' ? undefined : Number(targetWeight),
      });
      setIsEditing(false);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const tProp = (obj: any, key: string) => {
    if (language === 'zh' && obj[key + '_zh']) return obj[key + '_zh'];
    return obj[key];
  };

  const chartData = [
    { day: language === 'zh' ? '一' : 'M', value: 40 },
    { day: language === 'zh' ? '二' : 'T', value: 60 },
    { day: language === 'zh' ? '三' : 'W', value: 90 },
    { day: language === 'zh' ? '四' : 'T', value: 75 },
    { day: language === 'zh' ? '五' : 'F', value: 50 },
    { day: language === 'zh' ? '六' : 'S', value: 30 },
    { day: language === 'zh' ? '日' : 'S', value: 65 },
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-8 text-center px-4">
        <div className="w-24 h-24 bg-surface-container rounded-full flex items-center justify-center text-outline">
          <User size={48} />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black tracking-tight">{language === 'zh' ? '开启您的健康之旅' : 'Start Your Journey'}</h2>
          <p className="text-on-surface-variant text-sm max-w-xs mx-auto">
            {language === 'zh' ? '登录以记录您的减脂进度，并与社区中的厨师和好友互动。' : 'Login to track your progress and interact with chefs and friends.'}
          </p>
        </div>
        <button 
          onClick={onLoginClick}
          className="bg-primary text-surface px-12 py-4 rounded-full font-bold text-lg shadow-lg shadow-primary/20 active:scale-95 transition-transform"
        >
          {language === 'zh' ? '立即登录' : 'Login Now'}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <section className="mt-4 flex flex-col items-center text-center relative">
        <button 
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className="absolute top-0 right-0 p-2 bg-surface-container rounded-full text-primary font-bold text-xs"
        >
          {isEditing ? (language === 'zh' ? '保存' : 'SAVE') : (language === 'zh' ? '编辑' : 'EDIT')}
        </button>
        <div className="relative mb-4">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-surface-container-highest shadow-xl">
            <img 
              src={profile.avatar} 
              alt={profile.name} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-primary text-surface px-4 py-1 rounded-full text-[10px] font-extrabold tracking-widest uppercase shadow-lg flex items-center gap-1">
            <Bolt size={12} fill="currentColor" />
            {profile.streak} {language === 'zh' ? '天连胜' : 'DAYS STREAK'}
          </div>
        </div>
        
        {isEditing ? (
          <div className="space-y-2 w-full max-w-[200px]">
            <input 
              value={editName}
              onChange={e => setEditName(e.target.value)}
              className="w-full bg-surface-container border-none rounded-lg px-3 py-1 text-center font-bold text-xl"
            />
            <input 
              value={editAvatar}
              onChange={e => setEditAvatar(e.target.value)}
              placeholder="Avatar URL"
              className="w-full bg-surface-container border-none rounded-lg px-3 py-1 text-center text-xs"
            />
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-black tracking-tight">{profile.name}</h2>
            <p className="text-on-surface-variant text-sm font-medium">{profile.phone || (language === 'zh' ? '未绑定手机' : 'No phone linked')}</p>
          </div>
        )}
      </section>

      <section className="grid grid-cols-3 gap-3">
        <div className="bg-surface-container-low p-4 rounded-xl">
          <span className="text-[10px] font-bold text-outline uppercase">{language === 'zh' ? '身高 cm' : 'Height'}</span>
          <input type="number" value={height} onChange={e => setHeight(e.target.value ? Number(e.target.value) : '')} className="w-full bg-transparent text-xl font-bold mt-1" />
        </div>
        <div className="bg-surface-container-low p-4 rounded-xl">
          <span className="text-[10px] font-bold text-outline uppercase">{language === 'zh' ? '体重 kg' : 'Weight'}</span>
          <input type="number" value={weight} onChange={e => setWeight(e.target.value ? Number(e.target.value) : '')} className="w-full bg-transparent text-xl font-bold mt-1" />
        </div>
        <div className="bg-surface-container-low p-4 rounded-xl">
          <span className="text-[10px] font-bold text-outline uppercase">{language === 'zh' ? '目标 kg' : 'Target'}</span>
          <input type="number" value={targetWeight} onChange={e => setTargetWeight(e.target.value ? Number(e.target.value) : '')} className="w-full bg-transparent text-xl font-bold mt-1" />
        </div>
      </section>
      <button 
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-secondary-container text-secondary py-3 rounded-full font-bold text-sm disabled:opacity-50"
      >
        {saving ? (language === 'zh' ? '保存中...' : 'Saving...') : (language === 'zh' ? '保存身体数据' : 'Save body stats')}
      </button>

      <section className="space-y-4">
        <h2 className="text-xs font-black uppercase tracking-widest text-outline">{language === 'zh' ? '订单状态' : 'Order Status'}</h2>
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {[t.pending, t.ongoing, t.completed].map((status, i) => (
            <button key={status} className={cn(
              "px-6 py-3 font-bold rounded-full text-sm whitespace-nowrap active:scale-95 transition-transform",
              i === 1 ? "bg-primary text-surface shadow-md" : "bg-secondary-container text-secondary"
            )}>
              {status}
            </button>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4">
        <div className="bg-surface-container-low p-6 rounded-xl relative overflow-hidden flex flex-col justify-between h-48 active:scale-95 transition-transform">
          <div className="z-10">
            <Menu size={32} className="text-secondary mb-2" />
            <h3 className="text-lg font-bold leading-tight">{t.recipeLibrary}</h3>
          </div>
          <p className="text-xs text-on-surface-variant font-medium z-10">42 {t.savedItems}</p>
          <div className="absolute -right-4 -bottom-4 opacity-10">
            <ChefHat size={120} />
          </div>
        </div>
        <div className="bg-on-surface p-6 rounded-xl flex flex-col justify-between h-48 active:scale-95 transition-transform text-surface">
          <div>
            <Wallet size={32} className="text-primary-container mb-2" />
            <h3 className="text-lg font-bold leading-tight">{language === 'zh' ? 'Kinetic 钱包' : 'Kinetic Wallet'}</h3>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-tighter opacity-70">{t.balance}</span>
            <span className="text-2xl font-black">${profile.wallet.toFixed(2)}</span>
          </div>
        </div>

        <button 
          onClick={onMenuUploadClick}
          className="col-span-2 bg-primary text-surface p-6 rounded-2xl flex items-center justify-between group active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Plus size={24} />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-lg leading-tight">{language === 'zh' ? '上传专属菜单' : 'Upload Menu'}</h3>
              <p className="text-xs opacity-80">{language === 'zh' ? '添加食材与重量' : 'Add ingredients & weights'}</p>
            </div>
          </div>
          <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center group-hover:translate-x-1 transition-transform">
            <Plus size={20} className="rotate-45" />
          </div>
        </button>

        <div className="col-span-2 bg-secondary-container/50 p-6 rounded-xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <TrendingUp size={20} className="text-secondary" />
              {t.healthTrends}
            </h3>
            <span className="text-xs font-bold text-secondary uppercase tracking-widest">{language === 'zh' ? '本周' : 'This Week'}</span>
          </div>
          <div className="h-32 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <Bar dataKey="value" radius={[20, 20, 20, 20]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 3 ? '#ae3c4c' : '#d6f8ee'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between mt-2 px-2">
            {chartData.map((d, i) => (
              <span key={`${d.day}-${i}`} className="text-[10px] font-bold text-secondary">{d.day}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface-container rounded-xl p-8 space-y-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-black tracking-tight text-on-surface leading-tight">{language === 'zh' ? '帮助我们改进' : 'Help Us Improve'}</h2>
          <p className="text-on-surface-variant text-sm">{language === 'zh' ? '我们重视您的意见。分享您的想法。' : 'We value your editorial eye. Share your thoughts.'}</p>
        </div>
        <form className="space-y-4" onSubmit={async (e) => {
          e.preventDefault();
          if (!feedbackMessage.trim()) return;
          try {
            await submitFeedback(feedbackCategory, feedbackMessage.trim());
            setFeedbackMessage('');
            alert(language === 'zh' ? '反馈已提交，感谢！' : 'Feedback submitted, thank you!');
          } catch (err: any) {
            alert(err.message);
          }
        }}>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-outline-variant px-1">{language === 'zh' ? '类别' : 'Category'}</label>
            <select 
              value={feedbackCategory}
              onChange={e => setFeedbackCategory(e.target.value)}
              className="w-full bg-surface border-none rounded-lg p-4 text-on-surface font-medium focus:ring-2 focus:ring-secondary/20 appearance-none"
            >
              <option>{language === 'zh' ? '应用体验' : 'App Experience'}</option>
              <option>{language === 'zh' ? '新功能建议' : 'New Feature Suggestion'}</option>
              <option>{language === 'zh' ? '错误报告' : 'Bug Report'}</option>
              <option>{language === 'zh' ? '社区问题' : 'Community Issues'}</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-outline-variant px-1">{language === 'zh' ? '消息' : 'Message'}</label>
            <textarea 
              value={feedbackMessage}
              onChange={e => setFeedbackMessage(e.target.value)}
              className="w-full bg-surface border-none rounded-lg p-4 text-on-surface placeholder-outline focus:ring-2 focus:ring-secondary/20" 
              placeholder={language === 'zh' ? '你在想什么？' : "What's on your mind?"} 
              rows={4}
            />
          </div>
          <button type="submit" className="w-full bg-primary text-surface py-4 rounded-full font-bold text-base shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform">
            {language === 'zh' ? '提交反馈' : 'Submit Feedback'}
          </button>
        </form>
      </section>

      <button 
        onClick={onLogout}
        className="w-full py-4 text-outline font-bold text-sm hover:text-on-surface transition-colors"
      >
        {language === 'zh' ? '退出登录' : 'Logout'}
      </button>
    </div>
  );
};

const LoginModal = ({ onClose, onLogin, language }: { onClose: () => void, onLogin: (user: any) => void, language: 'en' | 'zh' }) => {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [loading, setLoading] = useState(false);
  const [devCodeHint, setDevCodeHint] = useState('');

  const handleSendCode = async () => {
    if (phone.length < 10) return;
    setLoading(true);
    try {
      const res = await sendCode(phone);
      if (res.devCode) setDevCodeHint(res.devCode);
      setStep('code');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (code.length < 6) return;
    setLoading(true);
    try {
      const { token, user } = await loginByCode(phone, code);
      setToken(token);
      onLogin(mapApiUser(user));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-on-surface/60 backdrop-blur-md"
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-sm bg-surface rounded-[2.5rem] p-8 space-y-8 shadow-2xl"
      >
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Phone size={32} />
          </div>
          <h2 className="text-2xl font-black tracking-tight">{language === 'zh' ? '手机号登录' : 'Phone Login'}</h2>
          <p className="text-on-surface-variant text-sm">
            {step === 'phone' 
              ? (language === 'zh' ? '请输入您的手机号码以开始' : 'Enter your phone number to start')
              : (language === 'zh' ? `验证码已发送至 ${phone}${devCodeHint ? `（开发码: ${devCodeHint}）` : ''}` : `Code sent to ${phone}${devCodeHint ? ` (dev: ${devCodeHint})` : ''}`)}
          </p>
        </div>

        <div className="space-y-4">
          {step === 'phone' ? (
            <div className="space-y-4">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-on-surface-variant">+86</span>
                <input 
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder={language === 'zh' ? '手机号码' : 'Phone number'}
                  className="w-full bg-surface-container border-none rounded-2xl py-4 pl-16 pr-6 text-on-surface font-bold focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <button 
                onClick={handleSendCode}
                disabled={phone.length < 10 || loading}
                className="w-full bg-primary text-surface py-4 rounded-full font-bold text-lg shadow-lg shadow-primary/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale"
              >
                {loading ? (language === 'zh' ? '发送中...' : 'Sending...') : (language === 'zh' ? '获取验证码' : 'Get Code')}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <input 
                type="text"
                maxLength={6}
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="000000"
                className="w-full bg-surface-container border-none rounded-2xl py-4 px-6 text-center text-2xl font-black tracking-[0.5em] text-on-surface focus:ring-2 focus:ring-primary/20"
              />
              <button 
                onClick={handleVerify}
                disabled={code.length < 6 || loading}
                className="w-full bg-primary text-surface py-4 rounded-full font-bold text-lg shadow-lg shadow-primary/20 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {loading ? (language === 'zh' ? '验证中...' : 'Verifying...') : (language === 'zh' ? '立即验证' : 'Verify Now')}
              </button>
              <button 
                onClick={() => setStep('phone')}
                className="w-full py-2 text-xs font-bold text-outline hover:text-on-surface transition-colors"
              >
                {language === 'zh' ? '修改手机号' : 'Change Phone Number'}
              </button>
            </div>
          )}
        </div>

        <p className="text-[10px] text-center text-outline-variant leading-relaxed">
          {language === 'zh' 
            ? '登录即代表您同意我们的服务条款和隐私政策' 
            : 'By logging in, you agree to our Terms of Service and Privacy Policy'}
        </p>
      </motion.div>
    </div>
  );
};

const MenuUploadModal = ({ onClose, onAdd, language }: { onClose: () => void, onAdd: (menu: any) => void, language: 'en' | 'zh' }) => {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [kcal, setKcal] = useState(400);
  const [protein, setProtein] = useState(20);
  const [image, setImage] = useState('');
  const [ingredients, setIngredients] = useState([{ name: '', weight: '' }]);

  const addIngredient = () => {
    setIngredients([...ingredients, { name: '', weight: '' }]);
  };

  const updateIngredient = (index: number, field: 'name' | 'weight', value: string) => {
    const next = [...ingredients];
    next[index][field] = value;
    setIngredients(next);
  };

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const recipe = await createRecipeManual({
        title,
        title_zh: title,
        description: desc,
        description_zh: desc,
        kcal,
        protein,
        image: image || undefined,
        ingredientsList: ingredients.filter(i => i.name && i.weight).map(i => ({ name: i.name, name_zh: i.name, weight: i.weight })),
      });
      onAdd(recipe);
      onClose();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-on-surface/80 backdrop-blur-xl"
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 50 }}
        className="relative w-full max-w-lg bg-surface rounded-[3rem] p-10 space-y-8 shadow-2xl overflow-y-auto max-h-[90vh] no-scrollbar"
      >
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h2 className="text-3xl font-black tracking-tight">{language === 'zh' ? '上传专属菜谱' : 'Upload Menu'}</h2>
            <p className="text-on-surface-variant text-sm">{language === 'zh' ? '分享您的健康饮食配方' : 'Share your healthy fuel recipe'}</p>
          </div>
          <button onClick={onClose} className="p-3 bg-surface-container rounded-full hover:bg-surface-container-highest transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-4">
             <div className="group relative aspect-video bg-surface-container rounded-3xl border-2 border-dashed border-outline-variant/30 flex flex-col items-center justify-center gap-4 text-outline transition-all overflow-hidden">
              {image ? (
                <img src={image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Camera size={48} className="opacity-40" />
                  <span className="text-sm font-bold uppercase tracking-widest opacity-60">{language === 'zh' ? '上传菜品美照' : 'Add Dish Photo'}</span>
                </div>
              )}
              <input 
                type="url" 
                value={image}
                onChange={e => setImage(e.target.value)}
                placeholder={language === 'zh' ? '输入图片 URL...' : 'Enter Image URL...'} 
                className="absolute inset-x-4 bottom-4 bg-surface/90 backdrop-blur-md border-none rounded-xl py-2 px-4 text-xs font-medium focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-outline-variant px-1">{language === 'zh' ? '菜品名称' : 'Dish Name'}</label>
                <input 
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder={language === 'zh' ? '例如：牛油果能量碗' : 'e.g., Avocado Power Bowl'}
                  className="w-full bg-surface-container border-none rounded-2xl py-4 px-6 text-on-surface font-bold focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-outline-variant px-1">{language === 'zh' ? '千卡 (Kcal)' : 'Calories'}</label>
                  <input 
                    type="number"
                    value={kcal}
                    onChange={e => setKcal(parseInt(e.target.value))}
                    className="w-full bg-surface-container border-none rounded-2xl py-4 px-6 text-on-surface font-black focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-outline-variant px-1">{language === 'zh' ? '蛋白质 (g)' : 'Protein'}</label>
                  <input 
                    type="number"
                    value={protein}
                    onChange={e => setProtein(parseInt(e.target.value))}
                    className="w-full bg-surface-container border-none rounded-2xl py-4 px-6 text-on-surface font-black focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-outline-variant">{language === 'zh' ? '食材与克重' : 'Ingredients & Weight'}</label>
                  <button 
                    type="button"
                    onClick={addIngredient}
                    className="text-xs font-black text-primary hover:opacity-80 flex items-center gap-1"
                  >
                    <Plus size={16} />
                    {language === 'zh' ? '添加' : 'ADD'}
                  </button>
                </div>
                <div className="space-y-2">
                  {ingredients.map((ing, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input 
                        placeholder={language === 'zh' ? '食材名字' : 'Ingredient'}
                        value={ing.name}
                        onChange={e => updateIngredient(idx, 'name', e.target.value)}
                        className="flex-1 bg-surface-container border-none rounded-xl py-3 px-4 text-sm font-bold"
                      />
                      <input 
                        placeholder={language === 'zh' ? '重量 (如 100g)' : 'Weight'}
                        value={ing.weight}
                        onChange={e => updateIngredient(idx, 'weight', e.target.value)}
                        className="w-24 bg-surface-container border-none rounded-xl py-3 px-4 text-sm font-black text-primary"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-on-surface text-surface py-5 rounded-full font-black text-lg shadow-2xl active:scale-[0.98] transition-all hover:opacity-90"
          >
            {language === 'zh' ? '发布菜谱' : 'Post Recipe'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const NotificationPanel = ({ isOpen, onClose, language }: { isOpen: boolean, onClose: () => void, language: 'en' | 'zh' }) => {
  const notifications = [
    { id: 1, title: language === 'zh' ? '新点赞' : 'New Like', desc: language === 'zh' ? '有人赞了你的菜谱！' : 'Someone liked your recipe!', time: '2m ago' },
    { id: 2, title: language === 'zh' ? '代厨消息' : 'Chef Message', desc: language === 'zh' ? '你的代厨订单已接单。' : 'Your chef order has been accepted.', time: '15m ago' },
    { id: 3, title: language === 'zh' ? '积分奖励' : 'Points Reward', desc: language === 'zh' ? '恭喜！你获得了50积分。' : 'Congrats! You earned 50 points.', time: '1h ago' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[110] bg-on-surface/20 backdrop-blur-[2px]"
          />
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 right-6 w-80 bg-surface rounded-3xl shadow-2xl z-[120] p-6 border border-outline-variant/10"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black tracking-tight">{language === 'zh' ? '通知' : 'Notifications'}</h3>
              <button onClick={onClose} className="p-1 hover:bg-surface-container rounded-full"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              {notifications.map(n => (
                <div key={n.id} className="flex gap-4 p-3 hover:bg-surface-container-low rounded-2xl transition-colors cursor-pointer group">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:scale-110 transition-transform">
                    <Bell size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="text-sm font-bold truncate">{n.title}</h4>
                      <span className="text-[10px] font-bold text-outline shrink-0">{n.time}</span>
                    </div>
                    <p className="text-xs text-on-surface-variant line-clamp-2">{n.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-3 text-xs font-bold text-primary uppercase tracking-widest hover:bg-primary/5 rounded-xl transition-colors">
              {language === 'zh' ? '查看全部' : 'View All'}
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('spin');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [language, setLanguage] = useState<'en' | 'zh'>('zh');
  const [user, setUser] = useState<any>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showMenuUpload, setShowMenuUpload] = useState(false);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [chefs, setChefs] = useState<any[]>([]);
  const [marketRequests, setMarketRequests] = useState<any[]>([]);
  const [recipesLoading, setRecipesLoading] = useState(true);

  const loadRecipes = useCallback(async () => {
    setRecipesLoading(true);
    try {
      const data = await fetchCommunityRecipes(1, 50);
      setRecipes(data.recipes);
    } catch (e) {
      console.error(e);
    } finally {
      setRecipesLoading(false);
    }
  }, []);

  const loadChefs = useCallback(async () => {
    try {
      const data = await fetchChefs();
      setChefs(data.map(mapApiChef));
    } catch (e) {
      console.error(e);
    }
  }, []);

  const loadMarketRequests = useCallback(async () => {
    try {
      const data = await fetchMarketOrders();
      setMarketRequests(data.map(mapApiOrder));
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    loadRecipes();
    loadChefs();
    loadMarketRequests();
  }, [loadRecipes, loadChefs, loadMarketRequests]);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    fetchProfile()
      .then((u) => setUser(mapApiUser(u)))
      .catch(() => setToken(null));
  }, []);

  const handleLogin = (userData: any) => {
    setUser(userData);
    setShowLogin(false);
    loadRecipes();
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
  };

  const addRecipe = (recipe: any) => {
    setRecipes((prev) => [recipe, ...prev]);
  };

  const handleLikeRecipe = async (id: string) => {
    const updated = await toggleLike(id);
    setRecipes((prev) => prev.map((r) => (r.id === id ? updated : r)));
    return updated;
  };

  const handleCommentRecipe = async (id: string, text: string) => {
    const updated = await addComment(id, text);
    setRecipes((prev) => prev.map((r) => (r.id === id ? updated : r)));
    return updated;
  };

  const handleCreateOrder = async (data: any) => {
    await createOrder(data);
    await loadMarketRequests();
  };

  const handleAcceptOrder = async (id: string) => {
    await acceptOrder(id);
    await loadMarketRequests();
  };

  const handleAddChef = async (chefData: any) => {
    try {
      const chef = await registerChef({ name: chefData.name, specialty: chefData.specialty });
      setChefs((prev) => [mapApiChef(chef), ...prev]);
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="min-h-screen bg-surface max-w-md mx-auto relative">
      <TopBar 
        onMenuClick={() => setIsMenuOpen(true)} 
        onNotificationClick={() => setIsNotificationOpen(true)}
      />
      
      <Sidebar 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        language={language}
        onLanguageChange={setLanguage}
      />

      <NotificationPanel 
        isOpen={isNotificationOpen} 
        onClose={() => setIsNotificationOpen(false)} 
        language={language} 
      />

      <main className="px-6 pb-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'spin' && (
              <SpinView 
                language={language} 
                initialWeight={user?.weight} 
                onWeightChange={user ? async (w) => {
                  try {
                    const updated = await updateBody({ weight: w });
                    setUser(mapApiUser(updated));
                  } catch (e) {
                    console.error(e);
                  }
                } : undefined}
              />
            )}
            {activeTab === 'community' && (
              <CommunityView 
                recipes={recipes}
                loading={recipesLoading}
                onAddRecipe={addRecipe} 
                onLikeRecipe={handleLikeRecipe}
                onCommentRecipe={handleCommentRecipe}
                language={language} 
                isAuthenticated={!!user}
                onLoginClick={() => setShowLogin(true)}
              />
            )}
            {activeTab === 'market' && (
              <MarketView 
                chefs={chefs} 
                requests={marketRequests}
                onAddChef={handleAddChef} 
                onCreateOrder={handleCreateOrder}
                onAcceptOrder={handleAcceptOrder}
                language={language} 
              />
            )}
            {activeTab === 'profile' && (
              <ProfileView 
                profile={user} 
                onUpdateProfile={async (p: any) => {
                  if (!user) return;
                  if (p.name !== undefined || p.avatar !== undefined) {
                    const updated = await updateProfile({ name: p.name, avatar: p.avatar });
                    setUser(mapApiUser(updated));
                  }
                  if (p.height !== undefined || p.weight !== undefined || p.targetWeight !== undefined) {
                    const updated = await updateBody({
                      height: p.height,
                      weight: p.weight,
                      targetWeight: p.targetWeight,
                    });
                    setUser(mapApiUser(updated));
                  }
                }} 
                language={language} 
                isAuthenticated={!!user}
                onLoginClick={() => setShowLogin(true)}
                onLogout={handleLogout}
                onMenuUploadClick={() => setShowMenuUpload(true)}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} language={language} />

      <AnimatePresence>
        {showLogin && (
          <LoginModal 
            onClose={() => setShowLogin(false)} 
            onLogin={handleLogin}
            language={language}
          />
        )}
        {showMenuUpload && user && (
          <MenuUploadModal 
            onClose={() => setShowMenuUpload(false)}
            onAdd={addRecipe}
            language={language}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
