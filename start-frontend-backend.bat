@echo off
setlocal

set "ROOT=%~dp0"
set "PY_CMD=python"
set "VENV_PY=%ROOT%.venv\Scripts\python.exe"

if exist "%VENV_PY%" (
  set "PY_CMD="%VENV_PY%""
) else (
  where python >nul 2>nul
  if errorlevel 1 (
    set "PY_CMD=py"
  )
)

echo Starting backend and frontend...
echo.

start "Backend - Flask" cmd /k "cd /d ""%ROOT%Backend"" && %PY_CMD% app.py"

REM Small delay so backend has a head start.
timeout /t 2 >nul

start "Frontend - Electron" cmd /k "cd /d ""%ROOT%electron"" && npm start"

echo Done. Two terminal windows were opened.
endlocal
