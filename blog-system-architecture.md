# 现代化博客系统 - 技术架构设计

## 🏗️ 系统架构概览

### 整体架构
```
┌─────────────────────────────────────────────────────────┐
│                    用户层 (Client Layer)                  │
├─────────────────┬─────────────────┬─────────────────────┤
│   Web Browser   │   Mobile App    │   Admin Dashboard   │
│   (React SPA)   │   (React Native)│   (React Admin)     │
└─────────────────┴─────────────────┴─────────────────────┘
                           │
                    ┌─────────────┐
                    │   CDN/图床   │
                    │ (阿里云OSS)  │
                    └─────────────┘
                           │
┌─────────────────────────────────────────────────────────┐
│                  API 网关层 (API Gateway)                 │
├─────────────────────────────────────────────────────────┤
│  • 路由转发  • 负载均衡  • 限流控制  • 认证鉴权         │
│  • API文档   • 监控日志  • 版本管理  • 跨域处理         │
└─────────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────┐
│                   应用服务层 (Service Layer)              │
├─────────────────┬─────────────────┬─────────────────────┤
│   用户服务       │   内容服务       │   通知服务           │
│ (User Service)  │(Content Service)│(Notification Service)│
│                 │                 │                     │
│ • 用户注册登录   │ • 文章管理       │ • 邮件通知           │
│ • 权限管理       │ • 评论管理       │ • 消息推送           │
│ • 个人资料       │ • 搜索功能       │ • 订阅通知           │
└─────────────────┴─────────────────┴─────────────────────┘
                           │
┌─────────────────────────────────────────────────────────┐
│                   数据访问层 (Data Layer)                 │
├─────────────────┬─────────────────┬─────────────────────┤
│   主数据库       │   缓存层         │   搜索引擎           │
│  (PostgreSQL)   │   (Redis)       │ (Elasticsearch)     │
│                 │                 │                     │
│ • 用户数据       │ • 会话缓存       │ • 全文搜索           │
│ • 文章内容       │ • 热点数据       │ • 标签搜索           │
│ • 评论数据       │ • 计数缓存       │ • 内容推荐           │
└─────────────────┴─────────────────┴─────────────────────┘
```

## 🛠️ 技术选型

### 前端技术栈
```typescript
// 核心框架
React 18 + TypeScript + Vite

// 状态管理
Zustand (轻量级状态管理)

// 路由
React Router v6

// UI 组件库
Tailwind CSS + Headless UI

// HTTP 客户端
Axios + React Query (数据获取和缓存)

// 表单处理
React Hook Form + Zod (表单验证)

// 富文本编辑器
@uiw/react-md-editor (Markdown 编辑器)

// 代码高亮
Prism.js

// 构建工具
Vite + ESBuild
```

### 后端技术栈
```javascript
// 运行时
Node.js 18+ + TypeScript

// 框架
Express.js + Helmet (安全中间件)

// ORM
Prisma (类型安全的 ORM)

// 认证授权
JWT + bcrypt

// 验证
Joi (数据验证)

// 文件上传
Multer + Sharp (图片处理)

// 任务队列
Bull (Redis-based)

// 日志
Winston + Morgan

// 测试
Jest + Supertest
```

### 数据库和基础设施
```yaml
# 主数据库
PostgreSQL 14+:
  - 主从复制
  - 连接池
  - 事务支持

# 缓存
Redis 6+:
  - 会话存储
  - 热点数据缓存
  - 计数器缓存

# 搜索
Elasticsearch 8+:
  - 全文搜索
  - 相关性排序
  - 聚合分析

# 文件存储
阿里云 OSS:
  - 图片存储
  - CDN 加速
  - 多区域备份

# 部署
Docker + Docker Compose:
  - 容器化部署
  - 环境隔离
  - 扩展性

# 监控
Prometheus + Grafana:
  - 性能监控
  - 告警通知
  - 可视化大盘
```

## 🗄️ 数据库设计

### 核心表结构

#### 用户表 (users)
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(100),
  avatar_url VARCHAR(500),
  bio TEXT,
  role user_role NOT NULL DEFAULT 'reader',
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 用户角色枚举
CREATE TYPE user_role AS ENUM ('admin', 'author', 'reader');
```

#### 文章表 (posts)
```sql
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  cover_image VARCHAR(500),
  author_id INTEGER REFERENCES users(id),
  category_id INTEGER REFERENCES categories(id),
  status post_status DEFAULT 'draft',
  is_featured BOOLEAN DEFAULT FALSE,
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 文章状态枚举
CREATE TYPE post_status AS ENUM ('draft', 'published', 'archived');

-- 创建索引
CREATE INDEX idx_posts_author_id ON posts(author_id);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_published_at ON posts(published_at);
CREATE INDEX idx_posts_slug ON posts(slug);
```

#### 分类表 (categories)
```sql
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  color VARCHAR(7), -- HEX 颜色
  posts_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 标签表 (tags)
```sql
CREATE TABLE tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  posts_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 文章标签关联表
CREATE TABLE post_tags (
  post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
  tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);
```

#### 评论表 (comments)
```sql
CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  author_id INTEGER REFERENCES users(id),
  post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
  parent_id INTEGER REFERENCES comments(id), -- 回复功能
  is_approved BOOLEAN DEFAULT FALSE,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_id);
CREATE INDEX idx_comments_created_at ON comments(created_at);
```

#### 点赞表 (likes)
```sql
CREATE TABLE likes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  post_id INTEGER REFERENCES posts(id),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);
```

### 数据库优化策略

#### 索引优化
```sql
-- 复合索引
CREATE INDEX idx_posts_status_published ON posts(status, published_at DESC);
CREATE INDEX idx_comments_post_approved ON comments(post_id, is_approved);

-- 全文搜索索引
CREATE INDEX idx_posts_fts ON posts USING gin(to_tsvector('chinese', title || ' ' || content));
```

#### 分区策略
```sql
-- 按时间分区评论表
CREATE TABLE comments_2024_01 PARTITION OF comments
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
```

## 🔧 API 设计

### RESTful API 规范

#### 认证相关
```typescript
// 用户认证
POST   /api/auth/register    // 用户注册
POST   /api/auth/login       // 用户登录
POST   /api/auth/logout      // 用户登出
POST   /api/auth/refresh     // 刷新令牌
GET    /api/auth/me          // 获取当前用户信息
```

#### 文章相关
```typescript
// 文章 CRUD
GET    /api/posts            // 获取文章列表
GET    /api/posts/:id        // 获取文章详情
POST   /api/posts            // 创建文章
PUT    /api/posts/:id        // 更新文章
DELETE /api/posts/:id        // 删除文章

// 文章操作
POST   /api/posts/:id/like   // 点赞文章
POST   /api/posts/:id/view   // 记录浏览
GET    /api/posts/search     // 搜索文章
```

#### 评论相关
```typescript
GET    /api/posts/:id/comments     // 获取评论列表
POST   /api/posts/:id/comments     // 发表评论
PUT    /api/comments/:id           // 更新评论
DELETE /api/comments/:id           // 删除评论
```

### API 响应格式
```typescript
// 成功响应
interface ApiResponse<T> {
  success: true;
  data: T;
  message?: string;
}

// 错误响应
interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

// 分页响应
interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

## 🔒 安全设计

### 认证和授权
```typescript
// JWT 配置
const JWT_CONFIG = {
  accessTokenExpiry: '15m',
  refreshTokenExpiry: '7d',
  algorithm: 'HS256',
  issuer: 'blog-system',
};

// 权限控制
enum Permission {
  READ_POST = 'read:post',
  WRITE_POST = 'write:post',
  DELETE_POST = 'delete:post',
  MANAGE_USERS = 'manage:users',
  MODERATE_COMMENTS = 'moderate:comments',
}

// 角色权限映射
const ROLE_PERMISSIONS = {
  reader: [Permission.READ_POST],
  author: [Permission.READ_POST, Permission.WRITE_POST],
  admin: Object.values(Permission),
};
```

### 数据验证
```typescript
// 文章创建验证
const createPostSchema = Joi.object({
  title: Joi.string().min(1).max(255).required(),
  content: Joi.string().min(10).required(),
  categoryId: Joi.number().integer().positive(),
  tags: Joi.array().items(Joi.string()).max(10),
  coverImage: Joi.string().uri().optional(),
});

// XSS 防护
import DOMPurify from 'isomorphic-dompurify';

const sanitizeContent = (content: string) => {
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'code', 'pre'],
    ALLOWED_ATTR: ['class'],
  });
};
```

### 限流和防护
```typescript
// 接口限流
const rateLimitConfig = {
  '/api/auth/login': { windowMs: 15 * 60 * 1000, max: 5 },    // 15分钟5次
  '/api/posts': { windowMs: 60 * 1000, max: 60 },             // 1分钟60次
  '/api/comments': { windowMs: 60 * 1000, max: 10 },          // 1分钟10次
};

// CSRF 防护
const csrfConfig = {
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  },
};
```

## 🚀 性能优化

### 缓存策略
```typescript
// Redis 缓存配置
const CACHE_CONFIG = {
  // 热门文章缓存 1小时
  HOT_POSTS: { key: 'hot_posts', ttl: 3600 },
  
  // 文章详情缓存 30分钟
  POST_DETAIL: { key: 'post_detail:', ttl: 1800 },
  
  // 用户信息缓存 15分钟
  USER_INFO: { key: 'user_info:', ttl: 900 },
  
  // 评论列表缓存 10分钟
  COMMENTS: { key: 'comments:', ttl: 600 },
};

// 缓存实现
class CacheService {
  async get<T>(key: string): Promise<T | null> {
    const cached = await redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }
  
  async set(key: string, value: any, ttl: number): Promise<void> {
    await redis.setex(key, ttl, JSON.stringify(value));
  }
  
  async del(key: string): Promise<void> {
    await redis.del(key);
  }
}
```

### 数据库优化
```sql
-- 查询优化示例
EXPLAIN ANALYZE 
SELECT p.*, u.username, u.avatar_url, c.name as category_name
FROM posts p
JOIN users u ON p.author_id = u.id
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.status = 'published'
ORDER BY p.published_at DESC
LIMIT 20;

-- 读写分离配置
const dbConfig = {
  master: {
    host: 'master.db.example.com',
    port: 5432,
    database: 'blog_db',
  },
  slaves: [
    {
      host: 'slave1.db.example.com',
      port: 5432,
      database: 'blog_db',
    }
  ]
};
```

## 📊 监控和日志

### 应用监控
```typescript
// Prometheus 指标
const promClient = require('prom-client');

const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
});

const activeUsers = new promClient.Gauge({
  name: 'active_users_total',
  help: 'Number of active users',
});

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});
```

### 日志配置
```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ],
});
```

---

## 🎯 架构设计交付物

1. **系统架构图** ✅
2. **技术选型说明** ✅  
3. **数据库设计文档** ✅
4. **API 接口文档** ✅
5. **安全方案设计** ✅
6. **性能优化策略** ✅
7. **监控方案设计** ✅ 