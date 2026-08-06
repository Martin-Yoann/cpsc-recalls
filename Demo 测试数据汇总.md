Demo 测试数据汇总
1. 免登录查询 /lookup
输入索赔编号 + 手机号查询进度：

索赔编号	手机号	状态
KOI-2512-1842	13812341234	Verified ✅
KOI-2601-2104	18611223344	Under Review 🔄
KOI-2512-0412	13956785678	Remedy Issued 📦
KOI-2612-1288	15287654321	Resolved ✔
2. 产品校验 /recalls/music-lollipop-safety-recall
在召回页点的 Check Your Product 输入：

字段	值	结果
Shape	Bear	
Flavor	Peach	Match ✓
Lot Code	ML-2406-A	
Date Code	06/2024	
Shape	Dinosaur	
Flavor	Strawberry	Match ✓
Lot Code	ML-2408-C	
Date Code	08/2024	
Shape	Heart	
Flavor	Peach	No Match ✗
Lot Code	ML-2500-X	(不在受影响范围内)
Date Code	12/2025	
3. 登录测试 /login
邮箱	密码
sarah.chen@email.com	123456
emily.davis@email.com	recall2025
jwilson@email.com	mypassword
Sarah 有 2 个索赔 + 2 个绑定订单，数据最全

4. 注册测试 /register
任意填写新用户信息即可注册（存入 localStorage，刷新后清空）

<!-- 部署 -->

Vercel 部署方案（无需域名）
Vercel 免费提供三个 *.vercel.app 子域名，例如：

koi-recall-api.vercel.app（Backend）
koi-web.vercel.app（消费者网站）
koi-admin.vercel.app（管理后台）
部署顺序

第1步: 部署 Backend  →  获得 URL https://xxx.vercel.app
第2步: 把 Backend URL 填入前端的 NEXT_PUBLIC_API_URL
第3步: 部署两个前端 →  自动连接 Backend
第1步 — 部署 Backend
在 Vercel 中 import 这个 repo，设置 Project Root = KOI-Recall-Backend：

设置	值
Framework	Other
Root Directory	KOI-Recall-Backend
Build Command	npm run build
Output Directory	留空
环境变量：


CORS_ALLOWED_ORIGINS=https://koi-web.vercel.app,https://koi-admin.vercel.app
⚠️ 现在不填 DATABASE_URL 也可以——Backend 跑在 skeleton 模式，GET /campaigns 返回 501，前端自动用 mock 数据兜底，不影响使用。等你有 Neon Postgres 后再接上就行。

第2步 — 获得 Backend URL
部署完后 Vercel 会给一个域名，类似 koi-recall-api-uniqueid.vercel.app，记下来。

第3步 — 部署 kol-web 和 kol-admin
同样 import repo，Root Directory 分别设 KOI-web 和 KOI-admin（Vercel 会自动识别 Next.js）。

两个前端都需要这个环境变量：


NEXT_PUBLIC_API_URL=https://koi-recall-api-xxx.vercel.app
最终效果

用户浏览器
  │
  ├─ koi-web.vercel.app        (Next.js → fetch Backend / mock fallback)
  ├─ koi-admin.vercel.app      (Next.js → fetch Backend / mock fallback)
  │
  └─ koi-recall-api.vercel.app (Hono on Vercel → 501 skeleton)
三项目现在本地已经串联（端口 3000/3001/3002），Vercel 配置也已就绪。是否需要我现在帮你做 Vercel CLI 登录并部署？