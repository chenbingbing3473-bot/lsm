# Lean-SpinMeal API（Node.js + Express + MongoDB）

与前端 `src/lib/api.ts` **一一对应** 的后端服务。

## 快速启动

```bash
cd server
cp .env.example .env    # 编辑配置
npm install
npm run dev             # http://localhost:3001
```

前端 `.env.local`：

```
VITE_API_BASE_URL=http://localhost:3001/api
```

本地无 MongoDB 时，设置 `USE_MEMORY_DB=true`（默认已开启），自动使用内存数据库。

---

## 统一响应格式

```json
{
  "success": true,
  "message": "success",
  "data": { ... }
}
```

错误时 `success: false`，HTTP 状态码 4xx/5xx。

认证：Header `Authorization: Bearer <token>`

---

## API 对照表（与 api.ts 完全匹配）

| 前端函数 | 方法 | 路径 | 认证 |
|---------|------|------|------|
| `sendCode` | POST | `/api/auth/send-code` | 否 |
| `loginByCode` | POST | `/api/auth/login-by-code` | 否 |
| `login` | POST | `/api/auth/login` | 否 |
| `fetchProfile` | GET | `/api/users/profile` | 是 |
| `updateProfile` | PUT | `/api/users/profile` | 是 |
| `updateBody` | PUT | `/api/users/body` | 是 |
| `fetchWeightRecords` | GET | `/api/users/weight-records` | 是 |
| `fetchCommunityRecipes` | GET | `/api/community/recipes` | 可选 |
| `submitFeedback` | POST | `/api/community/feedback` | 可选 |
| `postRecipe` | POST | `/api/recipes/post` | 是 |
| `uploadRecipe` | POST | `/api/recipes` | 是 |
| `createRecipeManual` | POST | `/api/recipes/manual` | 是 |
| `toggleLike` | POST | `/api/recipes/:id/like` | 是 |
| `addComment` | POST | `/api/recipes/:id/comments` | 是 |
| `fetchSpin` | GET | `/api/spin?diet=vegan` | 否 |
| `fetchChefs` | GET | `/api/chefs` | 否 |
| `registerChef` | POST | `/api/chefs/register` | 是 |
| `createOrder` | POST | `/api/orders` | 是 |
| `fetchMyOrders` | GET | `/api/orders/mine` | 是 |
| `fetchMarketOrders` | GET | `/api/orders/market` | 否 |
| `acceptOrder` | POST | `/api/orders/:id/accept` | 是 |

---

## 核心接口说明

### 登录

```http
POST /api/auth/send-code
{ "phone": "13800138000" }
→ { expiresIn, devCode }   # 开发模式 devCode 可直接使用
```

```http
POST /api/auth/login-by-code
{ "phone": "13800138000", "code": "123456" }
→ { token, user: ApiUser }
```

### 社区发帖（推荐，不依赖 AI）

```http
POST /api/recipes/post
Authorization: Bearer <token>
Content-Type: multipart/form-data

title=牛油果碗
description=清爽健康
kcal=400
protein=20
image=<file>   # 可选
→ Recipe
```

### 社区列表

```http
GET /api/community/recipes?page=1&limit=20
→ { recipes: Recipe[], pagination: { page, total, hasMore } }
```

### 摇一摇

```http
GET /api/spin
GET /api/spin?diet=vegan
→ { slots, slotIndices, combined, combo: Recipe }
```

### Recipe 字段（与 constants.ts 一致）

```typescript
{
  id, title, title_zh, description, description_zh,
  image, kcal, protein, carbs, fat,
  isVegan, isLiked, likes,
  taste, taste_zh,
  ingredients: { carbs, protein, veg, fat, cook },  // emoji
  ingredientsList, instructions, instructions_zh,
  author, author_zh, comments, createdAt
}
```

---

## 目录结构

```
server/
├── src/
│   ├── index.js           # 入口
│   ├── config/            # env + db
│   ├── models/            # User, Recipe, Chef, Order...
│   ├── routes/            # 与 api.ts 模块对应
│   ├── middleware/        # auth, upload
│   ├── services/          # sms, qwenVL
│   ├── utils/             # response, jwt, recipeMapper
│   └── scripts/seed.js    # 种子数据
├── uploads/               # 图片上传
├── .env
└── package.json
```

---

## 环境变量

| 变量 | 说明 |
|------|------|
| `PORT` | 默认 3001 |
| `MONGODB_URI` | MongoDB 连接串 |
| `USE_MEMORY_DB` | `true` 时用内存库（开发） |
| `JWT_SECRET` | JWT 密钥 |
| `DASHSCOPE_API_KEY` | 通义千问 VL（可选） |
| `CORS_ORIGIN` | 前端地址，逗号分隔 |
| `PUBLIC_BASE_URL` | 上传图片对外 URL |
| `SMS_DEV_MODE` | 开发模式打印验证码 |

---

## 演示数据

```bash
npm run seed
```

演示账号：`13800138000` / 密码 `123456`（验证码登录见控制台 `[SMS Dev]`）
