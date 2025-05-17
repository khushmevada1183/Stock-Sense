@echo off
REM Test IPO API connection
REM This script runs the IPO API test to verify connectivity without using up too many API calls

echo ================================================
echo     Indian Stock API - IPO Endpoint Test
echo ================================================
echo.
echo This script tests the connection to the IPO API
echo to verify functionality without triggering rate limits.
echo.

REM Determine directory paths
set "SCRIPT_DIR=%~dp0"
set "PROJECT_ROOT=%SCRIPT_DIR%.."
set "TEST_SCRIPT=%PROJECT_ROOT%\frontend\tests\run-ipo-test.js"

REM Check if test script exists
if not exist "%TEST_SCRIPT%" (
  echo Error: Test script not found at %TEST_SCRIPT%
  exit /b 1
)

REM Check for Node.js
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
  echo Error: Node.js is not installed or not in PATH
  exit /b 1
)

REM Parse arguments
set "TEST_TYPE="
if "%1"=="detailed" set "TEST_TYPE=detailed"
if "%1"=="full" set "TEST_TYPE=detailed"
if "%1"=="detailed-only" set "TEST_TYPE=detailed-only"

REM Run test with Node.js
cd "%PROJECT_ROOT%"
echo Running test script...
echo --------------------------------------------
node "%TEST_SCRIPT%" %TEST_TYPE%
echo --------------------------------------------
echo Test completed.

pause 