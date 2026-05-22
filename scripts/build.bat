@echo off

echo =========================================
echo   Comic Reader - Build Script
echo =========================================

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: Node.js not found
    exit /b 1
)

where pnpm >nul 2>nul
if %errorlevel% neq 0 (
    echo Installing pnpm...
    call npm install -g pnpm
)

cd /d "%~dp0\.."

echo.
echo [1/4] Installing dependencies...
call pnpm install --frozen-lockfile
if %errorlevel% neq 0 (
    echo Failed to install dependencies
    exit /b 1
)

echo.
echo [2/4] Building frontend...
call pnpm --filter client build
if %errorlevel% neq 0 (
    echo Frontend build failed
    exit /b 1
)

echo.
echo [3/4] Building backend...
call pnpm --filter server build
if %errorlevel% neq 0 (
    echo Backend build failed
    exit /b 1
)

echo.
echo [4/4] Copying frontend assets...
if not exist "packages\server\dist\public" mkdir "packages\server\dist\public"
xcopy /E /I /Y "packages\client\dist\*" "packages\server\dist\public\" >nul

echo.
echo =========================================
echo Build complete!
echo.
echo Output: packages\server\dist\
echo.
echo Start command:
echo   cd packages\server ^&^& node dist\index.js
echo =========================================
