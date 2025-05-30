# 现代化博客系统 - 测试计划

## 🧪 测试策略

### 测试金字塔
```
         E2E Tests (10%)
       ┌─────────────────┐
       │  端到端测试      │
       │  • 用户流程测试  │
       │  • 跨浏览器测试  │
       └─────────────────┘
      ┌─────────────────────┐
      │   Integration Tests │ (20%)
      │   集成测试           │
      │   • API 集成测试     │
      │   • 数据库集成测试    │
      └─────────────────────┘
     ┌─────────────────────────┐
     │      Unit Tests         │ (70%)
     │      单元测试            │
     │      • 函数级别测试      │
     │      • 组件级别测试      │
     └─────────────────────────┘
```

### 测试类型分类

#### 1. 功能测试
- **单元测试**: 函数和组件级别的测试
- **集成测试**: 模块间交互测试
- **端到端测试**: 完整用户流程测试
- **API 测试**: 接口功能和数据验证

#### 2. 非功能测试
- **性能测试**: 响应时间和吞吐量
- **安全测试**: 认证授权和数据安全
- **可用性测试**: 用户体验和界面友好性
- **兼容性测试**: 跨浏览器和设备兼容

#### 3. 自动化测试
- **持续集成测试**: CI/CD 流水线中的自动测试
- **回归测试**: 新功能对现有功能的影响
- **冒烟测试**: 核心功能快速验证

## 📋 测试用例设计

### 前端组件测试

#### Header 组件测试
```typescript
describe('Header Component', () => {
  test('应该正确渲染导航菜单', () => {
    render(<Header />);
    expect(screen.getByText('首页')).toBeInTheDocument();
    expect(screen.getByText('分类')).toBeInTheDocument();
    expect(screen.getByText('标签')).toBeInTheDocument();
  });

  test('登录状态应该显示用户菜单', () => {
    const mockUser = { id: 1, username: 'testuser' };
    render(<Header user={mockUser} />);
    expect(screen.getByText('写文章')).toBeInTheDocument();
    expect(screen.getByText('个人中心')).toBeInTheDocument();
  });

  test('未登录状态应该显示登录注册按钮', () => {
    render(<Header user={null} />);
    expect(screen.getByText('登录')).toBeInTheDocument();
    expect(screen.getByText('注册')).toBeInTheDocument();
  });
});
```

#### PostCard 组件测试
```typescript
describe('PostCard Component', () => {
  const mockPost = {
    id: 1,
    title: '测试文章标题',
    excerpt: '这是一篇测试文章的摘要',
    author: { username: 'author', avatar: '/avatar.jpg' },
    publishedAt: '2024-01-01',
    category: { name: '技术', slug: 'tech' },
    tags: [{ name: 'React', slug: 'react' }],
    viewsCount: 100,
    likesCount: 10,
    commentsCount: 5
  };

  test('应该正确渲染文章信息', () => {
    render(<PostCard post={mockPost} />);
    expect(screen.getByText('测试文章标题')).toBeInTheDocument();
    expect(screen.getByText('这是一篇测试文章的摘要')).toBeInTheDocument();
    expect(screen.getByText('author')).toBeInTheDocument();
  });

  test('点击文章标题应该跳转到详情页', () => {
    const mockNavigate = jest.fn();
    jest.mock('react-router-dom', () => ({
      useNavigate: () => mockNavigate
    }));
    
    render(<PostCard post={mockPost} />);
    fireEvent.click(screen.getByText('测试文章标题'));
    expect(mockNavigate).toHaveBeenCalledWith(`/posts/${mockPost.id}`);
  });

  test('应该显示正确的统计数据', () => {
    render(<PostCard post={mockPost} />);
    expect(screen.getByText('100')).toBeInTheDocument(); // 浏览数
    expect(screen.getByText('10')).toBeInTheDocument();  // 点赞数
    expect(screen.getByText('5')).toBeInTheDocument();   // 评论数
  });
});
```

### 后端 API 测试

#### 用户认证 API 测试
```typescript
describe('Auth API', () => {
  beforeEach(async () => {
    await setupTestDB();
  });

  afterEach(async () => {
    await cleanupTestDB();
  });

  describe('POST /api/auth/register', () => {
    test('应该成功注册新用户', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        displayName: '测试用户'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.username).toBe('testuser');
      expect(response.body.data.token).toBeDefined();
    });

    test('应该拒绝已存在的用户名', async () => {
      // 先创建一个用户
      await createTestUser({ username: 'existinguser' });

      const userData = {
        username: 'existinguser',
        email: 'new@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('USERNAME_EXISTS');
    });

    test('应该验证密码强度', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: '123', // 弱密码
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('WEAK_PASSWORD');
    });
  });

  describe('POST /api/auth/login', () => {
    test('应该成功登录有效用户', async () => {
      const user = await createTestUser({
        username: 'testuser',
        password: 'password123'
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'password123'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
    });

    test('应该拒绝错误密码', async () => {
      await createTestUser({
        username: 'testuser',
        password: 'password123'
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
    });
  });
});
```

#### 文章管理 API 测试
```typescript
describe('Posts API', () => {
  let authToken: string;
  let testUser: any;

  beforeEach(async () => {
    await setupTestDB();
    testUser = await createTestUser();
    authToken = generateTestToken(testUser);
  });

  describe('GET /api/posts', () => {
    test('应该返回文章列表', async () => {
      await createTestPosts(5, { author: testUser });

      const response = await request(app)
        .get('/api/posts')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(5);
      expect(response.body.pagination).toBeDefined();
    });

    test('应该支持分页', async () => {
      await createTestPosts(15, { author: testUser });

      const response = await request(app)
        .get('/api/posts?page=2&limit=5')
        .expect(200);

      expect(response.body.data).toHaveLength(5);
      expect(response.body.pagination.page).toBe(2);
      expect(response.body.pagination.total).toBe(15);
    });

    test('应该支持分类筛选', async () => {
      const category = await createTestCategory({ name: '技术' });
      await createTestPosts(3, { category, author: testUser });
      await createTestPosts(2, { author: testUser }); // 无分类

      const response = await request(app)
        .get(`/api/posts?category=${category.slug}`)
        .expect(200);

      expect(response.body.data).toHaveLength(3);
    });
  });

  describe('POST /api/posts', () => {
    test('应该成功创建文章', async () => {
      const postData = {
        title: '测试文章',
        content: '# 这是测试内容\n\n文章正文...',
        excerpt: '文章摘要',
        categoryId: 1,
        tags: ['JavaScript', 'Node.js']
      };

      const response = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(postData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('测试文章');
      expect(response.body.data.slug).toBeDefined();
    });

    test('应该拒绝未认证用户', async () => {
      const postData = {
        title: '测试文章',
        content: '内容'
      };

      const response = await request(app)
        .post('/api/posts')
        .send(postData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    test('应该验证必填字段', async () => {
      const response = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });
});
```

### 端到端测试 (E2E)

#### 用户注册登录流程
```typescript
describe('用户注册登录流程', () => {
  test('完整的用户注册登录流程', async () => {
    await page.goto('/register');

    // 填写注册表单
    await page.fill('[data-testid="username"]', 'e2euser');
    await page.fill('[data-testid="email"]', 'e2e@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.fill('[data-testid="confirmPassword"]', 'password123');
    
    // 提交注册
    await page.click('[data-testid="register-button"]');
    
    // 验证跳转到首页
    await expect(page).toHaveURL('/');
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();

    // 登出
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout-button"]');
    
    // 重新登录
    await page.goto('/login');
    await page.fill('[data-testid="username"]', 'e2euser');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    // 验证登录成功
    await expect(page).toHaveURL('/');
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });
});
```

#### 文章创建发布流程
```typescript
describe('文章创建发布流程', () => {
  beforeEach(async () => {
    await loginAsTestUser(page);
  });

  test('创建并发布文章', async () => {
    // 进入创建页面
    await page.goto('/create');
    
    // 填写文章信息
    await page.fill('[data-testid="post-title"]', 'E2E 测试文章');
    await page.fill('[data-testid="post-content"]', '# 标题\n\n这是测试内容');
    
    // 选择分类
    await page.selectOption('[data-testid="category-select"]', '技术');
    
    // 添加标签
    await page.fill('[data-testid="tag-input"]', 'E2E测试');
    await page.press('[data-testid="tag-input"]', 'Enter');
    
    // 保存草稿
    await page.click('[data-testid="save-draft"]');
    await expect(page.locator('.toast-success')).toBeVisible();
    
    // 预览文章
    await page.click('[data-testid="preview-button"]');
    await expect(page.locator('[data-testid="preview-content"]')).toContainText('这是测试内容');
    
    // 发布文章
    await page.click('[data-testid="publish-button"]');
    await expect(page.locator('.toast-success')).toContainText('文章发布成功');
    
    // 验证跳转到文章页面
    await expect(page).toHaveURL(/\/posts\/.+/);
    await expect(page.locator('h1')).toContainText('E2E 测试文章');
  });
});
```

## 🚀 性能测试

### 负载测试配置
```javascript
// k6 性能测试脚本
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  // 阶段性负载测试
  stages: [
    { duration: '2m', target: 10 },   // 爬坡到 10 用户
    { duration: '5m', target: 10 },   // 保持 10 用户
    { duration: '2m', target: 20 },   // 爬坡到 20 用户
    { duration: '5m', target: 20 },   // 保持 20 用户
    { duration: '2m', target: 0 },    // 降回 0 用户
  ],
  thresholds: {
    // 性能指标阈值
    http_req_duration: ['p(95)<2000'], // 95% 请求小于 2s
    http_req_failed: ['rate<0.1'],     // 错误率小于 10%
  },
};

export default function () {
  // 首页性能测试
  let homeResponse = http.get('http://localhost:3001/api/posts');
  check(homeResponse, {
    '首页状态码为 200': (r) => r.status === 200,
    '首页响应时间 < 1s': (r) => r.timings.duration < 1000,
  });

  sleep(1);

  // 文章详情页性能测试
  let postResponse = http.get('http://localhost:3001/api/posts/1');
  check(postResponse, {
    '文章页状态码为 200': (r) => r.status === 200,
    '文章页响应时间 < 800ms': (r) => r.timings.duration < 800,
  });

  sleep(1);
}
```

### 压力测试场景
```yaml
# 压力测试配置
scenarios:
  # 常规用户访问
  normal_users:
    executor: ramping-vus
    startVUs: 0
    stages:
      - duration: 10m
        target: 50
    gracefulRampDown: 30s

  # 突发流量测试
  spike_test:
    executor: ramping-vus
    startTime: 5m
    startVUs: 0
    stages:
      - duration: 30s
        target: 200  # 突然增加到 200 用户
      - duration: 1m
        target: 200  # 保持 1 分钟
      - duration: 30s
        target: 0    # 快速降回 0

  # API 端点测试
  api_test:
    executor: constant-vus
    vus: 20
    duration: 15m
    env:
      TEST_TYPE: 'api_only'
```

## 🔒 安全测试

### 安全测试检查清单

#### 认证和授权测试
```typescript
describe('安全测试', () => {
  test('应该阻止 SQL 注入攻击', async () => {
    const maliciousInput = "'; DROP TABLE users; --";
    
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        username: maliciousInput,
        password: 'password'
      });

    // 应该返回正常的认证失败，而不是服务器错误
    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  test('应该阻止 XSS 攻击', async () => {
    const xssPayload = '<script>alert("XSS")</script>';
    
    const response = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${validToken}`)
      .send({
        title: xssPayload,
        content: 'Normal content'
      });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('INVALID_INPUT');
  });

  test('应该验证 JWT 令牌', async () => {
    const response = await request(app)
      .get('/api/users/profile')
      .set('Authorization', 'Bearer invalid-token');

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('INVALID_TOKEN');
  });

  test('应该限制文件上传大小', async () => {
    const largeFile = Buffer.alloc(11 * 1024 * 1024); // 11MB

    const response = await request(app)
      .post('/api/upload')
      .set('Authorization', `Bearer ${validToken}`)
      .attach('file', largeFile, 'large-file.jpg');

    expect(response.status).toBe(413);
    expect(response.body.error.code).toBe('FILE_TOO_LARGE');
  });
});
```

#### OWASP 安全检查
```bash
# 使用 OWASP ZAP 进行安全扫描
#!/bin/bash

# 启动 ZAP 代理
docker run -t owasp/zap2docker-stable zap-baseline.py \
  -t http://localhost:3000 \
  -g gen.conf \
  -r zap-report.html

# 检查常见安全漏洞
echo "检查 OWASP Top 10 安全漏洞..."

# 1. 注入攻击检测
echo "✓ SQL 注入检测"
echo "✓ NoSQL 注入检测" 
echo "✓ LDAP 注入检测"

# 2. 身份验证破坏
echo "✓ 弱密码策略检测"
echo "✓ 会话管理检测"

# 3. 敏感数据暴露
echo "✓ 数据加密检测"
echo "✓ HTTPS 配置检测"

# 4. XML 外部实体 (XXE)
echo "✓ XML 解析安全检测"

# 5. 访问控制缺陷
echo "✓ 权限验证检测"
echo "✓ 目录遍历检测"

# 生成安全报告
echo "安全扫描完成，报告生成：zap-report.html"
```

## 📊 测试报告和指标

### 测试覆盖率目标
```yaml
coverage_targets:
  statements: 80%      # 语句覆盖率
  branches: 75%        # 分支覆盖率
  functions: 85%       # 函数覆盖率
  lines: 80%          # 行覆盖率

critical_paths:       # 关键路径 100% 覆盖
  - 用户认证流程
  - 支付处理流程
  - 数据安全相关功能
```

### 性能基准指标
```yaml
performance_benchmarks:
  api_response_time:
    p50: < 200ms       # 50% 请求小于 200ms
    p95: < 1000ms      # 95% 请求小于 1s
    p99: < 2000ms      # 99% 请求小于 2s
  
  page_load_time:
    first_contentful_paint: < 1.5s
    largest_contentful_paint: < 2.5s
    cumulative_layout_shift: < 0.1
  
  database_queries:
    avg_query_time: < 50ms
    slow_query_threshold: 100ms
    connection_pool_usage: < 80%
```

### 自动化测试流水线
```yaml
# GitHub Actions CI/CD
name: 测试流水线

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: 运行单元测试
        run: |
          npm ci
          npm run test:unit
          npm run test:coverage
      
  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
      redis:
        image: redis:7
    steps:
      - name: 运行集成测试
        run: npm run test:integration
  
  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - name: 运行 E2E 测试
        run: |
          npm run build
          npm run test:e2e
  
  security-tests:
    runs-on: ubuntu-latest
    steps:
      - name: 安全漏洞扫描
        run: |
          npm audit
          npm run test:security
  
  performance-tests:
    runs-on: ubuntu-latest
    steps:
      - name: 性能测试
        run: |
          npm run test:performance
          npm run lighthouse:ci
```

---

## 🎯 测试交付物

1. **测试计划文档** ✅
2. **单元测试套件** ✅  
3. **集成测试套件** ✅
4. **E2E 测试套件** ✅
5. **性能测试方案** ✅
6. **安全测试检查** ✅
7. **自动化测试配置** ✅
8. **测试报告模板** ✅

通过这套完整的测试方案，我们确保博客系统的每个功能都经过严格验证，达到生产环境的质量标准！ 