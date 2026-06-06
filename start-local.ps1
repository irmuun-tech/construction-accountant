# ============================================================
#  Барилгын Нягтлан (cloud) — локал орчинд бүгдийг асаах
#  Starts MongoDB + backend API + frontend, then opens browser.
# ============================================================
$root  = $PSScriptRoot
$mongo = Join-Path $env:USERPROFILE "scoop\shims\mongod.exe"
$data  = Join-Path $root "backend\.mongodata"
New-Item -ItemType Directory -Force -Path $data | Out-Null

# 1) MongoDB (skip if already listening on 27017)
$mongoUp = Test-NetConnection -ComputerName 127.0.0.1 -Port 27017 -InformationLevel Quiet -WarningAction SilentlyContinue
if (-not $mongoUp) {
  if (Test-Path $mongo) {
    Start-Process -WindowStyle Minimized -FilePath $mongo -ArgumentList "--dbpath","`"$data`"","--port","27017","--bind_ip","127.0.0.1"
    Write-Host "MongoDB starting..." -ForegroundColor Green
    Start-Sleep -Seconds 3
  } else {
    Write-Host "mongod олдсонгүй / not found. Run:  scoop install mongodb" -ForegroundColor Yellow
  }
} else {
  Write-Host "MongoDB аль хэдийн ажиллаж байна / already running." -ForegroundColor DarkGray
}

# 2) Backend API (http://localhost:8001)
Start-Process -WindowStyle Minimized -FilePath "powershell" -ArgumentList "-ExecutionPolicy","Bypass","-File","`"$root\backend\run.ps1`""
Write-Host "Backend API:  http://localhost:8001" -ForegroundColor Green

# 3) Frontend (http://localhost:8080)
Start-Process -WindowStyle Minimized -FilePath "powershell" -ArgumentList "-ExecutionPolicy","Bypass","-File","`"$root\frontend\serve.ps1`"","-Port","8080"
Write-Host "Frontend:     http://localhost:8080" -ForegroundColor Green

Start-Sleep -Seconds 4
Start-Process "http://localhost:8080/"
Write-Host "`nАпп хөтөч дээр нээгдэж байна. Зогсоохдоо багасгасан цонхнуудыг хаа." -ForegroundColor Cyan
Write-Host "App opening in your browser. Close the minimized windows to stop." -ForegroundColor Cyan
