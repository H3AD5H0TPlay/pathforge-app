# PathForge Database Reset Script (PowerShell)
param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("docker", "tables", "users", "jobs", "data", "file", "help")]
    [string]$Method = "help"
)

Write-Host "🔧 PathForge Database Cleaner" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan
Write-Host ""

switch ($Method) {
    "docker" {
        Write-Host "🐳 Performing complete Docker reset..." -ForegroundColor Yellow
        Write-Host "Stopping containers and removing volumes..." -ForegroundColor Gray
        
        docker-compose down -v --remove-orphans
        
        Write-Host ""
        Write-Host "✅ Docker reset complete!" -ForegroundColor Green
        Write-Host "Run 'docker-compose up --build' to restart with fresh database." -ForegroundColor Gray
    }
    
    "tables" {
        Write-Host "🗑️ Dropping and recreating all database tables..." -ForegroundColor Yellow
        Push-Location server
        node scripts/reset-database.js drop-tables
        Pop-Location
    }
    
    "users" {
        Write-Host "👥 Deleting all users..." -ForegroundColor Yellow  
        Push-Location server
        node scripts/reset-database.js delete-users
        Pop-Location
    }
    
    "jobs" {
        Write-Host "💼 Deleting all jobs..." -ForegroundColor Yellow
        Push-Location server  
        node scripts/reset-database.js delete-jobs
        Pop-Location
    }
    
    "data" {
        Write-Host "🧹 Deleting all user data (users + jobs)..." -ForegroundColor Yellow
        Push-Location server
        node scripts/reset-database.js delete-all-data
        Pop-Location
    }
    
    "file" {
        Write-Host "💾 Deleting entire database file..." -ForegroundColor Red
        Write-Host "⚠️ WARNING: This will completely remove the database file!" -ForegroundColor Yellow
        $confirm = Read-Host "Are you sure? (y/N)"
        if ($confirm -eq "y" -or $confirm -eq "Y") {
            Push-Location server
            node scripts/reset-database.js delete-file
            Pop-Location
        } else {
            Write-Host "❌ Operation cancelled." -ForegroundColor Red
        }
    }
    
    default {
        Write-Host "Usage: .\reset-db.ps1 [method]" -ForegroundColor White
        Write-Host ""
        Write-Host "Methods:" -ForegroundColor White
        Write-Host "  docker    - Complete Docker reset (removes containers, volumes, data)" -ForegroundColor Gray
        Write-Host "  tables    - Drop and recreate all database tables" -ForegroundColor Gray  
        Write-Host "  users     - Delete all users only" -ForegroundColor Gray
        Write-Host "  jobs      - Delete all jobs only" -ForegroundColor Gray
        Write-Host "  data      - Delete all users and jobs" -ForegroundColor Gray
        Write-Host "  file      - Delete the entire database file" -ForegroundColor Gray
        Write-Host ""
        Write-Host "Examples:" -ForegroundColor White
        Write-Host "  .\reset-db.ps1 docker" -ForegroundColor Cyan
        Write-Host "  .\reset-db.ps1 tables" -ForegroundColor Cyan
        Write-Host "  .\reset-db.ps1 users" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "💡 Tip: Use 'docker' method for complete clean slate" -ForegroundColor Green
    }
}