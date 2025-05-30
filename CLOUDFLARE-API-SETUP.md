# 🔧 Cloudflare API 快速配置指南

## 🎯 目标
为你的博客系统配置Cloudflare MCP，让AI能够直接管理你的Cloudflare Pages部署。

## 📋 第一步：获取Cloudflare API Token

### 1. 访问Cloudflare API Token页面
```
https://dash.cloudflare.com/profile/api-tokens
```

### 2. 创建自定义Token
点击 "Create Token" → "Custom token"

**权限设置：**
- `Zone:Zone:Read` - 读取域名信息
- `Zone:Zone Settings:Edit` - 编辑域名设置  
- `Zone:Page Rules:Edit` - 编辑页面规则
- `Cloudflare Pages:Edit` - 编辑Pages项目
- `Account:Cloudflare Pages:Edit` - 账户级Pages权限
- `User:User Details:Read` - 读取用户信息

**资源设置：**
- Account resources: `Include - All accounts`
- Zone resources: `Include - All zones`

### 3. 获取Account ID
在Cloudflare Dashboard右侧栏找到：
```
Account ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

## 🔄 第二步：更新MCP配置

将获取的信息填入你的MCP配置文件：

```json
{
  "mcpServers": {
    "cloudflare": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-cloudflare"],
      "env": {
        "CLOUDFLARE_API_TOKEN": "你的API Token",
        "CLOUDFLARE_ACCOUNT_ID": "你的Account ID"
      }
    }
  }
}
```

## 🚀 第三步：诊断部署问题

配置完成后，AI可以帮你：

### 1. 检查Pages项目状态
```
"检查我的Cloudflare Pages项目状态"
"查看modern-blog-system的部署日志"
```

### 2. 分析访问问题
```
"为什么我的网站https://modern-blog-system.pages.dev访问不了？"
"检查DNS和SSL配置"
```

### 3. 修复常见问题
```
"重新部署我的Pages项目"
"更新构建配置"
"检查环境变量设置"
```

## 🔍 常见部署问题排查

### 问题1：404错误
**可能原因：**
- 构建输出目录配置错误
- 没有index.html文件
- 路由配置问题

**解决方案：**
```bash
# 检查构建配置
Build command: npm run build
Build output directory: dist (或 build)
Root directory: / (或具体的子目录)
```

### 问题2：构建失败
**可能原因：**
- Node.js版本不兼容
- 依赖安装失败
- 环境变量缺失

**解决方案：**
```bash
# 设置环境变量
NODE_VERSION=18
NPM_VERSION=9
NODE_ENV=production
```

### 问题3：白屏或加载错误
**可能原因：**
- 静态资源路径错误
- API接口配置问题
- 缓存问题

**解决方案：**
```bash
# 清除缓存并重新部署
# 检查资源路径配置
# 验证API端点
```

## 📞 获取帮助

配置完成后，你可以直接问AI：
- "帮我检查Cloudflare Pages部署状态"
- "为什么我的网站访问不了？"
- "重新部署我的博客系统"
- "优化我的Cloudflare配置"

AI将通过MCP直接操作你的Cloudflare账户来解决问题！ 