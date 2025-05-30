@echo off
echo ====================================
echo    MCP 服务器验证脚本
echo ====================================
echo.

set "PASSED=0"
set "FAILED=0"

echo [测试 1/8] 验证 Node.js 环境...
node --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [✅] Node.js 环境正常
    set /a PASSED+=1
) else (
    echo [❌] Node.js 环境异常
    set /a FAILED+=1
)

echo [测试 2/8] 验证 Python 环境...
python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [✅] Python 环境正常
    set /a PASSED+=1
) else (
    echo [❌] Python 环境异常
    set /a FAILED+=1
)

echo [测试 3/8] 验证 uvx 安装...
uvx --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [✅] uvx 已安装
    set /a PASSED+=1
) else (
    echo [❌] uvx 未安装
    set /a FAILED+=1
)

echo [测试 4/8] 验证 Git 环境...
git --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [✅] Git 环境正常
    set /a PASSED+=1
) else (
    echo [❌] Git 环境异常
    set /a FAILED+=1
)

echo [测试 5/8] 验证文件系统 MCP...
npx --yes @modelcontextprotocol/server-filesystem --help >nul 2>&1
if %errorlevel% equ 0 (
    echo [✅] 文件系统 MCP 可用
    set /a PASSED+=1
) else (
    echo [❌] 文件系统 MCP 不可用
    set /a FAILED+=1
)

echo [测试 6/8] 验证 GitHub MCP...
npx --yes @modelcontextprotocol/server-github --help >nul 2>&1
if %errorlevel% equ 0 (
    echo [✅] GitHub MCP 可用
    set /a PASSED+=1
) else (
    echo [❌] GitHub MCP 不可用
    set /a FAILED+=1
)

echo [测试 7/8] 验证配置文件...
if exist "mcp-config.json" (
    echo [✅] MCP 配置文件存在
    set /a PASSED+=1
) else (
    echo [❌] MCP 配置文件不存在
    set /a FAILED+=1
)

echo [测试 8/8] 验证项目文档...
if exist "README.md" (
    echo [✅] 项目文档存在
    set /a PASSED+=1
) else (
    echo [❌] 项目文档不存在
    set /a FAILED+=1
)

echo.
echo ====================================
echo    验证结果汇总
echo ====================================
echo 通过测试: %PASSED%/8
echo 失败测试: %FAILED%/8
echo.

if %FAILED% gtr 0 (
    echo [警告] 存在 %FAILED% 个问题需要解决
    echo.
    echo 常见解决方案：
    echo 1. 重新运行 install-mcp.bat
    echo 2. 检查网络连接
    echo 3. 确保有足够的磁盘空间
    echo 4. 以管理员权限运行脚本
) else (
    echo [✅] 所有测试通过！MCP 环境配置完成
    echo.
    echo 下一步：
    echo 1. 在 Cursor 中导入 mcp-config.json
    echo 2. 配置必要的 API 密钥
    echo 3. 开始使用全链路开发功能
)

echo.
echo 详细日志已保存到 mcp-verification.log
echo %date% %time% - 验证完成，通过: %PASSED%，失败: %FAILED% >> mcp-verification.log

pause 