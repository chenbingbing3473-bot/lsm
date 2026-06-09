const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '../src/App.tsx');
let s = fs.readFileSync(file, 'utf8');

// 1. Fix CreatePostModal image block
s = s.replace(
  `          <motion.article 
            className="aspect-video bg-surface-container rounded-3xl border-2 border-dashed border-outline-variant flex flex-col items-center justify-center gap-2 text-outline cursor-pointer hover:bg-surface-container-highest transition-colors relative overflow-hidden"
            onClick={() => {
              // Mock image upload
              setImage('https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800');
            }}
          >
            {image ? (
              <img src={image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <>
                <Camera size={32} />
                <span className="text-xs font-bold uppercase tracking-widest">{language === 'zh' ? '点击上传照片' : 'Click to upload photo'}</span>
              </>
            )}
          </motion.article>`,
  `          <label className="aspect-video bg-surface-container rounded-3xl border-2 border-dashed border-outline-variant flex flex-col items-center justify-center gap-2 text-outline cursor-pointer hover:bg-surface-container-highest transition-colors relative overflow-hidden">
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
          </label>`
);

// fallback if still div version
s = s.replace(
  `          <div 
            className="aspect-video bg-surface-container rounded-3xl border-2 border-dashed border-outline-variant flex flex-col items-center justify-center gap-2 text-outline cursor-pointer hover:bg-surface-container-highest transition-colors relative overflow-hidden"
            onClick={() => {
              // Mock image upload
              setImage('https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800');
            }}
          >
            {image ? (
              <img src={image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <>
                <Camera size={32} />
                <span className="text-xs font-bold uppercase tracking-widest">{language === 'zh' ? '点击上传照片' : 'Click to upload photo'}</span>
              </>
            )}
          </motion.article>`,
  `          <label className="aspect-video bg-surface-container rounded-3xl border-2 border-dashed border-outline-variant flex flex-col items-center justify-center gap-2 text-outline cursor-pointer hover:bg-surface-container-highest transition-colors relative overflow-hidden">
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
          </label>`
);

s = s.replace(
  `          <div 
            className="aspect-video bg-surface-container rounded-3xl border-2 border-dashed border-outline-variant flex flex-col items-center justify-center gap-2 text-outline cursor-pointer hover:bg-surface-container-highest transition-colors relative overflow-hidden"
            onClick={() => {
              // Mock image upload
              setImage('https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800');
            }}
          >
            {image ? (
              <img src={image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <>
                <Camera size={32} />
                <span className="text-xs font-bold uppercase tracking-widest">{language === 'zh' ? '点击上传照片' : 'Click to upload photo'}</span>
              </>
            )}
          </div>`,
  `          <label className="aspect-video bg-surface-container rounded-3xl border-2 border-dashed border-outline-variant flex flex-col items-center justify-center gap-2 text-outline cursor-pointer hover:bg-surface-container-highest transition-colors relative overflow-hidden">
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
          </label>`
);

// 2. MenuUploadModal submit
s = s.replace(
  `  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onAdd({
      id: Date.now().toString(),
      title,
      description: desc,
      kcal,
      protein,
      image: image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800',
      ingredientsList: ingredients.filter(i => i.name && i.weight),
      author: language === 'zh' ? '您' : 'You',
      likes: 0,
      comments: []
    });
    onClose();
  };`,
  `  const [submitting, setSubmitting] = useState(false);

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
  };`
);

// 3. Replace Main App
const mainStart = s.indexOf('export default function App() {');
const mainEnd = s.lastIndexOf('}');
if (mainStart === -1) {
  console.error('Main App not found');
  process.exit(1);
}

const newMain = `export default function App() {
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
            {activeTab === 'spin' && <SpinView language={language} initialWeight={user?.weight} />}
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
                  if (user) {
                    const updated = await updateBody({ height: p.height, weight: p.weight, targetWeight: p.targetWeight });
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
`;

s = s.slice(0, mainStart) + newMain;

// Add isLiked to Recipe in constants if needed - skip, optional field

fs.writeFileSync(file, s);
console.log('Final patch applied');
