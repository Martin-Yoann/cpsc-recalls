# KOI Recall Platform (Web)

KOI 召回平台消费者网站 — 面向终端用户的召回查询、产品校验与索赔提交界面。无需注册即可查询进度，匿名完成完整的召回申请流程。

## 项目状态

| 维度 | 状态 |
|---|---|
| 阶段 | Phase 1 — 前端骨架完成，接入后端部分端点 (2/6) |
| 构建 | ✅ Next.js 16 + TypeScript + Tailwind CSS v4 |
| 部署 | ✅ [koi-recall-web.vercel.app](https://koi-recall-web.vercel.app) |
| 后端集成 | partial — `GET /campaigns/{slug}` & `POST /product-checks` 接通，其余 4 端点本地 mock |
| Mock 数据 | ✅ Music Lollipop 召回活动 (1 个 campaign, 10 个 claims) |
| 认证 | ✅ Neon 后端真实认证（`/v1/consumer-auth`），注册制；支持免登录查询 |
| 响应式 | ✅ Mobile / Tablet / Desktop 全适配 |

### 与上下游关系

```
┌──────────────────────────────────────────────────────────────────┐
│  KOI-recall-web (消费者网站)                                      │
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐│
│  │ 首页      │→│ 召回详情  │→│ 产品校验  │→│ 补救选择 → 提交   ││
│  │ Hero+CTA  │ │ 三刀流    │ │ API-first │ │ → shared-claims   ││
│  └──────────┘  └──────────┘  └──────────┘  └────────┬─────────┘│
│                                                     │          │
│  ┌──────────┐  ┌──────────┐                         │          │
│  │ 进度查询  │  │ 用户中心  │                         │          │
│  │ /lookup  │  │ /dashboard│                         │          │
│  └──────────┘  └──────────┘                         │          │
└────────────────────────────────────────────────────┼───────────┘
                                                     │
                         ┌───────────────────────────┼───────────┐
                         │ KOI-Recall-Backend        │           │
                         │ Hono + Drizzle             │           │
                         │ ✅ GET /campaigns/{slug}   │           │
                         │ ✅ POST /product-checks    │           │
                         │ ⚠️ POST /claims (501)      │           │
                         └───────────────────────────┼───────────┘
                                                     │
                         ┌───────────────────────────┴───────────┐
                         │ KOI-admin (管理后台)                   │
                         │ 审核索赔 → shared-claims localStorage │
                         └───────────────────────────────────────┘
```

消费者提交索赔后，管理员在 **同一浏览器** 的 KOI-admin Dashboard 即刻看到新条目并流转状态。Phase 2 后端 `POST /claims` 接通后切换为 API-first 持久化。

---

## 快速开始

```bash
git clone git@github.com:Martin-Yoann/cpsc-recalls.git
cd koi-recall-web
npm install
npm run dev        # http://localhost:3000
```

如需调用后端 API：

```bash
# 先启动 Backend (端口 3002)，见 ../KOI-Recall-Backend
NEXT_PUBLIC_API_URL=http://localhost:3002 npm run dev
```

Demo 模式（API 失败回退本地 mock）：

```bash
NEXT_PUBLIC_DEMO_MODE=true npm run dev
```

---

## 项目结构

```
src/
├── app/                              # Next.js App Router
│   ├── layout.tsx                    # 根布局 — Header + Footer + Providers
│   ├── page.tsx                      # 首页 — Hero/三步流程/召回卡片/CTA
│   ├── globals.css                   # 设计系统 — Three-Blade 色板 + 工具类
│   ├── not-found.tsx                 # 自定义 404
│   ├── lookup/page.tsx               # 免登录查询 — 抽屉式查询+结果
│   ├── (consumer)/recalls/[slug]/
│   │   ├── page.tsx                  # 召回详情 — 三刀流 100vh × 3
│   │   └── loading.tsx               # 骨架屏
│   ├── (auth)/
│   │   ├── login/page.tsx            # 登录 (自动打开抽屉)
│   │   ├── register/page.tsx         # 注册 (自动打开抽屉)
│   │   └── layout.tsx                # Auth 路由组布局
│   └── (dashboard)/dashboard/
│       ├── page.tsx                  # 用户中心概览
│       ├── claims/page.tsx           # 我的索赔
│       ├── claims/[id]/page.tsx      # 索赔详情
│       ├── orders/page.tsx           # 绑定订单
│       └── profile/page.tsx          # 个人信息
├── components/
│   ├── consumer/                     # 消费者业务组件 (12 个)
│   │   ├── safety-banner.tsx         # 安全横幅 — 可关闭
│   │   ├── recall-hero.tsx           # 召回 Hero — 标题+元数据+产品图
│   │   ├── recall-card.tsx           # 召回卡片 — 网格展示
│   │   ├── recall-check-card.tsx     # 产品校验 — Shape/Flavor/Lot/Date → API
│   │   ├── eligibility-wizard.tsx    # 资格向导 — 多步表单 (旧版/备用)
│   │   ├── reminder-options.tsx       # 补救选择 — 替换/退款
│   │   ├── claim-submit-wrapper.tsx  # 提交包装 — 写 shared-claims + 确认页
│   │   ├── evidence-uploader.tsx     # 证据上传
│   │   ├── incident-capture.tsx      # 事故报告
│   │   ├── remedy-timeline.tsx       # 补救时间线
│   │   ├── case-status-tracker.tsx   # 案件状态追踪
│   │   └── claim-confirmation.tsx    # 索赔确认
│   ├── shared/                       # 跨页面共享组件 (7 个)
│   │   ├── header.tsx                # 全局 Header
│   │   ├── footer.tsx                # 全局 Footer
│   │   ├── blade-progress.tsx        # 三刀流进度条
│   │   ├── status-badge.tsx          # 状态徽章
│   │   ├── empty-state.tsx           # 空态占位
│   │   ├── motion-safe.tsx           # 无障碍动画包装器
│   │   └── providers.tsx             # Provider 组合根
│   ├── auth/                         # 认证组件
│   │   ├── auth-drawer.tsx           # 登录/注册抽屉 — Tab 切换
│   │   └── auth-links.tsx            # 首页认证入口
│   ├── dashboard/                    # Dashboard 组件
│   │   ├── sidebar.tsx               # 用户侧边栏
│   │   ├── claim-row.tsx             # 索赔行
│   │   └── order-card.tsx            # 订单卡片
│   ├── lookup/                       # 查询组件
│   │   ├── lookup-form.tsx           # 查询表单 — 索赔编号+手机号
│   │   └── lookup-result.tsx         # 查询结果 — 进度+产品+补救
│   └── ui/                           # shadcn/base-ui 基础组件 (19 个)
├── lib/
│   ├── constants.ts                  # 导航/Blade 配置/状态标签/文件限制
│   ├── api-client.ts                 # API 客户端 — 6 端点 + 501 检测
│   ├── api-adapter.ts                # API → 领域模型适配层 + Demo fallback
│   ├── auth-context.tsx              # 认证 Context — 登录/注册/抽屉管理
│   ├── auth-utils.ts                 # 认证工具 — localStorage 读写
│   ├── shared-claims-store.ts        # 跨项目共享索赔存储
│   ├── utils.ts                      # cn() — clsx + tailwind-merge
│   ├── validators.ts                 # Zod 校验 schema
│   └── motion-presets.ts            # Framer Motion 变体定义
├── types/
│   ├── domain.ts                     # 领域模型 — Campaign/Claim/Product...
│   ├── ui.ts                         # UI 类型 — BladeStage/NavItem...
│   ├── auth.ts                       # 认证类型 — User/BoundOrder
│   ├── api.ts                        # 从 OpenAPI YAML 自动生成 (838 行)
│   └── index.ts                      # barrel re-export
├── data/
│   ├── mock-recalls.ts               # Music Lollipop 召回活动
│   ├── mock-claims.ts                # 10 个索赔 — 含手机号/批次信息
│   ├── mock-users.ts                 # 3 个模拟用户
│   └── mock-orders.ts                # 5 个绑定订单
└── hooks/
    ├── use-blade-stage.ts            # 三刀流阶段计算
    └── use-claim-form.ts             # 索赔状态机 (4 步, 预留)
```

---

## 页面功能

### 首页 `/`

| 区域 | 说明 |
|---|---|
| Hero | Slogan + 双入口卡片（查进度 / 看召回）+ 4 格指标卡 + 登录入口 |
| 三步流程 | Safety → Verification → Resolution 卡片，hover connector |
| 活跃召回 | 1 列→2 列→3 列→4 列响应式卡片网格，RiskLevel 色条 |
| Trust Bar | 3 合规标识 — dark background |
| CTA | 全宽 Teal 横幅，导向召回详情页 |

### 召回详情 `/recalls/{slug}`

三刀流全屏布局 (`h-[calc(100dvh-3.75rem)]`)：

| Blade | 内容 |
|---|---|
| 1 · Safety Notice | 产品图片 + 危害描述 + 受影响批次 + CPSC/厂商/数量 mini 卡 |
| 2 · Verification | 产品校验（Shape/Flavor/Lot/Date）→ 调用 API；`potential_match`/`not_matched`/`manual_review` 三种结果；Where to Find the Codes 指引 |
| 3 · Resolution | 补救选项（替换/退款）→ 选择后提交至 shared-claims-store → 确认页显示 Claim Reference |

### 免登录查询 `/lookup`

- 居中表单：索赔编号 + 手机号 → 右侧抽屉展示进度
- 结果：5 步进度条（横排） + 产品信息 + 补救详情 + 时间线 + 注册 CTA
- Demo 测试数据可折叠查看
- 测试数据：`KOI-2512-1842 / 13812341234` 等 3 组

### 用户中心 `/dashboard`

| 页面 | 功能 |
|---|---|
| 概览 | 欢迎语 + 4 指标卡 + 最近索赔列表 |
| 我的索赔 | 索赔列表 — 编号/状态/活动/提交时间 |
| 索赔详情 | 5 步进度条 + 产品信息 + 补救方案 + 证据 + 预计完成时间 |
| 绑定订单 | 订单列表 — 自动关联索赔状态 |
| 个人信息 | 账户详情展示 |

---

## API 集成

### 端点接入状态

| 方法 | 端点 | 状态 | 说明 |
|---|---|---|---|
| GET | `/v1/recall-campaigns/{slug}` | ✅ 已接通 | `fetchCampaign()` → API 优先，本地 mock 兜底 |
| POST | `/v1/recall-campaigns/{slug}/product-checks` | ✅ 已接通 | `RecallCheckCard` → API，501 回退本地匹配 |
| POST | `/v1/recall-campaigns/{slug}/claim-drafts` | ⚠️ 501 | 匿名草稿 — 占位 |
| POST | `/v1/claim-drafts/{draftId}/upload-tokens` | ⚠️ 501 | 上传授权 — 占位 |
| DELETE | `/v1/claim-drafts/{draftId}/documents/{documentId}` | ⚠️ 501 | 删除草稿文件 — 占位 |
| POST | `/v1/recall-campaigns/{slug}/claims` | ⚠️ 501 | 提交索赔 — 当前走 shared-claims-store |

### Demo 模式

设置 `NEXT_PUBLIC_DEMO_MODE=true` 后：
- API 失败自动回退本地 mock 数据
- 产品校验 501 时回退本地 lot/date 匹配
- `fetchCampaign()` 网络错误 → 读取 `mock-recalls.ts`

生产环境 (`NEXT_PUBLIC_DEMO_MODE` 未设置)：
- API 失败返回显式错误状态，展示 `requestId`，不静默回退 mock

---

## 认证

消费者端为**注册制**（真实 Neon 后端），无内置演示账号。首次使用请通过首页 Hero 区或 Header 右上角进入登录/注册抽屉，注册即可（密码 ≥ 12 位）。登录后跳转 `/dashboard`，Header 显示头像下拉菜单。

免登录路径：`/lookup` 通过索赔编号+手机号查询，无需账户。

---

## 设计系统

### 色板 — Three-Blade

| Blade | 用途 | 主色 |
|---|---|---|
| Safety | 危害警示 | `#EA580C` (Orange) |
| Verification | 产品校验 | `#2563EB` (Blue) |
| Resolution | 补救完成 | `#0D9488` (Teal) |
| Brand | 品牌主色 | `#003527` (Emerald) |

### 排版

| 用途 | 字体 |
|---|---|
| UI 正文 | Inter / Hanken Grotesk |
| 数据/指标 | JetBrains Mono (等宽) |

### 交互

| 元素 | 动效 |
|---|---|
| 卡片 | `card-lift` — hover 上浮 8px + 阴影 |
| 按钮 | `btn-lift` + `btn-press` — hover 浮 2px，active 缩 0.95x |
| 图标 | `icon-spin` — hover 旋转 15° + 放大 1.15x |
| 侧边栏展开 | `width 320ms cubic-bezier(0.25,0,0.15,1)` |
| 抽屉/弹窗 | `slideInRight` / `fadeIn` / `scaleIn` 关键帧动画 |
| 链接下划线 | `link-expand` — 从中心向两侧展开 |

---

## 环境变量

| 变量 | 默认值 | 说明 |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3002` | 后端 API 地址 |
| `NEXT_PUBLIC_DEMO_MODE` | — | `true` 时 API 失败回退 mock |

---

## 相关仓库

| 项目 | 说明 |
|---|---|
| [KOI-admin](https://github.com/Martin-Yoann/KOI-admin) | 管理后台 — 审核索赔/管理召回活动 |
| [KOI-Recall-Backend](https://github.com/Martin-Yoann/KOI-Recall-Backend) | Hono + Drizzle 后端 API — OpenAPI 契约驱动 |

---

## 技术栈

- **框架**：Next.js 16 (App Router, Turbopack)
- **UI**：React 19 · Tailwind CSS v4 · shadcn/ui (base-nova) · @base-ui/react
- **动画**：Framer Motion
- **表单**：React Hook Form · Zod
- **图标**：Lucide React
- **工具**：clsx · tailwind-merge · date-fns · class-variance-authority
- **API 类型**：openapi-typescript（从 `toc-v1.openapi.yaml` 自动生成）
- **部署**：Vercel
