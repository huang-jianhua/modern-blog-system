# 🚀 Cursor MCP 全链路开发 - 快速开始指南

## 📦 一键安装

### Windows 用户（推荐）
```bash
# 1. 双击运行安装脚本
install-mcp.bat

# 2. 运行验证脚本
verify-mcp.bat
```

### 手动安装
```bash
# 安装 Node.js 依赖
npm install -g @modelcontextprotocol/server-filesystem
npm install -g @modelcontextprotocol/server-github
npm install -g @modelcontextprotocol/server-slack
npm install -g @modelcontextprotocol/server-puppeteer
npm install -g @modelcontextprotocol/server-brave-search

# 安装 Python 依赖
pip install uvx
uvx mcp-server-git
uvx mcp-server-postgres
uvx mcp-server-docker
uvx mcp-server-sqlite
```

## ⚙️ Cursor 配置

### 1. 打开 Cursor 设置
- 按下 `Ctrl + ,` 打开设置
- 搜索 "MCP"
- 找到 "Model Context Protocol" 设置

### 2. 导入配置文件
- 点击 "Import Configuration"
- 选择项目根目录下的 `mcp-config.json`
- 或者手动复制配置内容

### 3. 配置 API 密钥
需要配置以下服务的 API 密钥：

#### GitHub Token
```bash
# 1. 访问 https://github.com/settings/tokens
# 2. 创建新的 Personal Access Token
# 3. 选择以下权限：
#    - repo (完整仓库访问)
#    - workflow (GitHub Actions)
#    - read:org (读取组织信息)
```

#### Slack Token（可选）
```bash
# 1. 访问 https://api.slack.com/apps
# 2. 创建新应用
# 3. 获取 Bot User OAuth Token
```

#### Brave Search API（可选）
```bash
# 1. 访问 https://api.search.brave.com/
# 2. 注册账户
# 3. 获取 API 密钥
```

### 4. 编辑配置文件
```json
{
  "mcpServers": {
    "github": {
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_your_token_here"
      }
    },
    "slack": {
      "env": {
        "SLACK_BOT_TOKEN": "xoxb-your-token-here"
      }
    },
    "brave-search": {
      "env": {
        "BRAVE_API_KEY": "your_brave_api_key_here"
      }
    }
  }
}
```

## 🎯 快速验证

### 测试基础功能
在 Cursor 中输入以下命令测试：

```markdown
1. 文件操作测试：
   "帮我创建一个新的 React 组件"

2. Git 操作测试：
   "查看当前仓库状态"

3. GitHub 集成测试：
   "列出我的所有仓库"

4. 搜索功能测试：
   "搜索 React 18 的新特性"
```

### 验证高级功能
```markdown
1. 全项目分析：
   "分析这个项目的代码质量"

2. 自动化测试：
   "为这个组件生成单元测试"

3. 部署准备：
   "准备生产环境的 Docker 配置"

4. 性能优化：
   "分析并优化页面加载速度"
```

## 🛠️ 常见问题

### Q1: MCP 服务器启动失败
```bash
# 解决方案：
1. 检查 Node.js 和 Python 版本
2. 重新安装依赖包
3. 检查防火墙设置
4. 以管理员权限运行
```

### Q2: GitHub 集成无法使用
```bash
# 解决方案：
1. 确认 Token 权限正确
2. 检查网络连接
3. 验证 Token 是否过期
4. 重启 Cursor
```

### Q3: 文件权限错误
```bash
# 解决方案：
1. 修改文件夹权限
2. 在配置中指定正确路径
3. 使用绝对路径
```

## 📈 使用技巧

### 1. 提升开发效率
- 使用语义化的命令描述需求
- 结合多个 MCP 服务器完成复杂任务
- 定期更新配置和依赖

### 2. 最佳实践
- 保持 API 密钥安全
- 定期备份配置文件
- 监控服务器性能

### 3. 扩展建议
- 根据项目需求添加特定 MCP 服务器
- 自定义快捷键和工作流
- 集成团队协作工具

## 🎉 开始使用

配置完成后，您就可以开始享受 Cursor 的全链路开发体验了！

**推荐第一个任务**：
```markdown
"帮我创建一个完整的 Web 应用项目，包括前端、后端、数据库和部署配置"
```

这将展示 MCP 集成的强大能力，让您快速体验全链路开发的便利性。

---

**需要帮助？** 查看 `README.md` 获取详细文档，或运行 `verify-mcp.bat` 进行故障诊断。 