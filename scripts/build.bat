@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo =========================================
echo   漫画阅读器 - 构建脚本
echo =========================================

:: 检查 Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo 错误: 未找到 Node.js，请先安装 Node.js ^>= 18
    exit /b 1
)

:: 检查 pnpm
where pnpm >nul 2>nul
if %errorlevel% neq 0 (
    echo pnpm 未安装，正在安装...
    call npm install -g pnpm
)

:: 进入项目根目录
cd /d "%~dp0\.."

echo.
echo [1/4] 安装依赖...
call pnpm install --frozen-lockfile
if %errorlevel% neq 0 (
    echo 依赖安装失败
    exit /b 1
)

echo.
echo [2/4] 构建前端...
call pnpm --filter client build
if %errorlevel% neq 0 (
    echo 前端构建失败
    exit /b 1
)

echo.
echo [3/4] 构建后端...
call pnpm --filter server build
if %errorlevel% neq 0 (
    echo 后端构建失败
    exit /b 1
)

echo.
echo [4/4] 复制前端产物到后端...
if not exist "packages\server\dist\public" mkdir "packages\server\dist\public"
xcopy /E /I /Y "packages\client\dist\*" "packages\server\dist\public\" >nul

echo.
echo =========================================
echo 构建完成！
echo.
echo 产物目录: packages\server\dist\
echo.
echo 启动命令:
echo   cd packages\server ^&^& node dist\index.js
echo.
echo 或使用:
echo   pnpm start
echo =========================================

endlocal
