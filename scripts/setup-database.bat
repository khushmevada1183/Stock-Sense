@echo off
REM This script installs PostgreSQL dependencies and sets up the database for Indian Stock Analyzer

echo ===================================
echo Indian Stock Analyzer - Database Setup
echo ===================================

echo Checking for PostgreSQL installation...

REM Check if PostgreSQL is installed
pg_config --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo PostgreSQL is not installed or not in your PATH.
  echo.
  echo You have two options:
  echo 1. Install PostgreSQL from https://www.postgresql.org/download/
  echo    After installation, ensure the bin directory is in your PATH.
  echo    Example: C:\Program Files\PostgreSQL\15\bin
  echo.
  echo 2. Continue without PostgreSQL - the app will use mock data
  echo    and will not store any data persistently.
  echo.
  
  SET /P INSTALL_CHOICE="Do you want to install PostgreSQL? (y/n): "
  if /i "%INSTALL_CHOICE%"=="y" (
    echo.
    echo Opening PostgreSQL download page...
    start https://www.postgresql.org/download/windows/
    echo.
    echo After installing PostgreSQL, please run this setup script again.
    PAUSE
    exit /b 1
  ) else (
    echo.
    echo Continuing without PostgreSQL...
    echo Your application will run with mock data.
    echo You can run this setup script later if you want to install PostgreSQL.
    
    REM Update env file to use mock data
    echo Updating environment to use mock data...
    call powershell -Command "(gc backend\.env.local) -replace 'NEXT_PUBLIC_ALLOW_MOCK_DATA=false', 'NEXT_PUBLIC_ALLOW_MOCK_DATA=true' | Out-File -encoding ASCII backend\.env.local"
    
    echo Done! You can now start the application with start.bat
    PAUSE
    exit /b 0
  )
)

echo PostgreSQL is installed. Continuing with database setup...

REM Navigate to the backend directory
cd backend

REM Install dependencies
echo Installing backend dependencies...
call npm install

REM Run the database setup script
echo Setting up the database...
node src/db/setup-db.js

if %ERRORLEVEL% NEQ 0 (
  echo Database setup failed.
  echo Please check the error messages above.
  echo.
  echo The application will run with mock data until database issues are resolved.
  
  REM Update env file to use mock data
  echo Updating environment to use mock data...
  call powershell -Command "(gc .env.local) -replace 'NEXT_PUBLIC_ALLOW_MOCK_DATA=false', 'NEXT_PUBLIC_ALLOW_MOCK_DATA=true' | Out-File -encoding ASCII .env.local"
  
  echo Done! You can now start the application with start.bat
  cd ..
  PAUSE
  exit /b 1
)

echo ===================================
echo Database setup completed successfully!
echo ===================================

REM Update env file to disable mock data
echo Updating environment to use real data...
call powershell -Command "(gc .env.local) -replace 'NEXT_PUBLIC_ALLOW_MOCK_DATA=true', 'NEXT_PUBLIC_ALLOW_MOCK_DATA=false' | Out-File -encoding ASCII .env.local"

echo The application now uses https://stock.indianapi.in/stock API endpoint
echo All stock data is cached in PostgreSQL for faster retrieval

REM Return to the root directory
cd ..

echo Start the application using start.bat
PAUSE
