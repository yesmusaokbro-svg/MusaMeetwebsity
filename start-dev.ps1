# MusaMeet Development Startup Script

Write-Host "🚀 Starting MusaMeet Development Environment..." -ForegroundColor Cyan

# Start server in a new PowerShell window
Write-Host "Starting backend server on port 3001..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\server'; npm start"

# Wait a moment for server to initialize
Start-Sleep -Seconds 3

# Start client in a new PowerShell window
Write-Host "Starting frontend client..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\client'; npm run dev"

Write-Host ""
Write-Host "✅ Both services are starting!" -ForegroundColor Green
Write-Host ""
Write-Host "📡 Backend: http://localhost:3001" -ForegroundColor Yellow
Write-Host "🌐 Frontend: http://localhost:5173" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C in each window to stop the services" -ForegroundColor Gray
