# 部署到 Cloudflare Pages

## 当前状态：只上前端

后端**还没接**。聊天由 `src/lib/berry.js` 的本地关键词库模拟（`MOCK_UNTIL_BACKEND = true`），
线上跑起来是能聊的，只是回复是写死的。

`functions/api/chat.js` 仍然留在仓库里 —— 它会被 Cloudflare 自动当成 Functions 部署，
但没有 `LLM_API_KEY`，请求会返回 500，前端据此退回本地模拟。等你配好 key，
把这个开关改成 `false` 就真接上了，不用再动部署。

## 环境变量（接后端时才需要）

先把 `src/lib/berry.js` 里的 `MOCK_UNTIL_BACKEND` 改成 `false`，再配下面三个变量。
**密钥只填在 Cloudflare 面板 / 本地 `.dev.vars`，不要写进任何会被提交的文件。**

| 变量 | 必填 | 说明 |
| --- | --- | --- |
| `LLM_API_KEY` | ✅ | 火山方舟的 API Key |
| `LLM_MODEL` | ✅ | 模型名或推理接入点 ID（如 `doubao-1-5-pro-32k-250115`、`ep-2024xxxxxx`） |
| `LLM_BASE_URL` | — | 不填就用火山方舟默认端点。换供应商时填这里 |

## 本地跑

```powershell
npm run dev
```

只跑 Vite。没有 Cloudflare Functions，所以聊天会自动回退到 `src/lib/berry.js`
里的本地模拟回复（关键词命中），页面上一切照常，只是回复是写死的。

要连真模型，用 wrangler 起本地全栈：

```powershell
npm i -D wrangler          # 一次性

# 新建 .dev.vars（已被 .gitignore 忽略），内容：
#   LLM_API_KEY=你的key
#   LLM_MODEL=你的模型

npm run build
npx wrangler pages dev dist
```

## 首次部署（Git 集成）

1. 在 GitHub 新建一个**空仓库**（不要勾选 README / .gitignore）。
2. 本地关联并推送：
   ```powershell
   git remote add origin https://github.com/<你的用户名>/<仓库名>.git
   git push -u origin main
   ```
3. Cloudflare 面板 → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**，
   选刚才那个仓库。
4. 构建设置：
   - Build command：`npm run build`
   - Build output directory：`dist`
5. 首次部署完成后，进 **Settings → Environment variables**，加 `LLM_API_KEY`、
   `LLM_MODEL`（可选 `LLM_BASE_URL`）。**加完要重新部署一次**，变量才会生效。
6. 之后每次 `git push` 都会自动重新部署。

## 另一条路：直接上传（不用 git）

想跳过 GitHub 的话，构建产物可以直接推上去：

```powershell
npm run build
npx wrangler login                # 首次会开浏览器让你授权
npx wrangler pages deploy dist --project-name=berry
```

代价是没有 Git 集成的自动部署 —— 以后每次改完都得手动 build + deploy。
真要长期维护，还是走上面的 Git 集成。

## 部署后自查

- 打开首页 → 点「开始聊天」→ 能进聊天页（**不是** `405 Method Not Allowed`）。
- 在聊天页直接按 F5 刷新 → 页面正常（验证 `public/_redirects` 的 SPA 回退）。
- 发一条消息 → 有回复、打字动效走完、不是红色错误气泡。
  （现在这条走的是本地模拟；接上后端后，回复来自真模型，且**看不到**「情绪：平静」这种第一行。）

## 两个容易踩的坑

- **`functions/chat.js` 不能放在 `functions/` 根下**。那个位置映射到路由 `/chat`，
  和 React 的聊天页路由同名。Cloudflare 里 Functions 优先级高于静态资源，
  结果就是聊天页被函数接管、返回 405。所以它在 `functions/api/chat.js`（→ `/api/chat`）。
- **不要用 `_worker.js` 高级模式**。`functions/` 目录里用标准的
  `export async function onRequestPost(context)`，`_worker.js` 会让整个
  `functions/` 目录被忽略掉。
