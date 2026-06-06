# Start the backend API (http://localhost:8001)
# Usage:  powershell -ExecutionPolicy Bypass -File run.ps1
$here = $PSScriptRoot
Push-Location $here
try {
  & "$here\.venv\Scripts\python.exe" -m uvicorn server:app --host 0.0.0.0 --port 8001 --reload
} finally {
  Pop-Location
}
