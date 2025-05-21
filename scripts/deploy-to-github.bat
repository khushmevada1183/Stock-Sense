@echo off
setlocal enabledelayedexpansion

echo ===== Stock-Sense GitHub Pages Deployment =====
echo This script will commit and push changes to your GitHub repository

REM Set variables
set GITHUB_REPO=https://github.com/khushmevada5005/stock-sense-build.git
set BRANCH=main

REM Check if git is installed
where git >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Error: Git is not installed. Please install Git and try again.
    exit /b 1
)

REM Check if the directory is a git repository
if not exist ".git" (
    echo Initializing Git repository...
    git init
    git remote add origin %GITHUB_REPO%
) else (
    echo Git repository already initialized.
    REM Check if the remote exists
    git remote | findstr /C:"origin" >nul
    if %ERRORLEVEL% neq 0 (
        git remote add origin %GITHUB_REPO%
    )
)

REM Configure Git if needed
echo Configuring Git...
for /f "tokens=*" %%a in ('git config user.name') do set GIT_USERNAME=%%a
if "!GIT_USERNAME!"=="" (
    set /p GIT_USERNAME="Enter your Git username: "
    git config user.name "!GIT_USERNAME!"
)

for /f "tokens=*" %%a in ('git config user.email') do set GIT_EMAIL=%%a
if "!GIT_EMAIL!"=="" (
    set /p GIT_EMAIL="Enter your Git email: "
    git config user.email "!GIT_EMAIL!"
)

REM Add all files to git
echo Adding files to Git...
git add .

REM Commit changes
echo Committing changes...
set /p COMMIT_MESSAGE="Enter commit message (or press Enter for default): "
if "!COMMIT_MESSAGE!"=="" set COMMIT_MESSAGE=Update for GitHub Pages deployment
git commit -m "!COMMIT_MESSAGE!"

REM Push to GitHub
echo Pushing to GitHub...
git push -u origin %BRANCH%

echo ===== Deployment Complete =====
echo Your code has been pushed to %GITHUB_REPO%
echo GitHub Pages will be available at: https://khushmevada1183.github.io/Stock-Sense/
echo Note: It may take a few minutes for GitHub Pages to build and deploy your site.

pause 