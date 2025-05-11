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

REM Stop any existing processes using ports 5002 and 3001
ECHO Stopping any existing processes on ports...
FOR /F "tokens=5" %%P IN ('netstat -ano ^| findstr :5001') DO (
    ECHO Stopping process on port 5001 (PID: %%P)
    taskkill /F /PID %%P 2>NUL
)
FOR /F "tokens=5" %%P IN ('netstat -ano ^| findstr :5002') DO (
    ECHO Stopping process on port 5002 (PID: %%P)
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
set PORT=5002
set FRONTEND_PORT=3001
set NEXT_PUBLIC_API_URL=http://localhost:5002/api

ECHO Running application with:
ECHO - Backend on port %PORT%
ECHO - Frontend on port %FRONTEND_PORT%
ECHO.

REM Run the application with custom ports
node run.js --backend-port=%PORT% --frontend-port=%FRONTEND_PORT%

PAUSE 