# 漫画阅读器实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 构建一款支持 PC/移动端的漫画阅读器 Web 应用，包含漫画库管理、标签分类、阅读进度追踪、用户权限系统

**架构：** pnpm monorepo，前端 Vue 3 + Vite，后端 Express + SQLite，JWT 认证，角色权限控制

**技术栈：** Vue 3, TypeScript, Vite, Pinia, Vue Router, Express, better-sqlite3, sharp, adm-zip, jsonwebtoken, bcryptjs

---

## 阶段 P1：核心功能

### 任务 1：项目脚手架 — pnpm monorepo

**文件：**
- 创建：`package.json`
- 创建：`pnpm-workspace.yaml`
- 创建：`packages/client/package.json`
- 创建：`packages/client/tsconfig.json`
- 创建：`packages/client/vite.config.ts`
- 创建：`packages/client/index.html`
- 创建：`packages/client/src/main.ts`
- 创建：`packages/client/src/App.vue`
- 创建：`packages/server/package.json`
- 创建：`packages/server/tsconfig.json`
- 创建：`packages/server/src/index.ts`

- [ ] **步骤 1：创建根配置**

```json
// package.json
{
  "name": "comic-reader",
  "private": true,
  "scripts": {
    "dev": "pnpm --filter './packages/**' dev",
    "dev:server": "pnpm --filter server dev",
    "dev:client": "pnpm --filter client dev",
    "build": "pnpm --filter './packages/**' build"
  }
}
```

```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
```

- [ ] **步骤 2：创建后端项目**

```json
// packages/server/package.json
{
  "name": "server",
  "version": "0.1.0",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "express": "^4.21.0",
    "better-sqlite3": "^11.6.0",
    "sharp": "^0.33.5",
    "adm-zip": "^0.5.16",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "multer": "^1.4.5-lts.1",
    "dotenv": "^16.4.5",
    "node-fetch": "^3.3.2"
  },
  "devDependencies": {
    "@types/express": "^5.0.0",
    "@types/better-sqlite3": "^7.6.12",
    "@types/adm-zip": "^0.5.6",
    "@types/jsonwebtoken": "^9.0.7",
    "@types/bcryptjs": "^2.4.6",
    "@types/cors": "^2.8.17",
    "@types/multer": "^1.4.12",
    "@types/node": "^22.10.0",
    "tsx": "^4.19.2",
    "typescript": "^5.7.0"
  }
}
```

```json
// packages/server/tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true
  },
  "include": ["src/**/*"]
}
```

```typescript
// packages/server/src/index.ts
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

- [ ] **步骤 3：创建前端项目**

```json
// packages/client/package.json
{
  "name": "client",
  "version": "0.1.0",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc --noEmit && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "vue": "^3.5.13",
    "vue-router": "^4.5.0",
    "pinia": "^2.3.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.2.1",
    "typescript": "^5.7.0",
    "vite": "^6.0.0",
    "vue-tsc": "^2.2.0"
  }
}
```

```json
// packages/client/tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "jsx": "preserve",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "noEmit": true,
    "paths": {
      "@/*": ["./src/*"]
    },
    "baseUrl": "."
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.vue", "env.d.ts"]
}
```

```typescript
// packages/client/vite.config.ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
});
```

```html
<!-- packages/client/index.html -->
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>漫画阅读器</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.ts"></script>
</body>
</html>
```

```typescript
// packages/client/src/main.ts
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.mount('#app');
```

```vue
<!-- packages/client/src/App.vue -->
<template>
  <router-view />
</template>
```

```typescript
// packages/client/src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: () => import('@/views/HomeView.vue'),
    },
  ],
});

export default router;
```

```vue
<!-- packages/client/src/views/HomeView.vue -->
<template>
  <div>
    <h1>漫画阅读器</h1>
    <p>应用已成功启动</p>
  </div>
</template>
```

```typescript
// packages/client/env.d.ts
/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
```

- [ ] **步骤 4：安装依赖并验证**

运行：`cd D:/workspace/AI/comic && pnpm install`
预期：安装成功，无报错

运行：`pnpm dev:server`
预期：`Server running on http://localhost:3000`

运行：`pnpm dev:client`
预期：Vite 启动在 http://localhost:5173

- [ ] **步骤 5：Commit**

```bash
git init
git add -A
git commit -m "chore: init pnpm monorepo with Vue 3 + Express scaffolding"
```

---

### 任务 2：数据库初始化

**文件：**
- 创建：`packages/server/src/config.ts`
- 创建：`packages/server/src/db/database.ts`
- 创建：`packages/server/src/db/schema.ts`

- [ ] **步骤 1：创建配置模块**

```typescript
// packages/server/src/config.ts
import path from 'path';
import os from 'os';

const dataDir = process.env.DATA_DIR || path.join(os.homedir(), '.comic-reader');

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  dataDir,
  dbPath: path.join(dataDir, 'database.sqlite'),
  thumbnailsDir: path.join(dataDir, 'thumbnails'),
  jwtSecret: process.env.JWT_SECRET || 'comic-reader-default-secret-change-me',
  adminPassword: process.env.ADMIN_PASSWORD || 'admin123',
};
```

- [ ] **步骤 2：创建数据库初始化模块**

```typescript
// packages/server/src/db/database.ts
import Database from 'better-sqlite3';
import { config } from '../config.js';
import fs from 'fs';
import path from 'path';

fs.mkdirSync(path.dirname(config.dbPath), { recursive: true });

const db = new Database(config.dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export default db;
```

```typescript
// packages/server/src/db/schema.ts
import db from './database.js';

export function initDatabase(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS libraries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      path TEXT NOT NULL UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS comics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      library_id INTEGER NOT NULL REFERENCES libraries(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      path TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'single',
      page_count INTEGER NOT NULL DEFAULT 0,
      episode_count INTEGER NOT NULL DEFAULT 0,
      status TEXT DEFAULT 'unread',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS episodes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      comic_id INTEGER NOT NULL REFERENCES comics(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      path TEXT NOT NULL,
      page_count INTEGER NOT NULL DEFAULT 0,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      color TEXT DEFAULT '#666666'
    );

    CREATE TABLE IF NOT EXISTS comic_tags (
      comic_id INTEGER NOT NULL REFERENCES comics(id) ON DELETE CASCADE,
      tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
      PRIMARY KEY (comic_id, tag_id)
    );

    CREATE TABLE IF NOT EXISTS reading_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      comic_id INTEGER NOT NULL REFERENCES comics(id) ON DELETE CASCADE,
      episode_id INTEGER REFERENCES episodes(id) ON DELETE CASCADE,
      current_page INTEGER NOT NULL DEFAULT 0,
      scroll_position REAL DEFAULT 0,
      is_completed BOOLEAN DEFAULT 0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(comic_id, episode_id)
    );

    CREATE TABLE IF NOT EXISTS favorites (
      comic_id INTEGER PRIMARY KEY REFERENCES comics(id) ON DELETE CASCADE,
      is_favorite BOOLEAN DEFAULT 0,
      rating INTEGER CHECK(rating >= 1 AND rating <= 5),
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'reader',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token TEXT NOT NULL UNIQUE,
      expires_at DATETIME NOT NULL
    );

    CREATE TABLE IF NOT EXISTS invite_codes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL DEFAULT 'reader',
      max_uses INTEGER DEFAULT 1,
      used_count INTEGER DEFAULT 0,
      expires_at DATETIME,
      created_by INTEGER NOT NULL REFERENCES users(id),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}
```

- [ ] **步骤 3：更新服务器入口调用初始化**

```typescript
// packages/server/src/index.ts
import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { initDatabase } from './db/schema.js';

initDatabase();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`);
});
```

- [ ] **步骤 4：验证数据库创建**

运行：`pnpm dev:server`
预期：服务启动，`~/.comic-reader/database.sqlite` 文件被创建

- [ ] **步骤 5：Commit**

```bash
git add packages/server/src/config.ts packages/server/src/db/ packages/server/src/index.ts
git commit -m "feat: add database initialization with all tables"
```

---

### 任务 3：认证系统 — 管理员自动创建与登录

**文件：**
- 创建：`packages/server/src/services/auth.ts`
- 创建：`packages/server/src/middleware/auth.ts`
- 创建：`packages/server/src/routes/auth.ts`
- 修改：`packages/server/src/index.ts`

- [ ] **步骤 1：创建认证服务**

```typescript
// packages/server/src/services/auth.ts
import db from '../db/database.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import crypto from 'crypto';

interface User {
  id: number;
  username: string;
  password_hash: string;
  role: string;
}

export function ensureAdminExists(): void {
  const admin = db.prepare('SELECT id FROM users WHERE username = ?').get('admin');
  if (!admin) {
    const hash = bcrypt.hashSync(config.adminPassword, 10);
    db.prepare('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)').run('admin', hash, 'admin');
    console.log('Admin user created with default password');
  }
}

export function login(username: string, password: string): { token: string; user: Omit<User, 'password_hash'> } | null {
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as User | undefined;
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return null;
  }

  const token = jwt.sign({ userId: user.id, role: user.role }, config.jwtSecret, { expiresIn: '7d' });
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  db.prepare('INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)').run(user.id, token, expiresAt);

  const { password_hash, ...userWithoutPassword } = user;
  return { token, user: userWithoutPassword };
}

export function register(username: string, password: string, inviteCode: string): { token: string; user: Omit<User, 'password_hash'> } | null {
  const code = db.prepare('SELECT * FROM invite_codes WHERE code = ?').get(inviteCode) as any;
  if (!code) return null;
  if (code.used_count >= code.max_uses) return null;
  if (code.expires_at && new Date(code.expires_at) < new Date()) return null;

  const existingUser = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (existingUser) return null;

  const hash = bcrypt.hashSync(password, 10);
  const result = db.prepare('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)').run(username, hash, code.role);

  db.prepare('UPDATE invite_codes SET used_count = used_count + 1 WHERE id = ?').run(code.id);

  const token = jwt.sign({ userId: result.lastInsertRowid, role: code.role }, config.jwtSecret, { expiresIn: '7d' });
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  db.prepare('INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)').run(result.lastInsertRowid, token, expiresAt);

  return {
    token,
    user: { id: result.lastInsertRowid as number, username, password_hash: '', role: code.role },
  };
}

export function getUserFromToken(token: string): User | null {
  try {
    const payload = jwt.verify(token, config.jwtSecret) as { userId: number };
    return db.prepare('SELECT * FROM users WHERE id = ?').get(payload.userId) as User | undefined ?? null;
  } catch {
    return null;
  }
}

export function changePassword(userId: number, oldPassword: string, newPassword: string): boolean {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as User | undefined;
  if (!user || !bcrypt.compareSync(oldPassword, user.password_hash)) return false;

  const hash = bcrypt.hashSync(newPassword, 10);
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, userId);
  return true;
}
```

- [ ] **步骤 2：创建认证中间件**

```typescript
// packages/server/src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import { getUserFromToken } from '../services/auth.js';

export interface AuthRequest extends Request {
  user?: { id: number; username: string; role: string };
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: '未登录' });
    return;
  }

  const token = authHeader.slice(7);
  const user = getUserFromToken(token);
  if (!user) {
    res.status(401).json({ error: '登录已过期' });
    return;
  }

  req.user = { id: user.id, username: user.username, role: user.role };
  next();
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: '权限不足' });
      return;
    }
    next();
  };
}
```

- [ ] **步骤 3：创建认证路由**

```typescript
// packages/server/src/routes/auth.ts
import { Router } from 'express';
import { login, register, changePassword } from '../services/auth.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import db from '../db/database.js';

const router = Router();

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ error: '用户名和密码不能为空' });
    return;
  }

  const result = login(username, password);
  if (!result) {
    res.status(401).json({ error: '用户名或密码错误' });
    return;
  }

  res.json(result);
});

router.post('/register', (req, res) => {
  const { username, password, invite_code } = req.body;
  if (!username || !password || !invite_code) {
    res.status(400).json({ error: '用户名、密码和授权码不能为空' });
    return;
  }

  const result = register(username, password, invite_code);
  if (!result) {
    res.status(400).json({ error: '注册失败，授权码无效或用户名已存在' });
    return;
  }

  res.json(result);
});

router.post('/logout', authMiddleware, (req: AuthRequest, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.slice(7);
    db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
  }
  res.json({ success: true });
});

router.get('/me', authMiddleware, (req: AuthRequest, res) => {
  res.json({ user: req.user });
});

router.post('/change-password', authMiddleware, (req: AuthRequest, res) => {
  const { old_password, new_password } = req.body;
  if (!old_password || !new_password) {
    res.status(400).json({ error: '旧密码和新密码不能为空' });
    return;
  }

  const success = changePassword(req.user!.id, old_password, new_password);
  if (!success) {
    res.status(400).json({ error: '旧密码错误' });
    return;
  }

  res.json({ success: true });
});

export default router;
```

- [ ] **步骤 4：注册路由并启动管理员初始化**

```typescript
// packages/server/src/index.ts
import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { initDatabase } from './db/schema.js';
import { ensureAdminExists } from './services/auth.js';
import authRoutes from './routes/auth.js';

initDatabase();
ensureAdminExists();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);

app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`);
});
```

- [ ] **步骤 5：验证认证功能**

运行：`pnpm dev:server`
预期：服务启动，管理员账号自动创建

测试登录：
```bash
curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"username":"admin","password":"admin123"}'
```
预期：返回 `{ token: "...", user: { id: 1, username: "admin", role: "admin" } }`

- [ ] **步骤 6：Commit**

```bash
git add packages/server/src/services/ packages/server/src/middleware/ packages/server/src/routes/ packages/server/src/index.ts
git commit -m "feat: add authentication system with JWT and admin auto-creation"
```

---

### 任务 4：授权码与注册 API

**文件：**
- 创建：`packages/server/src/routes/invite-codes.ts`
- 修改：`packages/server/src/index.ts`

- [ ] **步骤 1：创建授权码路由**

```typescript
// packages/server/src/routes/invite-codes.ts
import { Router } from 'express';
import { authMiddleware, requireRole, AuthRequest } from '../middleware/auth.js';
import db from '../db/database.js';
import crypto from 'crypto';

const router = Router();

router.get('/', authMiddleware, requireRole('admin'), (_req: AuthRequest, res) => {
  const codes = db.prepare('SELECT * FROM invite_codes ORDER BY created_at DESC').all();
  res.json(codes);
});

router.post('/', authMiddleware, requireRole('admin'), (req: AuthRequest, res) => {
  const { role, max_uses, expires_at } = req.body;
  if (!role || !['editor', 'reader'].includes(role)) {
    res.status(400).json({ error: '角色必须是 editor 或 reader' });
    return;
  }

  const code = crypto.randomBytes(8).toString('hex');
  const result = db.prepare(
    'INSERT INTO invite_codes (code, role, max_uses, expires_at, created_by) VALUES (?, ?, ?, ?, ?)'
  ).run(code, role, max_uses || 1, expires_at || null, req.user!.id);

  res.json({ id: result.lastInsertRowid, code, role, max_uses: max_uses || 1 });
});

router.delete('/:id', authMiddleware, requireRole('admin'), (req: AuthRequest, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM invite_codes WHERE id = ?').run(id);
  res.json({ success: true });
});

export default router;
```

- [ ] **步骤 2：注册路由**

```typescript
// 在 packages/server/src/index.ts 中添加
import inviteCodeRoutes from './routes/invite-codes.js';

// 在 app.use('/api/auth', authRoutes); 之后添加
app.use('/api/invite-codes', inviteCodeRoutes);
```

- [ ] **步骤 3：验证授权码功能**

先登录获取 token，然后：
```bash
# 创建授权码
curl -X POST http://localhost:3000/api/invite-codes -H "Authorization: Bearer <token>" -H "Content-Type: application/json" -d '{"role":"reader","max_uses":5}'

# 注册新用户
curl -X POST http://localhost:3000/api/auth/register -H "Content-Type: application/json" -d '{"username":"testuser","password":"test123","invite_code":"<code>"}'
```

- [ ] **步骤 4：Commit**

```bash
git add packages/server/src/routes/invite-codes.ts packages/server/src/index.ts
git commit -m "feat: add invite code management API"
```

---

### 任务 5：漫画库管理 API

**文件：**
- 创建：`packages/server/src/routes/libraries.ts`
- 修改：`packages/server/src/index.ts`

- [ ] **步骤 1：创建漫画库路由**

```typescript
// packages/server/src/routes/libraries.ts
import { Router } from 'express';
import { authMiddleware, requireRole, AuthRequest } from '../middleware/auth.js';
import db from '../db/database.js';
import fs from 'fs';

const router = Router();

router.get('/', authMiddleware, (_req: AuthRequest, res) => {
  const libraries = db.prepare('SELECT * FROM libraries ORDER BY created_at DESC').all();
  res.json(libraries);
});

router.post('/', authMiddleware, requireRole('admin'), (req: AuthRequest, res) => {
  const { name, path: libPath } = req.body;
  if (!name || !libPath) {
    res.status(400).json({ error: '名称和路径不能为空' });
    return;
  }

  if (!fs.existsSync(libPath)) {
    res.status(400).json({ error: '路径不存在' });
    return;
  }

  if (!fs.statSync(libPath).isDirectory()) {
    res.status(400).json({ error: '路径必须是目录' });
    return;
  }

  try {
    const result = db.prepare('INSERT INTO libraries (name, path) VALUES (?, ?)').run(name, libPath);
    res.json({ id: result.lastInsertRowid, name, path: libPath });
  } catch (err: any) {
    if (err.message?.includes('UNIQUE')) {
      res.status(400).json({ error: '该路径已被添加' });
    } else {
      res.status(500).json({ error: '添加失败' });
    }
  }
});

router.delete('/:id', authMiddleware, requireRole('admin'), (req: AuthRequest, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM libraries WHERE id = ?').run(id);
  res.json({ success: true });
});

export default router;
```

- [ ] **步骤 2：注册路由**

```typescript
// 在 packages/server/src/index.ts 中添加
import libraryRoutes from './routes/libraries.js';
app.use('/api/libraries', libraryRoutes);
```

- [ ] **步骤 3：验证**

```bash
# 添加漫画库
curl -X POST http://localhost:3000/api/libraries -H "Authorization: Bearer <token>" -H "Content-Type: application/json" -d '{"name":"我的漫画","path":"D:/comics"}'

# 获取列表
curl http://localhost:3000/api/libraries -H "Authorization: Bearer <token>"
```

- [ ] **步骤 4：Commit**

```bash
git add packages/server/src/routes/libraries.ts packages/server/src/index.ts
git commit -m "feat: add library management API"
```

---

### 任务 6：漫画扫描服务

**文件：**
- 创建：`packages/server/src/services/scanner.ts`
- 创建：`packages/server/src/routes/scan.ts`
- 修改：`packages/server/src/index.ts`

- [ ] **步骤 1：创建扫描服务**

```typescript
// packages/server/src/services/scanner.ts
import fs from 'fs';
import path from 'path';
import db from '../db/database.js';

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp'];

function isImageFile(filename: string): boolean {
  return IMAGE_EXTENSIONS.includes(path.extname(filename).toLowerCase());
}

function getImagesInDir(dirPath: string): string[] {
  return fs.readdirSync(dirPath)
    .filter(f => isImageFile(f))
    .sort();
}

function detectComicType(comicPath: string): { type: 'single' | 'series'; episodes?: string[] } {
  const entries = fs.readdirSync(comicPath, { withFileTypes: true });
  const hasDirectImages = entries.some(e => e.isFile() && isImageFile(e.name));
  const subdirs = entries.filter(e => e.isDirectory());

  if (hasDirectImages) {
    return { type: 'single' };
  }

  if (subdirs.length > 0) {
    const episodeDirs = subdirs
      .map(d => d.name)
      .filter(name => {
        const subPath = path.join(comicPath, name);
        const images = getImagesInDir(subPath);
        return images.length > 0;
      })
      .sort();

    if (episodeDirs.length > 0) {
      return { type: 'series', episodes: episodeDirs };
    }
  }

  return { type: 'single' };
}

export function scanLibrary(libraryId: number): { added: number; updated: number; removed: number } {
  const library = db.prepare('SELECT * FROM libraries WHERE id = ?').get(libraryId) as any;
  if (!library) throw new Error('漫画库不存在');

  const existingComics = db.prepare('SELECT * FROM comics WHERE library_id = ?').all(libraryId) as any[];
  const existingPaths = new Map(existingComics.map(c => [c.path, c]));

  const entries = fs.readdirSync(library.path, { withFileTypes: true });
  const comicDirs = entries.filter(e => e.isDirectory());

  let added = 0;
  let updated = 0;

  const currentPaths = new Set<string>();

  for (const dir of comicDirs) {
    const comicPath = path.join(library.path, dir.name);
    currentPaths.add(comicPath);

    if (existingPaths.has(comicPath)) {
      updated++;
      continue;
    }

    const { type, episodes } = detectComicType(comicPath);

    let pageCount = 0;
    let episodeCount = 0;

    if (type === 'single') {
      pageCount = getImagesInDir(comicPath).length;
    } else if (episodes) {
      episodeCount = episodes.length;
    }

    const result = db.prepare(
      'INSERT INTO comics (library_id, title, path, type, page_count, episode_count) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(libraryId, dir.name, comicPath, type, pageCount, episodeCount);

    if (type === 'series' && episodes) {
      const insertEpisode = db.prepare(
        'INSERT INTO episodes (comic_id, title, path, page_count, sort_order) VALUES (?, ?, ?, ?, ?)'
      );

      for (let i = 0; i < episodes.length; i++) {
        const epPath = path.join(comicPath, episodes[i]);
        const epPageCount = getImagesInDir(epPath).length;
        insertEpisode.run(result.lastInsertRowid, episodes[i], epPath, epPageCount, i);
      }
    }

    added++;
  }

  let removed = 0;
  for (const [comicPath, comic] of existingPaths) {
    if (!currentPaths.has(comicPath)) {
      db.prepare('DELETE FROM comics WHERE id = ?').run((comic as any).id);
      removed++;
    }
  }

  return { added, updated, removed };
}
```

- [ ] **步骤 2：创建扫描路由**

```typescript
// packages/server/src/routes/scan.ts
import { Router } from 'express';
import { authMiddleware, requireRole, AuthRequest } from '../middleware/auth.js';
import { scanLibrary } from '../services/scanner.js';

const router = Router();

router.post('/:id/scan', authMiddleware, requireRole('admin'), (req: AuthRequest, res) => {
  const { id } = req.params;
  try {
    const result = scanLibrary(parseInt(id, 10));
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
```

- [ ] **步骤 3：注册路由**

```typescript
// 在 packages/server/src/index.ts 中添加
import scanRoutes from './routes/scan.js';
app.use('/api/libraries', scanRoutes);
```

- [ ] **步骤 4：验证扫描**

创建测试目录：
```bash
mkdir -p /tmp/test-comics/漫画A
echo "test" > /tmp/test-comics/漫画A/001.jpg
echo "test" > /tmp/test-comics/漫画A/002.jpg
mkdir -p /tmp/test-comics/漫画B/第1话
echo "test" > /tmp/test-comics/漫画B/第1话/001.jpg
```

添加库并扫描：
```bash
curl -X POST http://localhost:3000/api/libraries -H "Authorization: Bearer <token>" -H "Content-Type: application/json" -d '{"name":"测试库","path":"/tmp/test-comics"}'
curl -X POST http://localhost:3000/api/libraries/1/scan -H "Authorization: Bearer <token>"
```

- [ ] **步骤 5：Commit**

```bash
git add packages/server/src/services/scanner.ts packages/server/src/routes/scan.ts packages/server/src/index.ts
git commit -m "feat: add comic library scanner with single/series detection"
```

---

### 任务 7：漫画列表与详情 API

**文件：**
- 创建：`packages/server/src/routes/comics.ts`
- 修改：`packages/server/src/index.ts`

- [ ] **步骤 1：创建漫画路由**

```typescript
// packages/server/src/routes/comics.ts
import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import db from '../db/database.js';

const router = Router();

router.get('/', authMiddleware, (req: AuthRequest, res) => {
  const { library_id, status, tag, search, page = '1', limit = '20' } = req.query;
  const offset = (parseInt(page as string, 10) - 1) * parseInt(limit as string, 10);

  let query = 'SELECT c.* FROM comics c';
  const conditions: string[] = [];
  const params: any[] = [];

  if (library_id) {
    conditions.push('c.library_id = ?');
    params.push(library_id);
  }

  if (status) {
    conditions.push('c.status = ?');
    params.push(status);
  }

  if (search) {
    conditions.push('c.title LIKE ?');
    params.push(`%${search}%`);
  }

  if (tag) {
    query += ' JOIN comic_tags ct ON c.id = ct.comic_id JOIN tags t ON ct.tag_id = t.id';
    conditions.push('t.name = ?');
    params.push(tag);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  const countQuery = query.replace('SELECT c.*', 'SELECT COUNT(*) as count');
  const total = (db.prepare(countQuery).get(...params) as any).count;

  query += ' ORDER BY c.created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit as string, 10), offset);

  const comics = db.prepare(query).all(...params);
  res.json({ comics, total, page: parseInt(page as string, 10), limit: parseInt(limit as string, 10) });
});

router.get('/:id', authMiddleware, (req: AuthRequest, res) => {
  const { id } = req.params;
  const comic = db.prepare('SELECT * FROM comics WHERE id = ?').get(id);
  if (!comic) {
    res.status(404).json({ error: '漫画不存在' });
    return;
  }

  const tags = db.prepare(
    'SELECT t.* FROM tags t JOIN comic_tags ct ON t.id = ct.tag_id WHERE ct.comic_id = ?'
  ).all(id);

  const favorite = db.prepare('SELECT * FROM favorites WHERE comic_id = ?').get(id);

  res.json({ ...(comic as any), tags, favorite });
});

router.get('/:id/pages', authMiddleware, (req: AuthRequest, res) => {
  const { id } = req.params;
  const comic = db.prepare('SELECT * FROM comics WHERE id = ?').get(id) as any;
  if (!comic) {
    res.status(404).json({ error: '漫画不存在' });
    return;
  }

  if (comic.type !== 'single') {
    res.status(400).json({ error: '分集漫画请使用 episodes 接口' });
    return;
  }

  const fs = require('fs');
  const path = require('path');
  const images = fs.readdirSync(comic.path)
    .filter((f: string) => ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp'].includes(path.extname(f).toLowerCase()))
    .sort();

  res.json({ pages: images, total: images.length });
});

router.get('/:id/episodes', authMiddleware, (req: AuthRequest, res) => {
  const { id } = req.params;
  const episodes = db.prepare('SELECT * FROM episodes WHERE comic_id = ? ORDER BY sort_order').all(id);
  res.json(episodes);
});

router.get('/:id/episodes/:epId', authMiddleware, (req: AuthRequest, res) => {
  const { epId } = req.params;
  const episode = db.prepare('SELECT * FROM episodes WHERE id = ?').get(epId);
  if (!episode) {
    res.status(404).json({ error: '集数不存在' });
    return;
  }
  res.json(episode);
});

router.get('/:id/episodes/:epId/pages', authMiddleware, (req: AuthRequest, res) => {
  const { epId } = req.params;
  const episode = db.prepare('SELECT * FROM episodes WHERE id = ?').get(epId) as any;
  if (!episode) {
    res.status(404).json({ error: '集数不存在' });
    return;
  }

  const fs = require('fs');
  const path = require('path');
  const images = fs.readdirSync(episode.path)
    .filter((f: string) => ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp'].includes(path.extname(f).toLowerCase()))
    .sort();

  res.json({ pages: images, total: images.length });
});

export default router;
```

- [ ] **步骤 2：注册路由**

```typescript
// 在 packages/server/src/index.ts 中添加
import comicRoutes from './routes/comics.js';
app.use('/api/comics', comicRoutes);
```

- [ ] **步骤 3：验证**

```bash
curl http://localhost:3000/api/comics -H "Authorization: Bearer <token>"
curl http://localhost:3000/api/comics/1 -H "Authorization: Bearer <token>"
curl http://localhost:3000/api/comics/1/pages -H "Authorization: Bearer <token>"
```

- [ ] **步骤 4：Commit**

```bash
git add packages/server/src/routes/comics.ts packages/server/src/index.ts
git commit -m "feat: add comic list, detail, and pages API"
```

---

### 任务 8：图片服务（含缩略图与缩放）

**文件：**
- 创建：`packages/server/src/services/thumbnail.ts`
- 创建：`packages/server/src/routes/images.ts`
- 修改：`packages/server/src/index.ts`

- [ ] **步骤 1：创建缩略图服务**

```typescript
// packages/server/src/services/thumbnail.ts
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

fs.mkdirSync(config.thumbnailsDir, { recursive: true });

export async function getOrGenerateThumbnail(imagePath: string): Promise<Buffer> {
  const hash = Buffer.from(imagePath).toString('base64url');
  const thumbPath = path.join(config.thumbnailsDir, `${hash}.jpg`);

  if (fs.existsSync(thumbPath)) {
    return fs.readFileSync(thumbPath);
  }

  const buffer = await sharp(imagePath)
    .resize(300, 400, { fit: 'cover' })
    .jpeg({ quality: 80 })
    .toBuffer();

  fs.writeFileSync(thumbPath, buffer);
  return buffer;
}

export async function getResizedImage(imagePath: string, width: number): Promise<Buffer> {
  const hash = Buffer.from(`${imagePath}_${width}`).toString('base64url');
  const resizedDir = path.join(config.thumbnailsDir, 'resized');
  fs.mkdirSync(resizedDir, { recursive: true });
  const resizedPath = path.join(resizedDir, `${hash}.jpg`);

  if (fs.existsSync(resizedPath)) {
    return fs.readFileSync(resizedPath);
  }

  const buffer = await sharp(imagePath)
    .resize(width, null, { withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toBuffer();

  fs.writeFileSync(resizedPath, buffer);
  return buffer;
}
```

- [ ] **步骤 2：创建图片路由**

```typescript
// packages/server/src/routes/images.ts
import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import db from '../db/database.js';
import fs from 'fs';
import path from 'path';
import { getOrGenerateThumbnail, getResizedImage } from '../services/thumbnail.js';

const router = Router();
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp'];

function getImagesInDir(dirPath: string): string[] {
  return fs.readdirSync(dirPath)
    .filter(f => IMAGE_EXTENSIONS.includes(path.extname(f).toLowerCase()))
    .sort();
}

async function serveImage(res: Response, imagePath: string, width?: string) {
  if (!fs.existsSync(imagePath)) {
    res.status(404).json({ error: '图片不存在' });
    return;
  }

  if (width) {
    const buffer = await getResizedImage(imagePath, parseInt(width, 10));
    res.type('jpeg').send(buffer);
  } else {
    res.sendFile(imagePath);
  }
}

router.get('/:id/thumbnail', authMiddleware, async (req: AuthRequest, res) => {
  const { id } = req.params;
  const comic = db.prepare('SELECT * FROM comics WHERE id = ?').get(id) as any;
  if (!comic) {
    res.status(404).json({ error: '漫画不存在' });
    return;
  }

  const images = getImagesInDir(comic.path);
  if (images.length === 0) {
    res.status(404).json({ error: '漫画没有图片' });
    return;
  }

  const thumbPath = path.join(comic.path, images[0]);
  const buffer = await getOrGenerateThumbnail(thumbPath);
  res.type('jpeg').send(buffer);
});

router.get('/:id/pages/:num', authMiddleware, async (req: AuthRequest, res) => {
  const { id, num } = req.params;
  const { width } = req.query;
  const comic = db.prepare('SELECT * FROM comics WHERE id = ?').get(id) as any;
  if (!comic) {
    res.status(404).json({ error: '漫画不存在' });
    return;
  }

  if (comic.type !== 'single') {
    res.status(400).json({ error: '分集漫画请使用 episodes 接口' });
    return;
  }

  const images = getImagesInDir(comic.path);
  const pageIndex = parseInt(num, 10);
  if (pageIndex < 0 || pageIndex >= images.length) {
    res.status(404).json({ error: '页面不存在' });
    return;
  }

  const imagePath = path.join(comic.path, images[pageIndex]);
  await serveImage(res, imagePath, width as string | undefined);
});

router.get('/:id/episodes/:epId/thumbnail', authMiddleware, async (req: AuthRequest, res) => {
  const { epId } = req.params;
  const episode = db.prepare('SELECT * FROM episodes WHERE id = ?').get(epId) as any;
  if (!episode) {
    res.status(404).json({ error: '集数不存在' });
    return;
  }

  const images = getImagesInDir(episode.path);
  if (images.length === 0) {
    res.status(404).json({ error: '集没有图片' });
    return;
  }

  const thumbPath = path.join(episode.path, images[0]);
  const buffer = await getOrGenerateThumbnail(thumbPath);
  res.type('jpeg').send(buffer);
});

router.get('/:id/episodes/:epId/pages/:num', authMiddleware, async (req: AuthRequest, res) => {
  const { epId, num } = req.params;
  const { width } = req.query;
  const episode = db.prepare('SELECT * FROM episodes WHERE id = ?').get(epId) as any;
  if (!episode) {
    res.status(404).json({ error: '集数不存在' });
    return;
  }

  const images = getImagesInDir(episode.path);
  const pageIndex = parseInt(num, 10);
  if (pageIndex < 0 || pageIndex >= images.length) {
    res.status(404).json({ error: '页面不存在' });
    return;
  }

  const imagePath = path.join(episode.path, images[pageIndex]);
  await serveImage(res, imagePath, width as string | undefined);
});

export default router;
```

- [ ] **步骤 3：注册路由**

```typescript
// 在 packages/server/src/index.ts 中添加
import imageRoutes from './routes/images.js';
app.use('/api/comics', imageRoutes);
```

- [ ] **步骤 4：验证**

```bash
curl http://localhost:3000/api/comics/1/thumbnail -H "Authorization: Bearer <token>" -o thumb.jpg
curl "http://localhost:3000/api/comics/1/pages/0?width=800" -H "Authorization: Bearer <token>" -o page.jpg
```

- [ ] **步骤 5：Commit**

```bash
git add packages/server/src/services/thumbnail.ts packages/server/src/routes/images.ts packages/server/src/index.ts
git commit -m "feat: add image serving with thumbnail generation and resize"
```

---

### 任务 9：阅读进度与收藏 API

**文件：**
- 创建：`packages/server/src/routes/progress.ts`
- 修改：`packages/server/src/index.ts`

- [ ] **步骤 1：创建进度路由**

```typescript
// packages/server/src/routes/progress.ts
import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import db from '../db/database.js';

const router = Router();

router.get('/:id/progress', authMiddleware, (req: AuthRequest, res) => {
  const { id } = req.params;
  const progress = db.prepare(
    'SELECT * FROM reading_progress WHERE comic_id = ? AND episode_id IS NULL'
  ).get(id);
  res.json(progress || { current_page: 0, scroll_position: 0, is_completed: 0 });
});

router.put('/:id/progress', authMiddleware, (req: AuthRequest, res) => {
  const { id } = req.params;
  const { current_page, scroll_position, is_completed } = req.body;

  db.prepare(`
    INSERT INTO reading_progress (comic_id, episode_id, current_page, scroll_position, is_completed, updated_at)
    VALUES (?, NULL, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(comic_id, episode_id) DO UPDATE SET
      current_page = excluded.current_page,
      scroll_position = excluded.scroll_position,
      is_completed = excluded.is_completed,
      updated_at = CURRENT_TIMESTAMP
  `).run(id, current_page || 0, scroll_position || 0, is_completed ? 1 : 0);

  res.json({ success: true });
});

router.get('/:id/episodes/:epId/progress', authMiddleware, (req: AuthRequest, res) => {
  const { id, epId } = req.params;
  const progress = db.prepare(
    'SELECT * FROM reading_progress WHERE comic_id = ? AND episode_id = ?'
  ).get(id, epId);
  res.json(progress || { current_page: 0, scroll_position: 0, is_completed: 0 });
});

router.put('/:id/episodes/:epId/progress', authMiddleware, (req: AuthRequest, res) => {
  const { id, epId } = req.params;
  const { current_page, scroll_position, is_completed } = req.body;

  db.prepare(`
    INSERT INTO reading_progress (comic_id, episode_id, current_page, scroll_position, is_completed, updated_at)
    VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(comic_id, episode_id) DO UPDATE SET
      current_page = excluded.current_page,
      scroll_position = excluded.scroll_position,
      is_completed = excluded.is_completed,
      updated_at = CURRENT_TIMESTAMP
  `).run(id, epId, current_page || 0, scroll_position || 0, is_completed ? 1 : 0);

  res.json({ success: true });
});

router.put('/:id/favorite', authMiddleware, (req: AuthRequest, res) => {
  const { id } = req.params;

  const existing = db.prepare('SELECT * FROM favorites WHERE comic_id = ?').get(id) as any;
  if (existing) {
    db.prepare('UPDATE favorites SET is_favorite = ?, updated_at = CURRENT_TIMESTAMP WHERE comic_id = ?')
      .run(existing.is_favorite ? 0 : 1, id);
  } else {
    db.prepare('INSERT INTO favorites (comic_id, is_favorite) VALUES (?, 1)').run(id);
  }

  res.json({ success: true });
});

router.put('/:id/rating', authMiddleware, (req: AuthRequest, res) => {
  const { id } = req.params;
  const { rating } = req.body;

  if (rating && (rating < 1 || rating > 5)) {
    res.status(400).json({ error: '评分必须在 1-5 之间' });
    return;
  }

  const existing = db.prepare('SELECT * FROM favorites WHERE comic_id = ?').get(id) as any;
  if (existing) {
    db.prepare('UPDATE favorites SET rating = ?, updated_at = CURRENT_TIMESTAMP WHERE comic_id = ?')
      .run(rating, id);
  } else {
    db.prepare('INSERT INTO favorites (comic_id, rating) VALUES (?, ?)').run(id, rating);
  }

  res.json({ success: true });
});

export default router;
```

- [ ] **步骤 2：注册路由**

```typescript
// 在 packages/server/src/index.ts 中添加
import progressRoutes from './routes/progress.js';
app.use('/api/comics', progressRoutes);
```

- [ ] **步骤 3：Commit**

```bash
git add packages/server/src/routes/progress.ts packages/server/src/index.ts
git commit -m "feat: add reading progress and favorites API"
```

---

### 任务 10：标签管理 API

**文件：**
- 创建：`packages/server/src/routes/tags.ts`
- 修改：`packages/server/src/index.ts`

- [ ] **步骤 1：创建标签路由**

```typescript
// packages/server/src/routes/tags.ts
import { Router } from 'express';
import { authMiddleware, requireRole, AuthRequest } from '../middleware/auth.js';
import db from '../db/database.js';

const router = Router();

router.get('/', authMiddleware, (_req: AuthRequest, res) => {
  const tags = db.prepare('SELECT * FROM tags ORDER BY name').all();
  res.json(tags);
});

router.post('/', authMiddleware, requireRole('admin', 'editor'), (req: AuthRequest, res) => {
  const { name, color } = req.body;
  if (!name) {
    res.status(400).json({ error: '标签名不能为空' });
    return;
  }

  try {
    const result = db.prepare('INSERT INTO tags (name, color) VALUES (?, ?)').run(name, color || '#666666');
    res.json({ id: result.lastInsertRowid, name, color: color || '#666666' });
  } catch (err: any) {
    if (err.message?.includes('UNIQUE')) {
      res.status(400).json({ error: '标签已存在' });
    } else {
      res.status(500).json({ error: '创建失败' });
    }
  }
});

router.put('/:id', authMiddleware, requireRole('admin', 'editor'), (req: AuthRequest, res) => {
  const { id } = req.params;
  const { name, color } = req.body;

  db.prepare('UPDATE tags SET name = COALESCE(?, name), color = COALESCE(?, color) WHERE id = ?')
    .run(name, color, id);

  res.json({ success: true });
});

router.delete('/:id', authMiddleware, requireRole('admin', 'editor'), (req: AuthRequest, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM tags WHERE id = ?').run(id);
  res.json({ success: true });
});

router.post('/:comicId/tags', authMiddleware, requireRole('admin', 'editor'), (req: AuthRequest, res) => {
  const { comicId } = req.params;
  const { tag_id } = req.body;

  if (!tag_id) {
    res.status(400).json({ error: 'tag_id 不能为空' });
    return;
  }

  try {
    db.prepare('INSERT INTO comic_tags (comic_id, tag_id) VALUES (?, ?)').run(comicId, tag_id);
    res.json({ success: true });
  } catch {
    res.status(400).json({ error: '标签已添加或不存在' });
  }
});

router.delete('/:comicId/tags/:tagId', authMiddleware, requireRole('admin', 'editor'), (req: AuthRequest, res) => {
  const { comicId, tagId } = req.params;
  db.prepare('DELETE FROM comic_tags WHERE comic_id = ? AND tag_id = ?').run(comicId, tagId);
  res.json({ success: true });
});

export default router;
```

- [ ] **步骤 2：注册路由**

```typescript
// 在 packages/server/src/index.ts 中添加
import tagRoutes from './routes/tags.js';
app.use('/api/tags', tagRoutes);
app.use('/api/comics', tagRoutes);
```

- [ ] **步骤 3：Commit**

```bash
git add packages/server/src/routes/tags.ts packages/server/src/index.ts
git commit -m "feat: add tag management API"
```

---

### 任务 11：前端路由与布局骨架

**文件：**
- 修改：`packages/client/src/router/index.ts`
- 创建：`packages/client/src/views/LoginView.vue`
- 创建：`packages/client/src/views/RegisterView.vue`
- 创建：`packages/client/src/views/HomeView.vue`
- 创建：`packages/client/src/views/LibraryView.vue`
- 创建：`packages/client/src/views/ComicDetailView.vue`
- 创建：`packages/client/src/views/ReaderView.vue`
- 创建：`packages/client/src/views/TagsView.vue`
- 创建：`packages/client/src/views/SettingsView.vue`
- 创建：`packages/client/src/views/admin/UsersView.vue`
- 创建：`packages/client/src/views/admin/InviteCodesView.vue`
- 创建：`packages/client/src/components/AppLayout.vue`
- 创建：`packages/client/src/styles/main.css`

- [ ] **步骤 1：创建全局样式**

```css
/* packages/client/src/styles/main.css */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --primary: #4a90d9;
  --primary-dark: #357abd;
  --bg: #f5f5f5;
  --bg-card: #ffffff;
  --text: #333333;
  --text-secondary: #666666;
  --border: #e0e0e0;
  --danger: #e74c3c;
  --success: #2ecc71;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: var(--bg);
  color: var(--text);
  line-height: 1.6;
}

a {
  color: var(--primary);
  text-decoration: none;
}

button {
  cursor: pointer;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
}

.btn-primary {
  background-color: var(--primary);
  color: white;
}

.btn-primary:hover {
  background-color: var(--primary-dark);
}

.btn-danger {
  background-color: var(--danger);
  color: white;
}

input, select {
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 14px;
  outline: none;
}

input:focus, select:focus {
  border-color: var(--primary);
}
```

- [ ] **步骤 2：更新 main.ts 引入样式**

```typescript
// packages/client/src/main.ts
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import './styles/main.css';

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.mount('#app');
```

- [ ] **步骤 3：创建路由配置**

```typescript
// packages/client/src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', component: () => import('@/views/LoginView.vue') },
    { path: '/register', component: () => import('@/views/RegisterView.vue') },
    {
      path: '/',
      component: () => import('@/components/AppLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        { path: '', component: () => import('@/views/HomeView.vue') },
        { path: 'library', component: () => import('@/views/LibraryView.vue') },
        { path: 'library/:id', component: () => import('@/views/LibraryView.vue') },
        { path: 'comic/:id', component: () => import('@/views/ComicDetailView.vue') },
        { path: 'comic/:id/read', component: () => import('@/views/ReaderView.vue') },
        { path: 'comic/:id/episodes', component: () => import('@/views/ComicDetailView.vue') },
        { path: 'comic/:id/episodes/:epId/read', component: () => import('@/views/ReaderView.vue') },
        { path: 'tags', component: () => import('@/views/TagsView.vue') },
        { path: 'settings', component: () => import('@/views/SettingsView.vue') },
        { path: 'admin/users', component: () => import('@/views/admin/UsersView.vue') },
        { path: 'admin/invite-codes', component: () => import('@/views/admin/InviteCodesView.vue') },
      ],
    },
  ],
});

router.beforeEach((to) => {
  const authStore = useAuthStore();
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return '/login';
  }
});

export default router;
```

- [ ] **步骤 4：创建页面骨架（每个页面一个简单占位）**

```vue
<!-- packages/client/src/views/LoginView.vue -->
<template>
  <div class="login-page">
    <h1>登录</h1>
    <form @submit.prevent="handleLogin">
      <input v-model="username" placeholder="用户名" required />
      <input v-model="password" type="password" placeholder="密码" required />
      <button type="submit" class="btn-primary">登录</button>
    </form>
    <p>没有账号？<router-link to="/register">注册</router-link></p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const username = ref('');
const password = ref('');
const router = useRouter();
const authStore = useAuthStore();

async function handleLogin() {
  await authStore.login(username.value, password.value);
  router.push('/');
}
</script>
```

```vue
<!-- packages/client/src/views/RegisterView.vue -->
<template>
  <div class="login-page">
    <h1>注册</h1>
    <form @submit.prevent="handleRegister">
      <input v-model="username" placeholder="用户名" required />
      <input v-model="password" type="password" placeholder="密码" required />
      <input v-model="inviteCode" placeholder="授权码" required />
      <button type="submit" class="btn-primary">注册</button>
    </form>
    <p>已有账号？<router-link to="/login">登录</router-link></p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const username = ref('');
const password = ref('');
const inviteCode = ref('');
const router = useRouter();
const authStore = useAuthStore();

async function handleRegister() {
  await authStore.register(username.value, password.value, inviteCode.value);
  router.push('/');
}
</script>
```

```vue
<!-- packages/client/src/components/AppLayout.vue -->
<template>
  <div class="app-layout">
    <nav class="sidebar">
      <h2>漫画阅读器</h2>
      <router-link to="/">书架</router-link>
      <router-link to="/library">漫画库</router-link>
      <router-link to="/tags">标签</router-link>
      <router-link to="/settings">设置</router-link>
      <router-link v-if="authStore.user?.role === 'admin'" to="/admin/users">用户管理</router-link>
      <button @click="authStore.logout()">退出</button>
    </nav>
    <main class="content">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
const authStore = useAuthStore();
</script>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
}
.sidebar {
  width: 200px;
  background: var(--bg-card);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-right: 1px solid var(--border);
}
.content {
  flex: 1;
  padding: 20px;
}
</style>
```

其余页面骨架（HomeView、LibraryView、ComicDetailView、ReaderView、TagsView、SettingsView、UsersView、InviteCodesView）均创建为包含标题的简单占位组件。

- [ ] **步骤 5：Commit**

```bash
git add packages/client/
git commit -m "feat: add frontend routing and layout skeleton"
```

---

### 任务 12：前端认证 Store 与 API 工具

**文件：**
- 创建：`packages/client/src/stores/auth.ts`
- 创建：`packages/client/src/utils/api.ts`

- [ ] **步骤 1：创建 API 工具**

```typescript
// packages/client/src/utils/api.ts
const BASE_URL = '/api';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
    throw new Error('未登录');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: '请求失败' }));
    throw new Error(error.error || '请求失败');
  }

  return response.json();
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: any) => request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body?: any) => request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
```

- [ ] **步骤 2：创建认证 Store**

```typescript
// packages/client/src/stores/auth.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from '@/utils/api';

interface User {
  id: number;
  username: string;
  role: string;
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || '');
  const user = ref<User | null>(null);

  const isAuthenticated = computed(() => !!token.value);

  async function login(username: string, password: string) {
    const result = await api.post<{ token: string; user: User }>('/auth/login', { username, password });
    token.value = result.token;
    user.value = result.user;
    localStorage.setItem('token', result.token);
  }

  async function register(username: string, password: string, inviteCode: string) {
    const result = await api.post<{ token: string; user: User }>('/auth/register', {
      username,
      password,
      invite_code: inviteCode,
    });
    token.value = result.token;
    user.value = result.user;
    localStorage.setItem('token', result.token);
  }

  async function fetchUser() {
    if (!token.value) return;
    try {
      const result = await api.get<{ user: User }>('/auth/me');
      user.value = result.user;
    } catch {
      token.value = '';
      localStorage.removeItem('token');
    }
  }

  function logout() {
    token.value = '';
    user.value = null;
    localStorage.removeItem('token');
  }

  return { token, user, isAuthenticated, login, register, fetchUser, logout };
});
```

- [ ] **步骤 3：Commit**

```bash
git add packages/client/src/utils/ packages/client/src/stores/
git commit -m "feat: add API utility and auth store"
```

---

### 任务 13：漫画列表页面

**文件：**
- 修改：`packages/client/src/views/HomeView.vue`
- 修改：`packages/client/src/views/LibraryView.vue`
- 创建：`packages/client/src/components/ComicCard.vue`
- 创建：`packages/client/src/stores/comic.ts`

- [ ] **步骤 1：创建漫画 Store**

```typescript
// packages/client/src/stores/comic.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '@/utils/api';

interface Comic {
  id: number;
  library_id: number;
  title: string;
  path: string;
  type: 'single' | 'series';
  page_count: number;
  episode_count: number;
  status: string;
}

interface ComicsResponse {
  comics: Comic[];
  total: number;
  page: number;
  limit: number;
}

export const useComicStore = defineStore('comic', () => {
  const comics = ref<Comic[]>([]);
  const total = ref(0);
  const currentComic = ref<any>(null);

  async function fetchComics(params?: { library_id?: number; status?: string; search?: string; page?: number }) {
    const query = new URLSearchParams();
    if (params?.library_id) query.set('library_id', String(params.library_id));
    if (params?.status) query.set('status', params.status);
    if (params?.search) query.set('search', params.search);
    if (params?.page) query.set('page', String(params.page));

    const result = await api.get<ComicsResponse>(`/comics?${query}`);
    comics.value = result.comics;
    total.value = result.total;
  }

  async function fetchComic(id: number) {
    currentComic.value = await api.get(`/comics/${id}`);
  }

  async function toggleFavorite(id: number) {
    await api.put(`/comics/${id}/favorite`);
  }

  return { comics, total, currentComic, fetchComics, fetchComic, toggleFavorite };
});
```

- [ ] **步骤 2：创建漫画卡片组件**

```vue
<!-- packages/client/src/components/ComicCard.vue -->
<template>
  <div class="comic-card" @click="$router.push(`/comic/${comic.id}`)">
    <div class="cover">
      <img :src="`/api/comics/${comic.id}/thumbnail`" :alt="comic.title" loading="lazy" />
      <span v-if="comic.type === 'series'" class="badge">{{ comic.episode_count }}集</span>
    </div>
    <div class="info">
      <h3>{{ comic.title }}</h3>
      <p>{{ comic.type === 'single' ? `${comic.page_count}页` : `${comic.episode_count}集` }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  comic: {
    id: number;
    title: string;
    type: 'single' | 'series';
    page_count: number;
    episode_count: number;
  };
}>();
</script>

<style scoped>
.comic-card {
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
  background: var(--bg-card);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}
.comic-card:hover {
  transform: translateY(-4px);
}
.cover {
  position: relative;
  aspect-ratio: 3/4;
  overflow: hidden;
}
.cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: var(--primary);
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}
.info {
  padding: 12px;
}
.info h3 {
  font-size: 14px;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.info p {
  font-size: 12px;
  color: var(--text-secondary);
}
</style>
```

- [ ] **步骤 3：更新 LibraryView**

```vue
<!-- packages/client/src/views/LibraryView.vue -->
<template>
  <div class="library-view">
    <div class="header">
      <h1>漫画库</h1>
      <div class="actions">
        <input v-model="search" placeholder="搜索漫画..." @input="debouncedSearch" />
      </div>
    </div>
    <div class="comics-grid">
      <ComicCard v-for="comic in comicStore.comics" :key="comic.id" :comic="comic" />
      <p v-if="comicStore.comics.length === 0" class="empty">暂无漫画</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useComicStore } from '@/stores/comic';
import ComicCard from '@/components/ComicCard.vue';

const comicStore = useComicStore();
const search = ref('');
let debounceTimer: number;

function debouncedSearch() {
  clearTimeout(debounceTimer);
  debounceTimer = window.setTimeout(() => {
    comicStore.fetchComics({ search: search.value });
  }, 300);
}

onMounted(() => {
  comicStore.fetchComics();
});
</script>

<style scoped>
.library-view {
  max-width: 1200px;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.comics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
}
.empty {
  grid-column: 1 / -1;
  text-align: center;
  color: var(--text-secondary);
  padding: 40px;
}

@media (max-width: 768px) {
  .comics-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
}
</style>
```

- [ ] **步骤 4：Commit**

```bash
git add packages/client/src/
git commit -m "feat: add comic list page with grid layout and search"
```

---

### 任务 14：漫画详情页面

**文件：**
- 修改：`packages/client/src/views/ComicDetailView.vue`

- [ ] **步骤 1：实现详情页**

```vue
<!-- packages/client/src/views/ComicDetailView.vue -->
<template>
  <div class="comic-detail" v-if="comic">
    <div class="detail-header">
      <img :src="`/api/comics/${comic.id}/thumbnail`" class="cover" />
      <div class="info">
        <h1>{{ comic.title }}</h1>
        <p class="type">{{ comic.type === 'single' ? '单体漫画' : '分集漫画' }}</p>
        <p class="pages">{{ comic.type === 'single' ? `${comic.page_count}页` : `${comic.episode_count}集` }}</p>
        <div class="tags" v-if="comic.tags?.length">
          <span v-for="tag in comic.tags" :key="tag.id" class="tag" :style="{ background: tag.color }">
            {{ tag.name }}
          </span>
        </div>
        <div class="actions">
          <button class="btn-primary" @click="startReading">
            {{ comic.type === 'single' ? '开始阅读' : '查看集数' }}
          </button>
          <button @click="toggleFavorite">
            {{ comic.favorite?.is_favorite ? '取消收藏' : '收藏' }}
          </button>
        </div>
      </div>
    </div>
    <div v-if="comic.type === 'series'" class="episodes">
      <h2>集数列表</h2>
      <div class="episode-list">
        <div v-for="ep in episodes" :key="ep.id" class="episode-item" @click="readEpisode(ep.id)">
          <span>{{ ep.title }}</span>
          <span class="ep-pages">{{ ep.page_count }}页</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { api } from '@/utils/api';
import { useComicStore } from '@/stores/comic';

const route = useRoute();
const router = useRouter();
const comicStore = useComicStore();
const comic = ref<any>(null);
const episodes = ref<any[]>([]);

onMounted(async () => {
  const id = Number(route.params.id);
  await comicStore.fetchComic(id);
  comic.value = comicStore.currentComic;

  if (comic.value?.type === 'series') {
    episodes.value = await api.get(`/comics/${id}/episodes`);
  }
});

function startReading() {
  if (comic.value.type === 'single') {
    router.push(`/comic/${comic.value.id}/read`);
  }
}

function readEpisode(epId: number) {
  router.push(`/comic/${comic.value.id}/episodes/${epId}/read`);
}

async function toggleFavorite() {
  await comicStore.toggleFavorite(comic.value.id);
  await comicStore.fetchComic(comic.value.id);
  comic.value = comicStore.currentComic;
}
</script>

<style scoped>
.detail-header {
  display: flex;
  gap: 24px;
  margin-bottom: 32px;
}
.cover {
  width: 200px;
  height: 280px;
  object-fit: cover;
  border-radius: 8px;
}
.info h1 {
  margin-bottom: 8px;
}
.type, .pages {
  color: var(--text-secondary);
  margin-bottom: 4px;
}
.tags {
  display: flex;
  gap: 8px;
  margin: 12px 0;
  flex-wrap: wrap;
}
.tag {
  padding: 2px 10px;
  border-radius: 12px;
  color: white;
  font-size: 12px;
}
.actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}
.episode-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.episode-item {
  display: flex;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--bg-card);
  border-radius: 8px;
  cursor: pointer;
}
.episode-item:hover {
  background: var(--border);
}
.ep-pages {
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .detail-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  .tags, .actions {
    justify-content: center;
  }
}
</style>
```

- [ ] **步骤 2：Commit**

```bash
git add packages/client/src/views/ComicDetailView.vue
git commit -m "feat: add comic detail page with episodes list"
```

---

### 任务 15：阅读器核心

**文件：**
- 修改：`packages/client/src/views/ReaderView.vue`
- 创建：`packages/client/src/stores/reader.ts`

- [ ] **步骤 1：创建阅读器 Store**

```typescript
// packages/client/src/stores/reader.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '@/utils/api';

export const useReaderStore = defineStore('reader', () => {
  const pages = ref<string[]>([]);
  const currentPage = ref(0);
  const scrollPosition = ref(0);
  const isDarkMode = ref(false);

  async function loadPages(comicId: number, episodeId?: number) {
    const url = episodeId
      ? `/comics/${comicId}/episodes/${episodeId}/pages`
      : `/comics/${comicId}/pages`;
    const result = await api.get<{ pages: string[] }>(url);
    pages.value = result.pages;
  }

  async function loadProgress(comicId: number, episodeId?: number) {
    const url = episodeId
      ? `/comics/${comicId}/episodes/${episodeId}/progress`
      : `/comics/${comicId}/progress`;
    const result = await api.get<any>(url);
    currentPage.value = result.current_page || 0;
    scrollPosition.value = result.scroll_position || 0;
  }

  async function saveProgress(comicId: number, episodeId?: number) {
    const url = episodeId
      ? `/comics/${comicId}/episodes/${episodeId}/progress`
      : `/comics/${comicId}/progress`;
    await api.put(url, {
      current_page: currentPage.value,
      scroll_position: scrollPosition.value,
    });
  }

  function toggleDarkMode() {
    isDarkMode.value = !isDarkMode.value;
  }

  return { pages, currentPage, scrollPosition, isDarkMode, loadPages, loadProgress, saveProgress, toggleDarkMode };
});
```

- [ ] **步骤 2：实现阅读器页面**

```vue
<!-- packages/client/src/views/ReaderView.vue -->
<template>
  <div class="reader" :class="{ dark: readerStore.isDarkMode }">
    <div class="toolbar" v-show="showToolbar" @click.stop>
      <button @click="goBack">返回</button>
      <span class="title">{{ comicTitle }}</span>
      <span class="page-info">{{ readerStore.currentPage + 1 }} / {{ readerStore.pages.length }}</span>
      <button @click="readerStore.toggleDarkMode()">
        {{ readerStore.isDarkMode ? '浅色' : '深色' }}
      </button>
    </div>

    <div class="pages-container" ref="containerRef" @click="toggleToolbar" @scroll="onScroll">
      <div
        v-for="(page, index) in readerStore.pages"
        :key="index"
        class="page-wrapper"
        :data-index="index"
      >
        <img
          v-if="shouldLoadImage(index)"
          :src="getImageUrl(index)"
          :alt="`Page ${index + 1}`"
          loading="lazy"
          @error="handleImageError($event, index)"
        />
        <div v-else class="page-placeholder"></div>
      </div>
    </div>

    <div class="progress-bar">
      <input
        type="range"
        :min="0"
        :max="readerStore.pages.length - 1"
        :value="readerStore.currentPage"
        @input="jumpToPage"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useReaderStore } from '@/stores/reader';
import { useComicStore } from '@/stores/comic';

const route = useRoute();
const router = useRouter();
const readerStore = useReaderStore();
const comicStore = useComicStore();

const containerRef = ref<HTMLElement>();
const showToolbar = ref(false);
const comicTitle = ref('');

const comicId = computed(() => Number(route.params.id));
const episodeId = computed(() => route.params.epId ? Number(route.params.epId) : undefined);

let saveTimer: number;

function getImageUrl(index: number): string {
  const base = episodeId.value
    ? `/api/comics/${comicId.value}/episodes/${episodeId.value}/pages/${index}`
    : `/api/comics/${comicId.value}/pages/${index}`;
  const width = window.innerWidth < 768 ? window.innerWidth : undefined;
  return width ? `${base}?width=${width}` : base;
}

function shouldLoadImage(index: number): boolean {
  const diff = Math.abs(index - readerStore.currentPage);
  return diff <= 3;
}

function toggleToolbar() {
  showToolbar.value = !showToolbar.value;
}

function goBack() {
  router.push(`/comic/${comicId.value}`);
}

function onScroll() {
  if (!containerRef.value) return;
  const scrollTop = containerRef.value.scrollTop;
  const scrollHeight = containerRef.value.scrollHeight - containerRef.value.clientHeight;
  readerStore.scrollPosition = scrollTop / scrollHeight;

  const pages = containerRef.value.querySelectorAll('.page-wrapper');
  for (let i = 0; i < pages.length; i++) {
    const rect = pages[i].getBoundingClientRect();
    if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
      readerStore.currentPage = i;
      break;
    }
  }

  clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => {
    readerStore.saveProgress(comicId.value, episodeId.value);
  }, 1000);
}

function jumpToPage(e: Event) {
  const target = e.target as HTMLInputElement;
  const page = parseInt(target.value, 10);
  readerStore.currentPage = page;
  const pageEl = containerRef.value?.querySelector(`[data-index="${page}"]`);
  pageEl?.scrollIntoView({ behavior: 'smooth' });
}

function handleImageError(e: Event, index: number) {
  const img = e.target as HTMLImageElement;
  setTimeout(() => {
    img.src = getImageUrl(index);
  }, 2000);
}

onMounted(async () => {
  await comicStore.fetchComic(comicId.value);
  comicTitle.value = comicStore.currentComic?.title || '';
  await readerStore.loadPages(comicId.value, episodeId.value);
  await readerStore.loadProgress(comicId.value, episodeId.value);

  if (readerStore.currentPage > 0) {
    setTimeout(() => {
      const pageEl = containerRef.value?.querySelector(`[data-index="${readerStore.currentPage}"]`);
      pageEl?.scrollIntoView();
    }, 100);
  }
});

onUnmounted(() => {
  clearTimeout(saveTimer);
  readerStore.saveProgress(comicId.value, episodeId.value);
});
</script>

<style scoped>
.reader {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: white;
  display: flex;
  flex-direction: column;
}
.reader.dark {
  background: #1a1a1a;
}
.toolbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 16px;
}
.title {
  flex: 1;
  text-align: center;
}
.pages-container {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}
.page-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
.page-wrapper img {
  max-width: 100%;
  height: auto;
}
.page-placeholder {
  width: 100%;
  height: 100vh;
  background: #f0f0f0;
}
.progress-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 8px 16px;
  background: rgba(0, 0, 0, 0.5);
}
.progress-bar input {
  width: 100%;
}
</style>
```

- [ ] **步骤 3：Commit**

```bash
git add packages/client/src/views/ReaderView.vue packages/client/src/stores/reader.ts
git commit -m "feat: add comic reader with scroll mode and progress tracking"
```

---

## 阶段 P2：管理功能

### 任务 16：标签管理页面

**文件：**
- 修改：`packages/client/src/views/TagsView.vue`
- 创建：`packages/client/src/stores/tag.ts`

- [ ] **步骤 1：创建标签 Store**

```typescript
// packages/client/src/stores/tag.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '@/utils/api';

interface Tag {
  id: number;
  name: string;
  color: string;
}

export const useTagStore = defineStore('tag', () => {
  const tags = ref<Tag[]>([]);

  async function fetchTags() {
    tags.value = await api.get<Tag[]>('/tags');
  }

  async function createTag(name: string, color: string) {
    await api.post('/tags', { name, color });
    await fetchTags();
  }

  async function updateTag(id: number, name: string, color: string) {
    await api.put(`/tags/${id}`, { name, color });
    await fetchTags();
  }

  async function deleteTag(id: number) {
    await api.delete(`/tags/${id}`);
    await fetchTags();
  }

  return { tags, fetchTags, createTag, updateTag, deleteTag };
});
```

- [ ] **步骤 2：实现标签管理页面**

```vue
<!-- packages/client/src/views/TagsView.vue -->
<template>
  <div class="tags-view">
    <h1>标签管理</h1>
    <div class="create-form">
      <input v-model="newName" placeholder="标签名称" />
      <input v-model="newColor" type="color" />
      <button class="btn-primary" @click="createTag">创建</button>
    </div>
    <div class="tag-list">
      <div v-for="tag in tagStore.tags" :key="tag.id" class="tag-item">
        <span class="tag-color" :style="{ background: tag.color }"></span>
        <span class="tag-name">{{ tag.name }}</span>
        <button @click="tagStore.deleteTag(tag.id)" class="btn-danger">删除</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useTagStore } from '@/stores/tag';

const tagStore = useTagStore();
const newName = ref('');
const newColor = ref('#4a90d9');

async function createTag() {
  if (!newName.value) return;
  await tagStore.createTag(newName.value, newColor.value);
  newName.value = '';
}

onMounted(() => {
  tagStore.fetchTags();
});
</script>

<style scoped>
.tags-view {
  max-width: 600px;
}
.create-form {
  display: flex;
  gap: 12px;
  margin: 20px 0;
}
.tag-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.tag-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--bg-card);
  border-radius: 8px;
}
.tag-color {
  width: 24px;
  height: 24px;
  border-radius: 50%;
}
.tag-name {
  flex: 1;
}
</style>
```

- [ ] **步骤 3：Commit**

```bash
git add packages/client/src/views/TagsView.vue packages/client/src/stores/tag.ts
git commit -m "feat: add tag management page"
```

---

### 任务 17：首页书架

**文件：**
- 修改：`packages/client/src/views/HomeView.vue`

- [ ] **步骤 1：实现首页书架**

```vue
<!-- packages/client/src/views/HomeView.vue -->
<template>
  <div class="home-view">
    <section class="section">
      <h2>收藏的漫画</h2>
      <div class="comics-grid">
        <ComicCard v-for="comic in favorites" :key="comic.id" :comic="comic" />
        <p v-if="favorites.length === 0" class="empty">暂无收藏</p>
      </div>
    </section>

    <section class="section">
      <h2>最近阅读</h2>
      <div class="comics-grid">
        <ComicCard v-for="comic in recentlyRead" :key="comic.id" :comic="comic" />
        <p v-if="recentlyRead.length === 0" class="empty">暂无阅读记录</p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api } from '@/utils/api';
import ComicCard from '@/components/ComicCard.vue';

const favorites = ref<any[]>([]);
const recentlyRead = ref<any[]>([]);

onMounted(async () => {
  const result = await api.get<any>('/comics?limit=10');
  favorites.value = result.comics.filter((c: any) => c.favorite?.is_favorite);
  recentlyRead.value = result.comics;
});
</script>

<style scoped>
.section {
  margin-bottom: 32px;
}
.section h2 {
  margin-bottom: 16px;
}
.comics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
}
.empty {
  grid-column: 1 / -1;
  text-align: center;
  color: var(--text-secondary);
  padding: 40px;
}
</style>
```

- [ ] **步骤 2：Commit**

```bash
git add packages/client/src/views/HomeView.vue
git commit -m "feat: add home page bookshelf with favorites and recent reads"
```

---

## 阶段 P3：导入功能

### 任务 18：ZIP 上传与下载 API

**文件：**
- 创建：`packages/server/src/services/importer.ts`
- 创建：`packages/server/src/services/task-queue.ts`
- 创建：`packages/server/src/routes/import.ts`
- 修改：`packages/server/src/index.ts`

- [ ] **步骤 1：创建任务队列**

```typescript
// packages/server/src/services/task-queue.ts
import { randomUUID } from 'crypto';

interface Task {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  result?: any;
  error?: string;
}

const tasks = new Map<string, Task>();

export function createTask(): string {
  const id = randomUUID();
  tasks.set(id, { id, status: 'pending', progress: 0 });
  return id;
}

export function updateTask(id: string, updates: Partial<Task>): void {
  const task = tasks.get(id);
  if (task) {
    Object.assign(task, updates);
  }
}

export function getTask(id: string): Task | undefined {
  return tasks.get(id);
}
```

- [ ] **步骤 2：创建导入服务**

```typescript
// packages/server/src/services/importer.ts
import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';
import db from '../db/database.js';
import { createTask, updateTask } from './task-queue.js';

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp'];

export function importZip(zipPath: string, libraryId: number, title?: string): string {
  const taskId = createTask();

  setTimeout(async () => {
    try {
      updateTask(taskId, { status: 'running', progress: 10 });

      const library = db.prepare('SELECT * FROM libraries WHERE id = ?').get(libraryId) as any;
      if (!library) throw new Error('漫画库不存在');

      const zip = new AdmZip(zipPath);
      const entries = zip.getEntries();

      const comicTitle = title || path.basename(zipPath, path.extname(zipPath));
      const comicDir = path.join(library.path, comicTitle);
      fs.mkdirSync(comicDir, { recursive: true });

      updateTask(taskId, { progress: 30 });

      const imageEntries = entries.filter(e => {
        const ext = path.extname(e.entryName).toLowerCase();
        return IMAGE_EXTENSIONS.includes(ext) && !e.isDirectory;
      });

      for (let i = 0; i < imageEntries.length; i++) {
        const entry = imageEntries[i];
        const fileName = path.basename(entry.entryName);
        const destPath = path.join(comicDir, fileName);
        fs.writeFileSync(destPath, entry.getData());
        updateTask(taskId, { progress: 30 + Math.floor((i / imageEntries.length) * 50) });
      }

      updateTask(taskId, { progress: 80 });

      const result = db.prepare(
        'INSERT INTO comics (library_id, title, path, type, page_count) VALUES (?, ?, ?, ?, ?)'
      ).run(libraryId, comicTitle, comicDir, 'single', imageEntries.length);

      updateTask(taskId, { status: 'completed', progress: 100, result: { comicId: result.lastInsertRowid } });
    } catch (err: any) {
      updateTask(taskId, { status: 'failed', error: err.message });
    }
  }, 0);

  return taskId;
}

export async function downloadAndImport(url: string, libraryId: number, title?: string): Promise<string> {
  const taskId = createTask();

  setTimeout(async () => {
    try {
      updateTask(taskId, { status: 'running', progress: 5 });

      const response = await fetch(url);
      if (!response.ok) throw new Error(`下载失败: ${response.status}`);

      const buffer = Buffer.from(await response.arrayBuffer());
      const tempPath = path.join(process.env.TEMP || '/tmp', `comic-${Date.now()}.zip`);
      fs.writeFileSync(tempPath, buffer);

      updateTask(taskId, { progress: 30 });

      const importTaskId = importZip(tempPath, libraryId, title);

      const checkImport = setInterval(() => {
        const importTask = getTask(importTaskId);
        if (importTask?.status === 'completed') {
          clearInterval(checkImport);
          updateTask(taskId, { status: 'completed', progress: 100, result: importTask.result });
          fs.unlinkSync(tempPath);
        } else if (importTask?.status === 'failed') {
          clearInterval(checkImport);
          updateTask(taskId, { status: 'failed', error: importTask.error });
          fs.unlinkSync(tempPath);
        } else if (importTask) {
          updateTask(taskId, { progress: 30 + Math.floor(importTask.progress * 0.7) });
        }
      }, 500);
    } catch (err: any) {
      updateTask(taskId, { status: 'failed', error: err.message });
    }
  }, 0);

  return taskId;
}
```

- [ ] **步骤 3：创建导入路由**

```typescript
// packages/server/src/routes/import.ts
import { Router } from 'express';
import multer from 'multer';
import { authMiddleware, requireRole, AuthRequest } from '../middleware/auth.js';
import { importZip, downloadAndImport } from '../services/importer.js';
import { getTask } from '../services/task-queue.js';
import path from 'path';

const upload = multer({ dest: 'uploads/' });
const router = Router();

router.post('/upload', authMiddleware, requireRole('admin', 'editor'), upload.single('file'), async (req: AuthRequest, res) => {
  if (!req.file) {
    res.status(400).json({ error: '请上传文件' });
    return;
  }

  const { library_id, title } = req.body;
  if (!library_id) {
    res.status(400).json({ error: '请指定漫画库' });
    return;
  }

  const taskId = importZip(req.file.path, parseInt(library_id, 10), title);
  res.json({ task_id: taskId });
});

router.post('/download', authMiddleware, requireRole('admin', 'editor'), async (req: AuthRequest, res) => {
  const { url, library_id, title } = req.body;
  if (!url || !library_id) {
    res.status(400).json({ error: 'URL 和漫画库不能为空' });
    return;
  }

  const taskId = await downloadAndImport(url, parseInt(library_id, 10), title);
  res.json({ task_id: taskId });
});

router.get('/tasks/:id', authMiddleware, (req: AuthRequest, res) => {
  const task = getTask(req.params.id);
  if (!task) {
    res.status(404).json({ error: '任务不存在' });
    return;
  }
  res.json(task);
});

export default router;
```

- [ ] **步骤 4：注册路由**

```typescript
// 在 packages/server/src/index.ts 中添加
import importRoutes from './routes/import.js';
app.use('/api/comics', importRoutes);
```

- [ ] **步骤 5：Commit**

```bash
git add packages/server/src/services/ packages/server/src/routes/import.ts packages/server/src/index.ts
git commit -m "feat: add ZIP upload and download import with task queue"
```

---

## 阶段 P4：用户管理

### 任务 19：用户管理 API 与页面

**文件：**
- 创建：`packages/server/src/routes/users.ts`
- 修改：`packages/server/src/index.ts`
- 修改：`packages/client/src/views/admin/UsersView.vue`
- 修改：`packages/client/src/views/admin/InviteCodesView.vue`

- [ ] **步骤 1：创建用户管理路由**

```typescript
// packages/server/src/routes/users.ts
import { Router } from 'express';
import { authMiddleware, requireRole, AuthRequest } from '../middleware/auth.js';
import db from '../db/database.js';

const router = Router();

router.get('/', authMiddleware, requireRole('admin'), (_req: AuthRequest, res) => {
  const users = db.prepare('SELECT id, username, role, created_at FROM users ORDER BY created_at DESC').all();
  res.json(users);
});

router.put('/:id/role', authMiddleware, requireRole('admin'), (req: AuthRequest, res) => {
  const { id } = req.params;
  const { role } = req.body;
  if (!['admin', 'editor', 'reader'].includes(role)) {
    res.status(400).json({ error: '无效的角色' });
    return;
  }
  db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, id);
  res.json({ success: true });
});

router.delete('/:id', authMiddleware, requireRole('admin'), (req: AuthRequest, res) => {
  const { id } = req.params;
  if (parseInt(id, 10) === req.user!.id) {
    res.status(400).json({ error: '不能删除自己' });
    return;
  }
  db.prepare('DELETE FROM users WHERE id = ?').run(id);
  res.json({ success: true });
});

export default router;
```

- [ ] **步骤 2：注册路由**

```typescript
// 在 packages/server/src/index.ts 中添加
import userRoutes from './routes/users.js';
app.use('/api/users', userRoutes);
```

- [ ] **步骤 3：实现用户管理页面**

```vue
<!-- packages/client/src/views/admin/UsersView.vue -->
<template>
  <div class="users-view">
    <h1>用户管理</h1>
    <table class="user-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>用户名</th>
          <th>角色</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.id">
          <td>{{ user.id }}</td>
          <td>{{ user.username }}</td>
          <td>
            <select :value="user.role" @change="updateRole(user.id, $event)">
              <option value="admin">管理员</option>
              <option value="editor">编辑者</option>
              <option value="reader">读者</option>
            </select>
          </td>
          <td>
            <button class="btn-danger" @click="deleteUser(user.id)">删除</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api } from '@/utils/api';

const users = ref<any[]>([]);

async function fetchUsers() {
  users.value = await api.get('/users');
}

async function updateRole(id: number, event: Event) {
  const role = (event.target as HTMLSelectElement).value;
  await api.put(`/users/${id}/role`, { role });
  await fetchUsers();
}

async function deleteUser(id: number) {
  if (!confirm('确定删除该用户？')) return;
  await api.delete(`/users/${id}`);
  await fetchUsers();
}

onMounted(fetchUsers);
</script>

<style scoped>
.user-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}
.user-table th, .user-table td {
  padding: 12px;
  border-bottom: 1px solid var(--border);
  text-align: left;
}
</style>
```

- [ ] **步骤 4：实现授权码管理页面**

```vue
<!-- packages/client/src/views/admin/InviteCodesView.vue -->
<template>
  <div class="invite-codes-view">
    <h1>授权码管理</h1>
    <div class="create-form">
      <select v-model="newRole">
        <option value="reader">读者</option>
        <option value="editor">编辑者</option>
      </select>
      <input v-model.number="newMaxUses" type="number" placeholder="使用次数" min="1" />
      <button class="btn-primary" @click="createCode">生成授权码</button>
    </div>
    <div class="code-list">
      <div v-for="code in codes" :key="code.id" class="code-item">
        <span class="code-value">{{ code.code }}</span>
        <span class="code-role">{{ code.role }}</span>
        <span class="code-uses">{{ code.used_count }}/{{ code.max_uses }}</span>
        <button class="btn-danger" @click="deleteCode(code.id)">删除</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api } from '@/utils/api';

const codes = ref<any[]>([]);
const newRole = ref('reader');
const newMaxUses = ref(1);

async function fetchCodes() {
  codes.value = await api.get('/invite-codes');
}

async function createCode() {
  await api.post('/invite-codes', { role: newRole.value, max_uses: newMaxUses.value });
  await fetchCodes();
}

async function deleteCode(id: number) {
  await api.delete(`/invite-codes/${id}`);
  await fetchCodes();
}

onMounted(fetchCodes);
</script>

<style scoped>
.create-form {
  display: flex;
  gap: 12px;
  margin: 20px 0;
}
.code-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.code-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  background: var(--bg-card);
  border-radius: 8px;
}
.code-value {
  font-family: monospace;
  background: var(--bg);
  padding: 4px 8px;
  border-radius: 4px;
}
</style>
```

- [ ] **步骤 5：Commit**

```bash
git add packages/server/src/routes/users.ts packages/client/src/views/admin/ packages/server/src/index.ts
git commit -m "feat: add user management and invite code management pages"
```

---

## 阶段 P5：体验优化

### 任务 20：设置页面

**文件：**
- 修改：`packages/client/src/views/SettingsView.vue`

- [ ] **步骤 1：实现设置页面**

```vue
<!-- packages/client/src/views/SettingsView.vue -->
<template>
  <div class="settings-view">
    <h1>设置</h1>

    <section class="settings-section">
      <h2>图片分辨率</h2>
      <div class="setting-item">
        <label>默认分辨率</label>
        <select v-model="resolution" @change="saveSettings">
          <option value="auto">自动（匹配屏幕宽度）</option>
          <option value="original">原图</option>
          <option value="1920">1920px</option>
          <option value="1280">1280px</option>
          <option value="800">800px</option>
        </select>
      </div>
    </section>

    <section class="settings-section">
      <h2>阅读器</h2>
      <div class="setting-item">
        <label>默认深色模式</label>
        <input type="checkbox" v-model="darkMode" @change="saveSettings" />
      </div>
    </section>

    <section class="settings-section">
      <h2>漫画库管理</h2>
      <LibraryManager />
    </section>

    <section class="settings-section">
      <h2>账号</h2>
      <div class="setting-item">
        <button @click="showChangePassword = true">修改密码</button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import LibraryManager from '@/components/LibraryManager.vue';

const resolution = ref(localStorage.getItem('resolution') || 'auto');
const darkMode = ref(localStorage.getItem('darkMode') === 'true');
const showChangePassword = ref(false);

function saveSettings() {
  localStorage.setItem('resolution', resolution.value);
  localStorage.setItem('darkMode', String(darkMode.value));
}
</script>

<style scoped>
.settings-view {
  max-width: 600px;
}
.settings-section {
  margin-bottom: 32px;
}
.settings-section h2 {
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border);
}
.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
}
</style>
```

- [ ] **步骤 2：创建漫画库管理组件**

```vue
<!-- packages/client/src/components/LibraryManager.vue -->
<template>
  <div class="library-manager">
    <div class="add-form">
      <input v-model="newName" placeholder="库名称" />
      <input v-model="newPath" placeholder="目录路径" />
      <button class="btn-primary" @click="addLibrary">添加</button>
    </div>
    <div class="library-list">
      <div v-for="lib in libraries" :key="lib.id" class="library-item">
        <div class="lib-info">
          <strong>{{ lib.name }}</strong>
          <span class="lib-path">{{ lib.path }}</span>
        </div>
        <div class="lib-actions">
          <button @click="scanLibrary(lib.id)">扫描</button>
          <button class="btn-danger" @click="deleteLibrary(lib.id)">删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api } from '@/utils/api';

const libraries = ref<any[]>([]);
const newName = ref('');
const newPath = ref('');

async function fetchLibraries() {
  libraries.value = await api.get('/libraries');
}

async function addLibrary() {
  if (!newName.value || !newPath.value) return;
  await api.post('/libraries', { name: newName.value, path: newPath.value });
  newName.value = '';
  newPath.value = '';
  await fetchLibraries();
}

async function scanLibrary(id: number) {
  const result = await api.post<any>(`/libraries/${id}/scan`);
  alert(`扫描完成：新增 ${result.added}，更新 ${result.updated}，移除 ${result.removed}`);
}

async function deleteLibrary(id: number) {
  if (!confirm('确定删除该漫画库？')) return;
  await api.delete(`/libraries/${id}`);
  await fetchLibraries();
}

onMounted(fetchLibraries);
</script>

<style scoped>
.add-form {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}
.library-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.library-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: var(--bg-card);
  border-radius: 8px;
}
.lib-path {
  font-size: 12px;
  color: var(--text-secondary);
}
.lib-actions {
  display: flex;
  gap: 8px;
}
</style>
```

- [ ] **步骤 3：Commit**

```bash
git add packages/client/src/views/SettingsView.vue packages/client/src/components/LibraryManager.vue
git commit -m "feat: add settings page with library management and resolution options"
```

---

### 任务 21：响应式导航与移动端适配

**文件：**
- 修改：`packages/client/src/components/AppLayout.vue`

- [ ] **步骤 1：更新布局支持移动端**

```vue
<!-- packages/client/src/components/AppLayout.vue -->
<template>
  <div class="app-layout">
    <nav class="sidebar" :class="{ open: sidebarOpen }">
      <div class="sidebar-header">
        <h2>漫画阅读器</h2>
        <button class="close-btn" @click="sidebarOpen = false">&times;</button>
      </div>
      <router-link to="/" @click="sidebarOpen = false">书架</router-link>
      <router-link to="/library" @click="sidebarOpen = false">漫画库</router-link>
      <router-link to="/tags" @click="sidebarOpen = false">标签</router-link>
      <router-link to="/settings" @click="sidebarOpen = false">设置</router-link>
      <router-link v-if="authStore.user?.role === 'admin'" to="/admin/users" @click="sidebarOpen = false">用户管理</router-link>
      <router-link v-if="authStore.user?.role === 'admin'" to="/admin/invite-codes" @click="sidebarOpen = false">授权码</router-link>
      <button class="logout-btn" @click="authStore.logout()">退出</button>
    </nav>

    <div class="sidebar-overlay" v-if="sidebarOpen" @click="sidebarOpen = false"></div>

    <main class="content">
      <button class="menu-btn" @click="sidebarOpen = true">&#9776;</button>
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const sidebarOpen = ref(false);
</script>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 220px;
  background: var(--bg-card);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-right: 1px solid var(--border);
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 1000;
  transform: translateX(-100%);
  transition: transform 0.3s;
}

.sidebar.open {
  transform: translateX(0);
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.close-btn {
  display: none;
  background: none;
  font-size: 24px;
  padding: 0;
}

.sidebar a {
  padding: 8px 12px;
  border-radius: 6px;
  color: var(--text);
}

.sidebar a.router-link-active {
  background: var(--primary);
  color: white;
}

.logout-btn {
  margin-top: auto;
  background: var(--danger);
  color: white;
}

.sidebar-overlay {
  display: none;
}

.content {
  flex: 1;
  padding: 20px;
  margin-left: 220px;
}

.menu-btn {
  display: none;
  background: none;
  font-size: 24px;
  margin-bottom: 16px;
}

@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
  }

  .sidebar.open {
    transform: translateX(0);
  }

  .close-btn {
    display: block;
  }

  .sidebar-overlay {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
  }

  .content {
    margin-left: 0;
  }

  .menu-btn {
    display: block;
  }
}

@media (min-width: 769px) {
  .sidebar {
    transform: translateX(0);
  }
}
</style>
```

- [ ] **步骤 2：Commit**

```bash
git add packages/client/src/components/AppLayout.vue
git commit -m "feat: add responsive navigation with mobile sidebar"
```

---

## 完成

所有任务完成后，运行完整验证：

```bash
# 启动后端
pnpm dev:server

# 启动前端
pnpm dev:client

# 访问 http://localhost:5173
# 使用 admin/admin123 登录
```

**最终验证清单：**
- [ ] 管理员可以登录
- [ ] 可以添加漫画库
- [ ] 可以扫描漫画
- [ ] 漫画列表正确显示
- [ ] 单体漫画可以阅读
- [ ] 分集漫画显示集列表
- [ ] 阅读进度自动保存
- [ ] 可以收藏漫画
- [ ] 标签管理正常
- [ ] 用户管理正常（管理员）
- [ ] 授权码注册正常
- [ ] 移动端布局正常
