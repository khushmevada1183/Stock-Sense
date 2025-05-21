@echo off
REM This is a shortcut file to easily launch the Indian Stock Analyzer
REM Copy this file to your desktop for easy access

REM Get the path to the stock-analyzer folder
set APP_PATH=%~dp0

REM Launch the application through start.bat
start "" "%APP_PATH%start.bat" 