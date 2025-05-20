@echo off
REM Get the directory where this script is located
SET SCRIPT_DIR=%~dp0

REM Change to the script directory
cd /d "%SCRIPT_DIR%"

ECHO ===================================
ECHO Indian Stock Analyzer Starter
ECHO ===================================
ECHO.
ECHO Starting application from: %CD%
ECHO.

REM Stop any existing processes using ports
ECHO Stopping any existing processes on ports...
FOR /F "tokens=5" %%P IN ('netstat -ano ^| findstr :3005') DO (
    ECHO Stopping process on port 3005 (frontend) (PID: %%P)
    taskkill /F /PID %%P 2>NUL
)
FOR /F "tokens=5" %%P IN ('netstat -ano ^| findstr :5005') DO (
    ECHO Stopping process on port 5005 (backend) (PID: %%P)
    taskkill /F /PID %%P 2>NUL
)
FOR /F "tokens=5" %%P IN ('netstat -ano ^| findstr :5005') DO (
    ECHO Stopping process on port 5005 (PID: %%P)
    taskkill /F /PID %%P 2>NUL
)
FOR /F "tokens=5" %%P IN ('netstat -ano ^| findstr :3000') DO (
    ECHO Stopping process on port 3000 (PID: %%P)
    taskkill /F /PID %%P 2>NUL
)
FOR /F "tokens=5" %%P IN ('netstat -ano ^| findstr :3001') DO (
    ECHO Stopping process on port 3001 (PID: %%P)
    taskkill /F /PID %%P 2>NUL
)
FOR /F "tokens=5" %%P IN ('netstat -ano ^| findstr :3002') DO (
    ECHO Stopping process on port 3002 (PID: %%P)
    taskkill /F /PID %%P 2>NUL
)
FOR /F "tokens=5" %%P IN ('netstat -ano ^| findstr :3003') DO (
    ECHO Stopping process on port 3003 (PID: %%P)
    taskkill /F /PID %%P 2>NUL
)
FOR /F "tokens=5" %%P IN ('netstat -ano ^| findstr :3005') DO (
    ECHO Stopping process on port 3005 (PID: %%P)
    taskkill /F /PID %%P 2>NUL
)

REM Install backend dependencies
ECHO Installing backend dependencies...
cd backend
npm install dotenv helmet express-rate-limit --save
IF %ERRORLEVEL% NEQ 0 (
    ECHO Failed to install backend dependencies
    EXIT /B %ERRORLEVEL%
)

REM Return to root directory
cd /d "%SCRIPT_DIR%"

REM Set environment variables for different ports
set PORT=5005
set FRONTEND_PORT=3005
set STOCK_API_KEY=sk-live-0KwlkkkbLj6KxWuyNimN0gkigsRck7mYP1CTq3Zq
set NEXT_PUBLIC_API_URL=http://localhost:5005/api

ECHO Running application with:
ECHO - Backend on port %PORT%
ECHO - Frontend on port %FRONTEND_PORT%
ECHO.

ECHO ======================================
ECHO STOCK-SENSE STARTER
ECHO ======================================
ECHO Starting backend server...
start cmd /k "cd %~dp0 && set PORT=5005 && set STOCK_API_KEY=sk-live-0KwlkkkbLj6KxWuyNimN0gkigsRck7mYP1CTq3Zq && node start-backend.js"
ECHO Starting frontend server...
timeout /t 3 /nobreak > nul
start cmd /k "cd %~dp0 && set NEXT_PUBLIC_API_URL=http://localhost:5005/api && node start-frontend.js"

ECHO.
ECHO Backend: http://localhost:5005/api/health
ECHO Frontend: http://localhost:3005
ECHO.
ECHO Press Ctrl+C in the server windows to stop.

PAUSE