# 漫画阅读器设计规格

## 概述

一款支持 PC 端与移动端的漫画阅读器 Web 应用，用户可以在本地服务器上管理漫画库、分类标签、追踪阅读进度，并通过浏览器阅读漫画。

## 跨平台支持

服务端需要在 Windows、macOS、Linux 上运行。注意事项：

1. **文件路径**：使用 `path.join()` 和 `path.resolve()` 处理路径，不硬编码路径分隔符
2. **数据目录**：使用环境变量 `DATA_DIR` 或配置文件指定数据目录，默认为 `~/.comic-reader/`
3. **SQLite 存储**：数据库文件存放在数据目录下，不依赖特定系统路径
4. **缩略图缓存**：存放在数据目录下的 `thumbnails/` 子目录
5. **依赖兼容**：`sharp` 和 `better-sqlite3` 均支持 Windows/macOS/Linux

## 技术栈

| 层 | 技术 |
|---|---|
| 前端框架 | Vue 3 + TypeScript + Vite |
| 状态管理 | Pinia |
| 路由 | Vue Router |
| 后端框架 | Express + TypeScript |
| 数据库 | better-sqlite3 |
| 包管理 | pnpm workspace |
| 图片处理 | sharp（缩略图生成） |
| 文件解压 | adm-zip |
| 认证 | JWT (jsonwebtoken + bcryptjs) |

## 项目结构

```
comic/
├── packages/
│   ├── client/                 # Vue 3 前端
│   │   ├── src/
│   │   │   ├── components/     # 通用组件
│   │   │   ├── views/          # 页面视图
│   │   │   ├── composables/    # 组合式函数
│   │   │   ├── stores/         # Pinia 状态管理
│   │   │   ├── router/         # Vue Router
│   │   │   ├── styles/         # 全局样式
│   │   │   └── types/          # TypeScript 类型
│   │   ├── index.html
│   │   └── vite.config.ts
│   └── server/                 # Node.js 后端
│       ├── src/
│       │   ├── routes/         # API 路由
│       │   ├── services/       # 业务逻辑
│       │   ├── db/             # 数据库相关
│       │   ├── middleware/     # 中间件
│       │   └── utils/          # 工具函数
│       └── package.json
├── package.json                # pnpm workspace 根配置
├── pnpm-workspace.yaml
└── CLAUDE.md
```

## 漫画目录结构

**单体漫画：**
```
漫画A/
  001.jpg
  002.jpg
  003.jpg
```

**分集漫画：**
```
漫画B/
  第1话/
    001.jpg
    002.jpg
  第2话/
    001.jpg
    002.jpg
```

扫描器自动识别：子目录包含图片则为分集漫画，否则为单体漫画。

## 数据库设计

### 表结构

**libraries — 漫画库**
```sql
CREATE TABLE libraries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  path TEXT NOT NULL UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**comics — 漫画**
```sql
CREATE TABLE comics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  library_id INTEGER NOT NULL REFERENCES libraries(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  path TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'single',  -- single(单体), series(分集)
  page_count INTEGER NOT NULL DEFAULT 0,
  episode_count INTEGER NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'unread',  -- unread, reading, completed
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**episodes — 集数（分集漫画）**
```sql
CREATE TABLE episodes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  comic_id INTEGER NOT NULL REFERENCES comics(id) ON DELETE CASCADE,
  title TEXT NOT NULL,           -- 如 "第1话", "第2话"
  path TEXT NOT NULL,
  page_count INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**tags — 标签**
```sql
CREATE TABLE tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT '#666666'
);
```

**comic_tags — 漫画-标签关联**
```sql
CREATE TABLE comic_tags (
  comic_id INTEGER NOT NULL REFERENCES comics(id) ON DELETE CASCADE,
  tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (comic_id, tag_id)
);
```

**reading_progress — 阅读进度**
```sql
CREATE TABLE reading_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  comic_id INTEGER NOT NULL REFERENCES comics(id) ON DELETE CASCADE,
  episode_id INTEGER REFERENCES episodes(id) ON DELETE CASCADE,  -- 分集漫画时有值
  current_page INTEGER NOT NULL DEFAULT 0,
  scroll_position REAL DEFAULT 0,
  is_completed BOOLEAN DEFAULT 0,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(comic_id, episode_id)
);
```

**favorites — 收藏**
```sql
CREATE TABLE favorites (
  comic_id INTEGER PRIMARY KEY REFERENCES comics(id) ON DELETE CASCADE,
  is_favorite BOOLEAN DEFAULT 0,
  rating INTEGER CHECK(rating >= 1 AND rating <= 5),
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**users — 用户**
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'reader',  -- admin, editor, reader
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**sessions — 会话**
```sql
CREATE TABLE sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL
);
```

**invite_codes — 授权码**
```sql
CREATE TABLE invite_codes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'reader',  -- editor, reader
  max_uses INTEGER DEFAULT 1,
  used_count INTEGER DEFAULT 0,
  expires_at DATETIME,
  created_by INTEGER NOT NULL REFERENCES users(id),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## API 设计

### 认证

```
POST   /api/auth/register          # 注册（需要授权码）
       body: { username, password, invite_code }
POST   /api/auth/login             # 登录，返回 JWT token
POST   /api/auth/logout            # 登出
GET    /api/auth/me                # 获取当前用户信息
```

### 用户管理（管理员）

```
GET    /api/users                  # 获取用户列表
PUT    /api/users/:id/role         # 修改用户角色
DELETE /api/users/:id              # 删除用户
```

### 授权码管理（管理员）

```
GET    /api/invite-codes           # 获取授权码列表
POST   /api/invite-codes           # 生成授权码
       body: { role, max_uses?, expires_at? }
DELETE /api/invite-codes/:id       # 删除授权码
```

### 漫画库管理（管理员）

```
GET    /api/libraries              # 获取漫画库列表
POST   /api/libraries              # 添加漫画库（指定目录路径）
DELETE /api/libraries/:id          # 删除漫画库
POST   /api/libraries/:id/scan     # 触发扫描
```

### 漫画管理（编辑者+）

```
GET    /api/comics                 # 获取漫画列表（支持筛选、分页）
GET    /api/comics/:id             # 获取漫画详情
GET    /api/comics/:id/pages       # 获取漫画页面列表（单体漫画）
GET    /api/comics/:id/pages/:num  # 获取指定页面图片（单体漫画），支持 ?width= 参数
GET    /api/comics/:id/thumbnail   # 获取封面缩略图

# 分集漫画
GET    /api/comics/:id/episodes                # 获取集数列表
GET    /api/comics/:id/episodes/:epId          # 获取集详情
GET    /api/comics/:id/episodes/:epId/pages    # 获取集的页面列表
GET    /api/comics/:id/episodes/:epId/pages/:num  # 获取集的指定页面，支持 ?width= 参数
GET    /api/comics/:id/episodes/:epId/thumbnail    # 获取集封面

# 导入
POST   /api/comics/download        # 从 URL 下载漫画 ZIP
       body: { url, library_id, title? }
POST   /api/comics/upload          # 上传漫画 ZIP 文件
       body: multipart/form-data { file, library_id, title? }
GET    /api/tasks/:id              # 查询下载/导入任务进度
```

### 标签管理（编辑者+）

```
GET    /api/tags                   # 获取所有标签
POST   /api/tags                   # 创建标签
PUT    /api/tags/:id               # 更新标签
DELETE /api/tags/:id               # 删除标签
POST   /api/comics/:id/tags        # 给漫画添加标签
DELETE /api/comics/:id/tags/:tagId # 移除标签
```

### 阅读进度（所有用户）

```
GET    /api/comics/:id/progress                # 获取漫画整体阅读进度
PUT    /api/comics/:id/progress                # 更新漫画整体进度（单体漫画）
GET    /api/comics/:id/episodes/:epId/progress # 获取指定集的阅读进度
PUT    /api/comics/:id/episodes/:epId/progress # 更新指定集的阅读进度
```

### 收藏（所有用户）

```
PUT    /api/comics/:id/favorite    # 切换收藏状态
PUT    /api/comics/:id/rating      # 更新评分
```

## 角色权限

| 功能 | 管理员 (admin) | 编辑者 (editor) | 读者 (reader) |
|---|---|---|---|
| 阅读漫画 | ✅ | ✅ | ✅ |
| 收藏/进度 | ✅ | ✅ | ✅ |
| 管理标签 | ✅ | ✅ | ❌ |
| 上传/下载漫画 | ✅ | ✅ | ❌ |
| 管理漫画库 | ✅ | ❌ | ❌ |
| 管理用户 | ✅ | ❌ | ❌ |
| 管理授权码 | ✅ | ❌ | ❌ |

## 注册机制

1. **管理员账号**：首次启动时自动创建，默认 `admin/admin123`，首次登录强制修改密码
2. **普通用户注册**：需要输入管理员提供的授权码
   - 管理员可生成授权码，设置角色（editor/reader）、使用次数、过期时间
   - 授权码决定注册用户的角色

## 前端页面

| 路由 | 页面 | 说明 |
|---|---|---|
| `/login` | 登录页 | 用户名/密码登录 |
| `/register` | 注册页 | 授权码注册 |
| `/` | 首页/书架 | 收藏的漫画、最近阅读、继续阅读 |
| `/library` | 漫画库 | 所有漫画列表，支持筛选排序 |
| `/library/:id` | 漫画库详情 | 单个库的漫画列表 |
| `/comic/:id` | 漫画详情 | 封面、信息、标签、开始阅读 |
| `/comic/:id/read` | 阅读器 | 单体漫画阅读页面 |
| `/comic/:id/episodes` | 集列表 | 分集漫画的集数列表 |
| `/comic/:id/episodes/:epId/read` | 集阅读器 | 分集漫画的阅读页面 |
| `/tags` | 标签管理 | 管理标签（编辑者+） |
| `/settings` | 设置 | 漫画库路径、阅读偏好 |
| `/admin/users` | 用户管理 | 管理员管理用户 |
| `/admin/invite-codes` | 授权码管理 | 管理员管理授权码 |

## 核心组件

| 组件 | 说明 |
|---|---|
| `ComicCard` | 漫画卡片（封面+标题+进度条） |
| `ComicReader` | 阅读器核心，支持卷轴模式和自适应缩放 |
| `EpisodeList` | 分集漫画的集数列表组件 |
| `LibraryManager` | 漫画库管理面板 |
| `TagEditor` | 标签编辑器 |
| `SearchBar` | 搜索栏，支持按标题/标签筛选 |
| `DownloadDialog` | 下载漫画对话框 |
| `UploadDialog` | 上传漫画对话框 |

## 状态管理（Pinia）

- `useAuthStore` — 用户认证状态、当前用户信息
- `useComicStore` — 漫画列表、当前漫画、筛选条件
- `useLibraryStore` — 漫画库列表
- `useReaderStore` — 阅读器状态（当前页、缩放、滚动位置）
- `useTaskStore` — 下载/导入任务进度

## 阅读器设计

### 漫画类型

**单体漫画（single）：**
- 目录下直接包含图片文件
- 进入阅读器后直接垂直滚动所有页面

**分集漫画（series）：**
- 目录下包含多个子目录，每个子目录为一集
- 先进入集列表页，选择某一集后进入阅读器
- 阅读进度按集记录

### 阅读模式：卷轴模式（垂直滚动）

- 图片按顺序垂直排列，连续滚动浏览
- 自适应屏幕宽度：图片宽度默认 100% 容器宽度
- 支持捏合缩放（移动端）和 Ctrl+滚轮缩放（PC 端）
- 双击快速缩放到 100% / 适配宽度

### 功能

| 功能 | 说明 |
|---|---|
| 进度条 | 底部进度条显示当前阅读位置，可拖拽跳转 |
| 自动记忆 | 每次滚动自动保存当前阅读位置到后端 |
| 预加载 | 提前加载前后各 3 张图片 |
| 顶部工具栏 | 点击屏幕中央唤出，显示标题、返回、页码 |
| 深色模式 | 阅读器背景支持黑色/白色切换 |

### 图片加载策略

- 使用 `IntersectionObserver` 懒加载，只加载视口附近图片
- 缩略图优先加载，原图异步替换
- 加载失败自动重试 3 次

### 图片分辨率自适应

根据平台和用户设置动态调整图片分辨率，节省移动端流量：

**API 参数：**
```
GET /api/comics/:id/pages/:num?width=800
GET /api/comics/:id/episodes/:epId/pages/:num?width=800
```

**后端处理：**
- 接收 `width` 参数，使用 `sharp` 按宽度等比缩放
- 缓存缩放后的图片到 `thumbnails/resized/` 目录
- 不传 `width` 参数时返回原图

**前端策略：**
| 平台 | 默认宽度 | 说明 |
|---|---|---|
| 移动端（<768px） | 屏幕宽度 | 自动匹配设备宽度，节省流量 |
| PC 端（>1024px） | 原图 | 默认加载原图 |

**用户可选分辨率：**
- 设置页面提供分辨率选项：原图 / 1920px / 1280px / 800px
- 移动端默认「自动」（匹配屏幕宽度）
- PC 端默认「原图」

## 响应式策略

- PC 端（>1024px）：多列网格展示漫画，侧边栏筛选
- 移动端（<768px）：单列/双列网格，底部导航栏
- 使用 CSS Grid + 媒体查询，不引入 UI 框架

## 配置

通过环境变量或 `.env` 文件配置：

| 变量 | 说明 | 默认值 |
|---|---|---|
| `PORT` | 服务端口 | `3000` |
| `DATA_DIR` | 数据存储目录 | `~/.comic-reader` |
| `JWT_SECRET` | JWT 签名密钥 | 首次启动自动生成 |
| `ADMIN_PASSWORD` | 管理员初始密码 | `admin123` |

## 后端模块

| 模块 | 职责 |
|---|---|
| `scanner` | 扫描指定目录，发现漫画文件夹和图片文件 |
| `db` | SQLite 数据库操作 |
| `routes` | RESTful API 端点 |
| `thumbnail` | 生成和缓存漫画封面缩略图 |
| `downloader` | 从 URL 下载 ZIP 文件 |
| `importer` | 解压 ZIP，提取图片，创建漫画记录 |
| `task-queue` | 简单任务队列，管理异步操作 |
| `auth` | JWT 认证中间件 |
| `rbac` | 角色权限检查中间件 |

## 开发阶段

| 阶段 | 内容 | 优先级 |
|---|---|---|
| **P1 核心** | 项目搭建 → 认证系统 → 漫画库扫描 → 漫画列表 → 基础阅读器 | 最高 |
| **P2 管理** | 标签系统 → 收藏/书架 → 阅读进度 → 搜索筛选 | 高 |
| **P3 导入** | URL 下载 → ZIP 上传 → 任务队列 → 进度展示 | 中 |
| **P4 用户** | 用户管理 → 授权码管理 → 权限控制完善 | 中 |
| **P5 体验** | 深色模式 → 缩略图缓存 → 性能优化 → 动画过渡 | 低 |
