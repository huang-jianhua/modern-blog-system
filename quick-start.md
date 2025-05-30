# 🚀 博客系统快速启动指南

## 📋 开始之前

### 环境要求检查
在开始之前，请确保你的系统满足以下要求：

- ✅ Node.js >= 18.0.0
- ✅ npm >= 9.0.0  
- ✅ Docker Desktop (用于数据库和容器化部署)
- ✅ Git

### 检查当前环境
```bash
# 检查 Node.js 版本
node --version

# 检查 npm 版本  
npm --version

# 检查 Docker 版本
docker --version

# 检查 Git 版本
git --version
```

## 🛠️ 快速启动方式

### 方式一：Docker 容器化启动（推荐）

#### 1. 克隆项目并进入目录
```bash
cd blog-system
```

#### 2. 一键启动所有服务
```bash
# 启动所有服务（数据库 + 后端 + 前端）
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看服务日志
docker-compose logs -f
```

#### 3. 访问服务
- 🌐 **前端应用**: http://localhost:3000
- 🔧 **后端 API**: http://localhost:3001
- 📊 **API 文档**: http://localhost:3001/api
- 🗄️ **数据库管理**: http://localhost:8080 (Adminer)
- 📈 **监控面板**: http://localhost:3002 (Grafana)

### 方式二：本地开发启动

#### 1. 安装依赖
```bash
# 安装项目依赖
npm install

# 安装各个包的依赖
npm run postinstall
```

#### 2. 启动数据库服务
```bash
# 只启动数据库相关服务
docker-compose up -d postgres redis elasticsearch
```

#### 3. 数据库初始化
```bash
# 运行数据库迁移
npm run db:migrate

# 填充示例数据
npm run db:seed
```

#### 4. 启动开发服务器
```bash
# 同时启动前端和后端
npm run dev

# 或者分别启动
npm run dev:backend    # 后端服务 (端口 3001)
npm run dev:frontend   # 前端服务 (端口 3000)
```

## 📝 第一次使用

### 1. 创建管理员账户
访问 http://localhost:3000/register 创建你的第一个账户：

```
用户名: admin
邮箱: admin@example.com
密码: Admin123!
显示名称: 系统管理员
```

### 2. 发布第一篇文章
1. 登录后点击 "写文章" 按钮
2. 填写文章标题和内容（支持 Markdown）
3. 选择分类和标签
4. 点击 "发布" 按钮

### 3. 配置博客设置
访问 http://localhost:3000/dashboard 进入管理后台：
- 📊 查看数据统计
- 📝 管理文章列表
- 👥 管理用户权限
- 🏷️ 管理分类标签
- ⚙️ 系统设置

## 🔧 开发配置

### 环境变量配置
创建 `.env` 文件并配置必要的环境变量：

```bash
# 后端服务配置
NODE_ENV=development
PORT=3001

# 数据库配置
DATABASE_URL=postgresql://blog_user:blog_password@localhost:5432/blog_db

# Redis 配置
REDIS_URL=redis://:redis_password@localhost:6379

# JWT 密钥（生产环境请更换）
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key

# 前端配置
VITE_API_BASE_URL=http://localhost:3001/api
VITE_APP_TITLE=现代化博客系统
```

### 开发工具配置

#### VS Code 扩展推荐
```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

#### ESLint 配置
项目已经配置了 ESLint 和 Prettier，运行以下命令检查代码：

```bash
# 代码格式检查
npm run lint

# 自动修复格式问题
npm run lint:fix

# 代码格式化
npm run format
```

## 🧪 测试运行

### 运行测试套件
```bash
# 运行所有测试
npm test

# 运行单元测试
npm run test:unit

# 运行集成测试
npm run test:integration

# 运行 E2E 测试
npm run test:e2e

# 生成测试覆盖率报告
npm run test:coverage
```

### 性能测试
```bash
# 运行性能测试（需要先启动服务）
npm run test:performance
```

## 📦 构建和部署

### 本地构建
```bash
# 构建项目
npm run build

# 预览构建结果
npm run preview
```

### Docker 部署
```bash
# 构建 Docker 镜像
npm run docker:build

# 启动生产环境
npm run docker:up

# 停止服务
npm run docker:down
```

## 🔍 故障排除

### 常见问题

#### 1. 端口占用
```bash
# 检查端口占用情况
netstat -tlnp | grep :3000
netstat -tlnp | grep :3001

# 杀死占用端口的进程
kill -9 <PID>
```

#### 2. 数据库连接失败
```bash
# 检查数据库状态
docker-compose ps postgres

# 重启数据库
docker-compose restart postgres

# 查看数据库日志
docker-compose logs postgres
```

#### 3. 依赖安装问题
```bash
# 清理缓存
npm cache clean --force

# 删除 node_modules 重新安装
rm -rf node_modules package-lock.json
npm install
```

#### 4. Docker 相关问题
```bash
# 重建镜像
docker-compose build --no-cache

# 清理 Docker 资源
docker system prune -a

# 查看容器日志
docker-compose logs -f [service-name]
```

## 📚 学习资源

### 技术文档
- 📖 [架构设计文档](./blog-system-architecture.md)
- 🎨 [UI/UX 设计文档](./blog-system-ux-design.md)  
- 🧪 [测试计划文档](./blog-system-test-plan.md)
- 🚀 [部署运维文档](./blog-system-deployment-guide.md)

### API 文档
- 🔧 API 接口文档: http://localhost:3001/api
- 📊 Swagger UI: http://localhost:3001/api-docs

### 项目结构
```
blog-system/
├── packages/
│   ├── frontend/          # React 前端应用
│   ├── backend/           # Node.js 后端 API
│   └── shared/            # 共享类型和工具
├── docs/                  # 文档目录
├── docker-compose.yml     # Docker 配置
└── package.json          # 根配置文件
```

## 🎯 下一步

现在你已经成功启动了博客系统！你可以：

1. ✍️ **开始写作** - 创建你的第一篇博客文章
2. 🎨 **个性化定制** - 修改主题颜色和布局
3. 🔧 **功能扩展** - 添加新的功能模块
4. 📊 **数据分析** - 查看访问统计和用户行为
5. 🚀 **生产部署** - 部署到线上服务器

## 💬 获取帮助

如果遇到问题，可以：
- 📝 查看文档目录中的详细说明
- 🔍 搜索 GitHub Issues
- 💡 提交新的 Issue
- 📧 联系开发团队

祝你使用愉快！🎉 