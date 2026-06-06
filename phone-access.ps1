# ============================================================
#  Утсаар Wi-Fi-аар холбох / Use the app from your phone (same Wi-Fi)
#  Энэ скрипт: галт ханын зөвшөөрөл нэмж, серверүүдийг асааж, утасны хаягийг харуулна.
#  (Админ эрхээр ажиллана — Phone-Wifi.cmd ашиглаж эхлүүлнэ үү.)
# ============================================================
$ErrorActionPreference = 'SilentlyContinue'
$root   = 'C:\Users\Dell\construction-accountant'
$venvpy = "$root\backend\.venv\Scripts\python.exe"
$deno   = Join-Path $env:USERPROFILE 'scoop\shims\deno.exe'
$mongo  = Join-Path $env:USERPROFILE 'scoop\shims\mongod.exe'
$data   = "$root\backend\.mongodata"

# --- LAN IP ---
$ip = (Get-NetIPAddress -AddressFamily IPv4 |
  Where-Object { $_.IPAddress -notlike '127.*' -and $_.IPAddress -notlike '169.254.*' -and $_.PrefixOrigin -ne 'WellKnown' } |
  Select-Object -First 1).IPAddress
if (-not $ip) { $ip = 'localhost' }

# --- Firewall rules (needs admin; idempotent) ---
foreach ($port in 8001, 8090) {
  $name = "Construction Accountant $port"
  if (-not (Get-NetFirewallRule -DisplayName $name -ErrorAction SilentlyContinue)) {
    New-NetFirewallRule -DisplayName $name -Direction Inbound -Action Allow -Protocol TCP -LocalPort $port -Profile Any | Out-Null
    Write-Host "Firewall зөвшөөрөл нэмлээ / rule added: TCP $port" -ForegroundColor Green
  }
}

function PortUp($p) { [bool](Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue) }

# --- MongoDB ---
if (-not (PortUp 27017)) {
  New-Item -ItemType Directory -Force -Path $data | Out-Null
  Start-Process -WindowStyle Minimized -FilePath $mongo -ArgumentList "--dbpath","`"$data`"","--port","27017","--bind_ip","127.0.0.1"
  Start-Sleep -Seconds 3
}
# --- Backend (all interfaces) ---
if (-not (PortUp 8001)) {
  Start-Process -WindowStyle Minimized -FilePath $venvpy -ArgumentList "-m","uvicorn","server:app","--host","0.0.0.0","--port","8001" -WorkingDirectory "$root\backend"
}
# --- Frontend (all interfaces, port 8090 — 8080 is reserved by Windows) ---
if (-not (PortUp 8090)) {
  Start-Process -WindowStyle Minimized -FilePath $deno -ArgumentList "run","--allow-net","--allow-read","jsr:@std/http/file-server","`"$root\frontend`"","--host","0.0.0.0","--port","8090"
}

Start-Sleep -Seconds 3
Write-Host ""
Write-Host "===================================================================" -ForegroundColor Cyan
Write-Host "  Утсаа ИЖИЛ Wi-Fi-д холбоод, Chrome/Safari-аар доорхийг нээ:" -ForegroundColor Green
Write-Host "  On your phone (SAME Wi-Fi), open this in Chrome/Safari:" -ForegroundColor Green
Write-Host ""
Write-Host "        http://$($ip):8090" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Дараа нь цэс -> 'Add to Home screen' дарж дүрс үүсгэж болно." -ForegroundColor Gray
Write-Host "  Серверийн жижиг цонхнуудыг нээлттэй орхи (хаавал апп зогсоно)." -ForegroundColor DarkGray
Write-Host "===================================================================" -ForegroundColor Cyan
Read-Host "Хаахын тулд Enter дар / Press Enter to close this window"
