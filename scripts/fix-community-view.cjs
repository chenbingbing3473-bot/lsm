const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../src/App.tsx');
let s = fs.readFileSync(file, 'utf8');
const startIdx = s.indexOf('      <div className="columns-2 gap-4 space-y-4">');
const end = s.indexOf('      <AnimatePresence>', startIdx);

if (startIdx === -1 || end === -1) {
  console.error('Could not find markers', { startIdx, end });
  process.exit(1);
}

const finalFixed = `      {loading ? (
        <p className="text-center text-on-surface-variant py-8">{language === 'zh' ? '加载中...' : 'Loading...'}</p>
      ) : recipes.length === 0 ? (
        <p className="text-center text-on-surface-variant py-8">{language === 'zh' ? '暂无菜谱，快来发布第一条吧' : 'No recipes yet'}</p>
      ) : (
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

`;

// WRONG AGAIN - missing div wrapper and map. Final correct version:
const correct = `      {loading ? (
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
            </motion.article>
          </motion.article>
        ))}
      </div>
      )}

`;

// Actually correct without duplicate tags:
const reallyCorrect = `      {loading ? (
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

`;

s = s.slice(0, startIdx) + reallyCorrect + s.slice(end);
fs.writeFileSync(file, s);
console.log('Fixed CommunityView list section');
