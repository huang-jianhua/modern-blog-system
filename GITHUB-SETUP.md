# 🐙 GitHub 集成完整设置指南

## 🎯 目标：配置GitHub + MCP，实现代码管理和AI协作

---

## 📋 第一步：创建GitHub仓库

### 1. 访问GitHub创建新仓库
```bash
# 打开浏览器访问：
https://github.com/new
```

### 2. 仓库设置
```bash
仓库名: modern-blog-system
描述: 现代化博客系统 - 基于React+Node.js的全栈解决方案
可见性: Public (推荐，便于部署)
初始化: 不勾选任何选项（我们已有代码）
```

### 3. 复制仓库地址
```bash
# 创建后会显示仓库地址，类似：
https://github.com/你的用户名/modern-blog-system.git
```

---

## 🔑 第二步：生成GitHub Personal Access Token

### 1. 访问Token设置页面
```bash
# 打开浏览器访问：
https://github.com/settings/tokens
```

### 2. 创建新Token
```bash
# 点击 "Generate new token" > "Tokens (classic)"
Token名称: MCP-Integration-Token
过期时间: 90 days (或No expiration)
```

### 3. 选择权限范围
```bash
必选权限：
✅ repo (完整仓库访问权限)
  ✅ repo:status (访问commit状态)
  ✅ repo_deployment (访问部署状态)
  ✅ public_repo (访问公共仓库)
  ✅ repo:invite (访问仓库邀请)
  ✅ security_events (访问安全事件)

✅ workflow (GitHub Actions工作流)

✅ write:packages (写包权限)
✅ read:packages (读包权限)

✅ admin:org (组织管理，如果有的话)
  ✅ read:org (读取组织信息)
  ✅ write:org (写入组织信息)

✅ admin:public_key (公钥管理)
  ✅ read:public_key (读取公钥)
  ✅ write:public_key (写入公钥)

✅ admin:repo_hook (仓库Webhook管理)
  ✅ read:repo_hook (读取Webhook)
  ✅ write:repo_hook (写入Webhook)

✅ user (用户信息)
  ✅ read:user (读取用户信息)
  ✅ user:email (访问用户邮箱)
  ✅ user:follow (关注用户)

✅ delete_repo (删除仓库权限)
```

### 4. 生成并保存Token
```bash
# 点击 "Generate token"
# 复制生成的token (以 ghp_ 开头)
# ⚠️ 重要：立即保存到安全位置，页面刷新后无法再看到！

示例：ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## ⚙️ 第三步：配置Cursor MCP

### 1. 打开Cursor MCP设置
```bash
# 在Cursor中：
# 1. 按 Ctrl+Shift+P (Windows) 或 Cmd+Shift+P (Mac)
# 2. 输入 "MCP"
# 3. 选择 "Model Context Protocol: Configure"
```

### 2. 添加GitHub MCP配置
```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_你的token在这里"
      }
    },
    "filesystem": {
      "command": "npx", 
      "args": ["@modelcontextprotocol/server-filesystem", "D:\\mycode\\内容创作"]
    }
  }
}
```

### 3. 重启Cursor
```bash
# 关闭并重新打开Cursor，让MCP配置生效
```

---

## 🚀 第四步：推送代码到GitHub

### 1. 配置Git远程仓库
```bash
# 在你的项目目录执行：
git remote add origin https://github.com/你的用户名/modern-blog-system.git
git branch -M main
```

### 2. 推送代码
```bash
# 推送到GitHub
git push -u origin main
```

### 3. 验证推送成功
```bash
# 访问你的GitHub仓库页面，确认代码已上传
https://github.com/你的用户名/modern-blog-system
```

---

## 🧪 第五步：测试MCP功能

### 1. 基础GitHub操作测试
```bash
# 在Cursor中输入以下命令测试MCP：

"帮我查看GitHub仓库列表"
"查看modern-blog-system仓库的信息"
"显示最新的commits"
"列出仓库中的所有文件"
```

### 2. 仓库管理测试
```bash
"创建一个新的issue：添加用户注册功能"
"搜索代码中包含'blog'的文件"
"查看README.md文件内容"
"显示仓库的贡献者信息"
```

### 3. 代码操作测试
```bash
"帮我在GitHub上创建一个新的分支：feature/user-auth"
"查看最近的pull requests"
"搜索项目中的TODO注释"
"显示项目的技术栈信息"
```

---

## 🔧 第六步：配置其他MCP服务器（可选）

### 1. 文件系统MCP
```json
"filesystem": {
  "command": "npx",
  "args": ["@modelcontextprotocol/server-filesystem", "D:\\mycode\\内容创作"]
}
```

### 2. Git本地操作MCP
```json
"git": {
  "command": "uvx",
  "args": ["mcp-server-git", "--repository", "D:\\mycode\\内容创作"]
}
```

### 3. 搜索引擎MCP
```json
"brave-search": {
  "command": "npx",
  "args": ["@modelcontextprotocol/server-brave-search"],
  "env": {
    "BRAVE_API_KEY": "你的Brave搜索API密钥"
  }
}
```

---

## 📊 MCP功能使用示例

### 项目管理场景
```bash
# AI助手可以帮你：
"分析这个项目的代码结构"
"找出项目中需要优化的地方"
"生成项目的技术文档"
"创建feature开发的issue列表"
```

### 代码开发场景
```bash
"帮我查看类似功能的实现代码"
"搜索项目中的API接口定义"
"分析代码的依赖关系"
"生成单元测试用例"
```

### 部署管理场景
```bash
"检查项目的部署配置文件"
"分析Dockerfile的优化建议"
"查看CI/CD配置状态"
"生成部署文档"
```

---

## 🚨 常见问题解决

### 问题1：Token权限不足
```bash
错误: 403 Forbidden
解决: 重新生成token，确保选择了所有必要权限
```

### 问题2：MCP连接失败
```bash
错误: Command failed
解决: 
1. 检查网络连接
2. 确认token有效性
3. 重启Cursor
```

### 问题3：Git推送失败
```bash
错误: Authentication failed
解决:
1. 检查仓库地址是否正确
2. 确认有仓库写入权限
3. 可能需要使用SSH密钥认证
```

---

## 🎯 下一步：选择部署方案

现在你的项目已经在GitHub上了，可以选择部署方案：

### 🏆 推荐方案
1. **Vercel** - 最简单，自动部署
2. **Railway** - 全栈支持，一体化
3. **Cloudflare** - 性能最佳，MCP原生支持

### 📞 获取帮助
**选择你想要的部署方案，我立即提供详细指导：**
- "我选择Vercel方案"  
- "我选择Railway方案"
- "我选择Cloudflare方案"
- "我想了解所有方案的详细对比"

**准备好进入下一步了吗？** 🚀 