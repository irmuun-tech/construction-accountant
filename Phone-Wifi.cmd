@echo off
rem ============================================================
rem  Утсаар Wi-Fi-аар нээх / Phone access over Wi-Fi.
rem  Давхар дар -> "Yes" (админ) -> утасны хаяг гарч ирнэ.
rem  Double-click -> approve admin prompt -> shows your phone URL.
rem ============================================================
powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process -Verb RunAs powershell -ArgumentList '-NoProfile -ExecutionPolicy Bypass -File \"%~dp0phone-access.ps1\"'"
