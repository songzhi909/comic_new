@echo off
chcp 65001 >nul

:: 进入项目根目录
cd /d "%~dp0\.."

echo =========================================
echo   漫画阅读器 - 开发模式
echo =========================================
echo.
echo 前端: http://localhost:5173
echo 后端: http://localhost:3000
echo.
echo 按 Ctrl+C 停止服务
echo =========================================

:: 同时启动前后端
call pnpm dev
