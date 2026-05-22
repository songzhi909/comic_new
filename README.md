# 漫画阅读器

一款支持 PC 端与移动端的漫画阅读器 Web 应用，用户可以在本地服务器上管理漫画库、分类标签、追踪阅读进度，并通过浏览器阅读漫画。

## 功能特性

- **漫画库管理**：添加本地目录作为漫画库，自动扫描导入漫画
- **漫画类型**：支持单体漫画和分集漫画（自动识别）
- **阅读器**：卷轴模式、自适应缩放、深色模式、阅读进度记忆
- **分类标签**：为漫画添加标签分类，支持搜索筛选
- **收藏书架**：收藏漫画、评分、最近阅读
- **用户系统**：JWT 认证、角色权限（管理员/编辑者/读者）
- **授权码注册**：管理员生成授权码控制注册
- **图片优化**：自适应分辨率、缩略图生成、懒加载
- **导入功能**：支持 ZIP 上传和 URL 下载导入漫画
- **响应式设计**：PC 端多列网格，移动端自适应布局

## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | Vue 3 + TypeScript + Vite + Pinia + Vue Router |
| 后端 | Express + TypeScript + better-sqlite3 |
| 图片处理 | sharp |
| 包管理 | pnpm workspace (monorepo) |
| 认证 | JWT + bcryptjs |

## 项目结构

```
comic/
├── packages/
│   ├── client/          # Vue 3 前端
│   │   └── src/
│   │       ├── components/   # 通用组件
│   │       ├── views/        # 页面视图
│   │       ├── stores/       # Pinia 状态管理
│   │       ├── router/       # Vue Router
│   │       ├── utils/        # 工具函数
│   │       └── styles/       # 全局样式
│   └── server/          # Node.js 后端
│       └── src/
│           ├── routes/       # API 路由
│           ├── services/     # 业务逻辑
│           ├── db/           # 数据库
│           └── middleware/   # 中间件
├── package.json
└── pnpm-workspace.yaml
```

## 快速开始

### 环境要求

- Node.js >= 18
- pnpm >= 8

### 安装

```bash
# 克隆项目
git clone https://github.com/songzhi909/comic_new.git
cd comic_new

# 安装依赖
pnpm install
```

### 启动

```bash
# 启动后端服务（默认端口 3000）
pnpm dev:server

# 启动前端开发服务（默认端口 5173）
pnpm dev:client
```

访问 http://localhost:5173

### 默认管理员

- 用户名：`admin`
- 密码：`admin123`

> 首次登录后建议修改密码

## 配置

通过环境变量或 `.env` 文件配置：

| 变量 | 说明 | 默认值 |
|---|---|---|
| `PORT` | 后端服务端口 | `3000` |
| `DATA_DIR` | 数据存储目录 | `~/.comic-reader` |
| `JWT_SECRET` | JWT 签名密钥 | 自动生成 |
| `ADMIN_PASSWORD` | 管理员初始密码 | `admin123` |

## API 接口

### 认证

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/api/auth/login` | 登录 |
| POST | `/api/auth/register` | 注册（需要授权码） |
| GET | `/api/auth/me` | 获取当前用户 |

### 漫画库

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/libraries` | 获取漫画库列表 |
| POST | `/api/libraries` | 添加漫画库 |
| POST | `/api/libraries/:id/scan` | 扫描漫画库 |

### 漫画

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/comics` | 漫画列表（支持筛选分页） |
| GET | `/api/comics/:id` | 漫画详情 |
| GET | `/api/comics/:id/pages/:num` | 获取页面图片 |
| GET | `/api/comics/:id/thumbnail` | 获取封面缩略图 |

### 其他

- 标签管理：`/api/tags`
- 阅读进度：`/api/comics/:id/progress`
- 收藏评分：`/api/comics/:id/favorite`
- 用户管理：`/api/users`（管理员）
- 授权码：`/api/invite-codes`（管理员）
- 导入任务：`/api/comics/download`、`/api/comics/upload`

## 漫画目录结构

**单体漫画：**
```
漫画A/
  001.jpg
  002.jpg
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

## License

MIT
