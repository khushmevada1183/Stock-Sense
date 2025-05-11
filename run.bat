@echo off
REM Get the directory where this script is located
SET SCRIPT_DIR=%~dp0

REM Change to the script directory
cd /d "%SCRIPT_DIR%"

ECHO Starting Indian Stock Analyzer...
node run.js
PAUSE 
