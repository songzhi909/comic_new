@echo off

cd /d "%~dp0\.."

if not exist "packages\server\dist\index.js" (
    echo Build not found. Run scripts\build.bat first.
    exit /b 1
)

if "%NODE_ENV%"=="" set NODE_ENV=production
if "%PORT%"=="" set PORT=3000

echo =========================================
echo   Comic Reader - Production Mode
echo =========================================
echo.
echo Port: %PORT%
echo URL: http://localhost:%PORT%
echo =========================================

cd packages\server
node dist\index.js
