const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '../src/App.tsx');
let s = fs.readFileSync(file, 'utf8');
const start = s.indexOf('              <motion.article \n                onClick={async () => {');
const end = s.indexOf('              <section className="space-y-4">\n                <h3 className="text-xs font-black uppercase tracking-widest text-primary">{language === \'zh\' ? \'食材\'', start);
if (start === -1 || end === -1) {
  console.error('markers not found', start, end);
  process.exit(1);
}
const fixed = `              <motion.article 
                onClick={async () => {
                  if (!isAuthenticated) { onLoginClick(); return; }
                  try {
                    const updated = await onLikeRecipe(selectedRecipe.id);
                    setSelectedRecipe(updated);
                  } catch (err: any) { alert(err.message); }
                }}
                className="flex-1 bg-surface-container-highest py-4 rounded-2xl flex flex-col items-center gap-1 active:scale-95 transition-transform cursor-pointer"
              >
                <Heart size={20} className="text-primary" fill={selectedRecipe.isLiked ? "currentColor" : "none"} />
                <span className="text-[10px] font-bold uppercase">{selectedRecipe.likes} {language === 'zh' ? '点赞' : 'Likes'}</span>
              </motion.article>
`;
// wrong - need full flex gap-4 div with buttons

const reallyFixed = `              <div className="flex gap-4">
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
              </motion.article>

`;

// still wrong closing tag. Final:
const block = `              <div className="flex gap-4">
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

`;

s = s.slice(0, start) + block + s.slice(end);
fs.writeFileSync(file, s);

// fix comment input
s = fs.readFileSync(file, 'utf8');
s = s.replace(
  `<input \n                      placeholder={language === 'zh' ? '添加评论...' : "Add a comment..."} \n                      className="flex-1 bg-surface-container border-none rounded-full px-4 text-xs focus:ring-1 focus:ring-primary"\n                    />`,
  `<input \n                      value={commentText}\n                      onChange={(e) => setCommentText(e.target.value)}\n                      onKeyDown={(e) => e.key === 'Enter' && handleCommentSubmit()}\n                      placeholder={language === 'zh' ? '添加评论...' : "Add a comment..."} \n                      className="flex-1 bg-surface-container border-none rounded-full px-4 text-xs focus:ring-1 focus:ring-primary"\n                      disabled={actionLoading}\n                    />`
);
fs.writeFileSync(file, s);
console.log('Fixed detail actions');
