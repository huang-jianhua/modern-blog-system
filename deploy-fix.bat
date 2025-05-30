@echo off
echo 🔧 修复Cloudflare Pages部署...
echo.

echo ✅ 第一步：提交修复到GitHub
git add .
git commit -m "修复Cloudflare Pages部署配置 - 添加完整前端项目结构"
git push origin main

echo.
echo ✅ 修复文件已推送到GitHub！
echo.
echo 📋 接下来请手动执行：
echo 1. 访问 https://dash.cloudflare.com/
echo 2. 找到你的 modern-blog-system 项目
echo 3. 点击 "Settings" 标签
echo 4. 更新构建配置：
echo    - Framework preset: Vite
echo    - Build command: cd blog-system/packages/frontend ^&^& npm install ^&^& npm run build
echo    - Build output directory: blog-system/packages/frontend/dist
echo    - Root directory: /
echo    - Node.js version: 18
echo 5. 点击 "Save" 保存配置
echo 6. 点击 "Deployments" 标签
echo 7. 点击 "Retry deployment" 重新部署
echo.
echo 🎉 部署完成后访问: https://modern-blog-system.pages.dev
echo.
pause 