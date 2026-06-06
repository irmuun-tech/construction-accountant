@echo off
rem ============================================================
rem  Барилгын Нягтлан (cloud) — энэ файл дээр давхар дарж асаа.
rem  Double-click to launch (MongoDB + backend + frontend).
rem ============================================================
start "" powershell -ExecutionPolicy Bypass -File "%~dp0start-local.ps1"
exit
