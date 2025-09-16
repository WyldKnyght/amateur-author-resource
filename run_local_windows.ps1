# .myfiles\admin_files\start_dev.ps1

$projectRoot = "W:\Repos-Github\amateur-author-resource"

# Start backend
Start-Process powershell -ArgumentList "cd `"$projectRoot\backend`"; uvicorn app.main:app --reload"

# Start frontend
Start-Process powershell -ArgumentList "cd `"$projectRoot\frontend`"; npm run dev"

Write-Host "Both backend and frontend started in new PowerShell terminals."
