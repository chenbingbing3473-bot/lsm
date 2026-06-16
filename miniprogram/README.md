# Lean SpinMeal 微信小程序

与 Web 版 **UI 配色、布局、功能** 一致的微信小程序，对接同一套 Node 后端 API。

## 功能

| Tab | 功能 |
|-----|------|
| 摇号 | 旋饭老虎机、体重/饮食/预算、结果卡片 |
| 社区 | 瀑布流菜谱、点赞、详情、发帖 |
| 代厨 | 找厨师、接单、注册厨师 |
| 我的 | 登录、身体数据、反馈、中英文切换 |

## 本地开发

1. 安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 导入项目：选择仓库根目录 `Lean-SpinMeal-APP-main`（或 `miniprogram` 目录）
3. 修改 `miniprogram/config.js` 中的 API 地址：

```js
module.exports = {
  apiBase: 'http://121.40.115.81/api',
  apiHost: 'http://121.40.115.81',
};
```

4. 开发者工具 → **详情** → **本地设置** → 勾选：
   - 不校验合法域名、web-view、TLS 版本
5. 确保阿里云后端已启动，点击 **编译**

## 正式发布（上线微信小程序）

1. 注册 [微信公众平台](https://mp.weixin.qq.com/) 小程序，获取 **AppID**
2. 把 `project.config.json` 里的 `appid` 改成你的 AppID
3. 后端必须 **HTTPS**（微信要求），例如 `https://api.yourdomain.com`
4. 微信公众平台 → 开发 → 开发管理 → 服务器域名：
   - request 合法域名：`https://api.yourdomain.com`
   - uploadFile 合法域名：同上
   - downloadFile 合法域名：同上
5. 开发者工具 → 上传 → 提交审核 → 发布

## 目录结构

```
miniprogram/
├── app.js / app.json / app.wxss   # 全局配置 + 设计系统
├── config.js                      # API 地址
├── custom-tab-bar/                # 底部导航（与 Web Tab 一致）
├── utils/api.js                   # 与 src/lib/api.ts 对齐
└── pages/
    ├── spin/          # 摇号
    ├── community/     # 社区
    ├── market/        # 代厨
    ├── profile/       # 我的
    ├── login/         # 登录
    ├── recipe-detail/ # 菜谱详情
    └── post/          # 发帖
```

## 设计系统（与 Web 一致）

- 背景 `#fefdf1`、主色 `#ae3c4c`、文字 `#353a26`
- 圆角卡片、KINETIC 标题、摇号老虎机、社区积分卡片

## 演示账号

`13800138000` + 验证码（开发模式验证码见后端日志或登录页提示）
