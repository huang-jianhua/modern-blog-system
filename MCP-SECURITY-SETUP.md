# MCP 安全配置指南

## ⚠️ 重要安全提醒

在配置MCP服务器时，**绝对不要**将真实的API密钥、访问令牌等敏感信息直接写入配置文件并提交到Git仓库！

## 🔒 安全配置步骤

### 1. 创建环境变量文件

在项目根目录创建 `.env` 文件（此文件已被.gitignore忽略）：

```bash
# 复制以下内容到 .env 文件
GITHUB_PERSONAL_ACCESS_TOKEN=your_real_github_token_here
SLACK_BOT_TOKEN=your_real_slack_token_here
BRAVE_API_KEY=your_real_brave_api_key_here
NOTION_API_KEY=your_real_notion_api_key_here
NOTION_DATABASE_ID=your_real_notion_database_id_here
POSTGRES_CONNECTION_STRING=postgresql://user:password@localhost:5432/dbname
```

### 2. 获取API密钥

#### GitHub Personal Access Token
1. 访问 https://github.com/settings/tokens
2. 点击 "Generate new token (classic)"
3. 选择所需权限：`repo`, `workflow`, `admin:org`
4. 复制生成的token到 `.env` 文件

#### Slack Bot Token
1. 访问 https://api.slack.com/apps
2. 创建新应用或选择现有应用
3. 在 "OAuth & Permissions" 页面获取 Bot User OAuth Token
4. 复制token到 `.env` 文件

#### Brave Search API
1. 访问 https://api.search.brave.com/app/keys
2. 注册并创建API密钥
3. 复制密钥到 `.env` 文件

#### Notion API
1. 访问 https://www.notion.so/my-integrations
2. 创建新集成
3. 复制Internal Integration Token到 `.env` 文件

### 3. 修改MCP配置文件

将 `mcp-config.json` 中的硬编码值替换为环境变量：

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_PERSONAL_ACCESS_TOKEN}"
      }
    }
  }
}
```

### 4. 使用配置加载脚本

创建一个配置加载脚本 `load-mcp-config.js`：

```javascript
const fs = require('fs');
const path = require('path');

// 加载环境变量
require('dotenv').config();

// 读取配置模板
const configTemplate = fs.readFileSync('mcp-config.json', 'utf8');

// 替换环境变量
let config = configTemplate;
Object.keys(process.env).forEach(key => {
  const placeholder = `\${${key}}`;
  config = config.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), process.env[key]);
});

// 写入最终配置
fs.writeFileSync('mcp-config-final.json', config);
console.log('MCP配置已生成：mcp-config-final.json');
```

## 🚨 紧急情况处理

如果你已经意外提交了包含敏感信息的文件：

### 1. 立即撤销API密钥
- 前往对应服务平台撤销/重新生成API密钥
- GitHub: https://github.com/settings/tokens
- Slack: https://api.slack.com/apps

### 2. 清理Git历史
```bash
# 从Git历史中完全删除敏感文件
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch mcp-config.json' \
  --prune-empty --tag-name-filter cat -- --all

# 强制推送清理后的历史
git push origin --force --all
```

### 3. 添加到.gitignore
确保敏感文件已添加到 `.gitignore`：
```
.env
.env.local
.env.*.local
mcp-config.json
config/secrets.json
```

## ✅ 最佳实践

1. **永远不要**在代码中硬编码敏感信息
2. **始终使用**环境变量或安全的密钥管理服务
3. **定期轮换**API密钥和访问令牌
4. **使用最小权限原则**配置API权限
5. **监控**API密钥的使用情况

## 📞 需要帮助？

如果在配置过程中遇到问题，请：
1. 检查 `.env` 文件是否正确创建
2. 确认API密钥是否有效
3. 验证权限配置是否正确
4. 查看MCP服务器日志获取详细错误信息 