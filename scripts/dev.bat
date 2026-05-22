@echo off

cd /d "%~dp0\.."

echo =========================================
echo   Comic Reader - Dev Mode
echo =========================================
echo.
echo Frontend: http://localhost:5173
echo Backend: http://localhost:3000
echo =========================================

call pnpm dev
