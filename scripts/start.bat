@echo off
chcp 65001 >nul

:: 进入项目根目录
cd /d "%~dp0\.."

:: 检查是否已构建
if not exist "packages\server\dist" (
    echo 未找到构建产物，请先运行构建脚本:
    echo   scripts\build.bat
    exit /b 1
)

:: 设置默认环境变量
if "%NODE_ENV%"=="" set NODE_ENV=production
if "%PORT%"=="" set PORT=3000

echo =========================================
echo   漫画阅读器 - 生产模式
echo =========================================
echo.
echo 端口: %PORT%
echo.
echo 访问地址: http://localhost:%PORT%
echo =========================================

:: 启动服务
cd packages\server
node dist\index.js
