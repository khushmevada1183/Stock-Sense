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

REM Run the node script
node run.js

PAUSE 