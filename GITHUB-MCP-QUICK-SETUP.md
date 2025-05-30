# 🚀 GitHub MCP 快速配置指南

## 问题诊断

✅ **GitHub MCP服务器** - 已安装并可正常运行  
❌ **GitHub Token** - 需要配置真实的GitHub Personal Access Token  

## 🔧 立即解决

### 第1步：生成GitHub Token

1. **打开链接**：https://github.com/settings/tokens
2. **点击**："Generate new token" → "Tokens (classic)"
3. **设置权限**：
   ```
   ✅ repo (完整仓库访问)
   ✅ workflow (GitHub Actions)
   ✅ user (用户信息)
   ✅ admin:public_key (公钥管理)
   ✅ write:packages (包权限)
   ```
4. **复制Token**：格式类似 `ghp_xxxxxxxxxxxxxxxxxxxx`

### 第2步：更新配置

1. **打开文件**：`mcp-config.json`
2. **找到这一行**：
   ```json
   "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_请在这里替换为您的真实GitHub Token"
   ```
3. **替换为**：
   ```json
   "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_你的实际token"
   ```

### 第3步：重启Cursor

配置完成后，重启Cursor让MCP配置生效。

## 🧪 测试命令

配置完成后，在Cursor中尝试：

```
"帮我查看GitHub仓库列表"
"显示modern-blog-system仓库信息"
"在仓库中搜索React相关代码"
"创建一个新的issue"
```

## 📞 获取帮助

如果遇到问题：
1. 检查Token权限是否足够
2. 确认网络可以访问GitHub API
3. 查看Cursor的MCP日志

---

**⚠️ 安全提醒**：请妥善保管您的GitHub Token，不要分享给他人！ 