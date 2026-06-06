# Локал веб сервер (HttpListener — admin эрх шаардахгүй, найдвартай)
# Ажиллуулах:  powershell -ExecutionPolicy Bypass -File serve.ps1
param([int]$Port = 8080)

$root = $PSScriptRoot
$mime = @{
  '.html' = 'text/html; charset=utf-8'
  '.css'  = 'text/css; charset=utf-8'
  '.js'   = 'text/javascript; charset=utf-8'
  '.json' = 'application/json; charset=utf-8'
  '.webmanifest' = 'application/manifest+json; charset=utf-8'
  '.png'  = 'image/png'; '.svg' = 'image/svg+xml'; '.ico' = 'image/x-icon'
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Host ("Сервер аслаа:  http://localhost:{0}/" -f $Port) -ForegroundColor Green
Write-Host "Зогсоох: энэ цонхыг хаа." -ForegroundColor Yellow

while ($listener.IsListening) {
  try {
    $ctx = $listener.GetContext()             # зөвхөн бодит хүсэлт ирэхэд буцна
    $req = $ctx.Request
    $res = $ctx.Response

    $path = $req.Url.AbsolutePath
    if ($path -eq '/' -or $path -eq '') { $path = '/index.html' }
    $rel = [Uri]::UnescapeDataString($path.TrimStart('/')) -replace '/', '\'
    $full = [System.IO.Path]::GetFullPath((Join-Path $root $rel))

    if ($full.StartsWith([System.IO.Path]::GetFullPath($root)) -and (Test-Path $full -PathType Leaf)) {
      $bytes = [System.IO.File]::ReadAllBytes($full)
      $ext = [System.IO.Path]::GetExtension($full).ToLower()
      $res.ContentType = if ($mime.ContainsKey($ext)) { $mime[$ext] } else { 'application/octet-stream' }
      $res.Headers.Add('Cache-Control', 'no-cache')
      $res.ContentLength64 = $bytes.Length
      $res.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
      $res.StatusCode = 404
      $body = [System.Text.Encoding]::UTF8.GetBytes("404: $path")
      $res.OutputStream.Write($body, 0, $body.Length)
    }
    $res.OutputStream.Close()
  } catch {
    # ганц хүсэлтийн алдааг алгасаад үргэлжлүүлнэ
  }
}
