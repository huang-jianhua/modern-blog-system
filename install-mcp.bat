@echo off
echo ====================================
echo    Cursor MCP 服务器安装脚本
echo ====================================
echo.

REM 检查 Node.js 是否已安装
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未检测到 Node.js，请先安装 Node.js
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)

REM 检查 Python 是否已安装
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未检测到 Python，请先安装 Python
    echo 下载地址: https://python.org/
    pause
    exit /b 1
)

echo [信息] 开始安装 MCP 服务器...
echo.

REM 安装 uvx (如果尚未安装)
echo [1/10] 安装 uvx...
pip install uvx
if %errorlevel% neq 0 (
    echo [警告] uvx 安装失败，某些服务器可能无法使用
)

REM 安装文件系统服务器
echo [2/10] 安装文件系统服务器...
npx --yes @modelcontextprotocol/server-filesystem --help >nul 2>&1

REM 安装 Git 服务器
echo [3/10] 安装 Git 服务器...
uvx --force mcp-server-git
if %errorlevel% neq 0 (
    echo [警告] Git 服务器安装失败
)

REM 安装 GitHub 服务器
echo [4/10] 安装 GitHub 服务器...
npx --yes @modelcontextprotocol/server-github --help >nul 2>&1

REM 安装 PostgreSQL 服务器
echo [5/10] 安装 PostgreSQL 服务器...
uvx --force mcp-server-postgres
if %errorlevel% neq 0 (
    echo [警告] PostgreSQL 服务器安装失败
)

REM 安装 Docker 服务器
echo [6/10] 安装 Docker 服务器...
uvx --force mcp-server-docker
if %errorlevel% neq 0 (
    echo [警告] Docker 服务器安装失败
)

REM 安装 Slack 服务器
echo [7/10] 安装 Slack 服务器...
npx --yes @modelcontextprotocol/server-slack --help >nul 2>&1

REM 安装 Puppeteer 服务器
echo [8/10] 安装 Puppeteer 服务器...
npx --yes @modelcontextprotocol/server-puppeteer --help >nul 2>&1

REM 安装 Brave Search 服务器
echo [9/10] 安装 Brave Search 服务器...
npx --yes @modelcontextprotocol/server-brave-search --help >nul 2>&1

REM 安装 SQLite 服务器
echo [10/10] 安装 SQLite 服务器...
uvx --force mcp-server-sqlite
if %errorlevel% neq 0 (
    echo [警告] SQLite 服务器安装失败
)

echo.
echo ====================================
echo    安装完成！
echo ====================================
echo.
echo 下一步操作：
echo 1. 编辑 mcp-config.json 文件，填入您的 API 密钥
echo 2. 将配置文件导入到 Cursor 设置中
echo 3. 运行 verify-mcp.bat 验证安装
echo.
pause 