@echo off
REM PathForge Database Reset Scripts
REM Run these commands from the project root directory

echo PathForge Database Cleaner
echo =========================
echo.

if "%1"=="" (
    echo Usage: reset-db.bat [method]
    echo.
    echo Methods:
    echo   docker     - Complete Docker reset ^(removes containers, volumes, data^)
    echo   tables     - Drop and recreate all database tables
    echo   users      - Delete all users only
    echo   jobs       - Delete all jobs only  
    echo   data       - Delete all users and jobs
    echo   file       - Delete the entire database file
    echo.
    echo Examples:
    echo   reset-db.bat docker
    echo   reset-db.bat tables
    echo   reset-db.bat users
    goto :EOF
)

if "%1"=="docker" (
    echo 🐳 Performing complete Docker reset...
    echo Stopping containers and removing volumes...
    docker-compose down -v --remove-orphans
    echo.
    echo ✅ Docker reset complete. Run 'docker-compose up --build' to restart fresh.
    goto :EOF
)

if "%1"=="tables" (
    echo 🗑️ Dropping and recreating all database tables...
    cd server
    node scripts/reset-database.js drop-tables
    cd ..
    goto :EOF
)

if "%1"=="users" (
    echo 👥 Deleting all users...
    cd server
    node scripts/reset-database.js delete-users
    cd ..
    goto :EOF
)

if "%1"=="jobs" (
    echo 💼 Deleting all jobs...
    cd server  
    node scripts/reset-database.js delete-jobs
    cd ..
    goto :EOF
)

if "%1"=="data" (
    echo 🧹 Deleting all user data...
    cd server
    node scripts/reset-database.js delete-all-data  
    cd ..
    goto :EOF
)

if "%1"=="file" (
    echo 💾 Deleting entire database file...
    cd server
    node scripts/reset-database.js delete-file
    cd ..
    goto :EOF
)

echo ❌ Unknown method: %1
echo Run 'reset-db.bat' without arguments to see usage.