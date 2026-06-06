@echo off
rem ============================================================
rem  Барилгын Нягтлан — энэ файл дээр давхар дарж аппыг нээнэ.
rem  Double-click this file to launch the app.
rem ============================================================
rem  Сервер тусдаа цонхонд асна (хаавал апп зогсоно).
rem  The server runs in its own window — close it to stop the app.
start "Барилгын Нягтлан сервер" /min powershell -ExecutionPolicy Bypass -File "%~dp0serve.ps1" -Port 8080
rem  Сервер бэлэн болтол түр хүлээгээд хөтчийг нээнэ.
powershell -NoProfile -Command "Start-Sleep -Seconds 2"
start "" http://localhost:8080/
exit
