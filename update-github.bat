@echo off
REM Script to update stock-sense-build repository on GitHub

echo === Starting GitHub update process ===

REM Add all changed files
echo Adding all files to git staging...
git add .

REM Commit changes with a meaningful message
echo Committing changes...
git commit -m "Fix deployment and Docker configuration issues

- Fixed case sensitivity in NavigationAnimations imports
- Updated render.yaml for monolithic deployment
- Enhanced run.js to better handle frontend builds
- Fixed API URL configuration for frontend-backend communication
- Updated Docker configuration for reliable builds
- Added comprehensive deployment documentation"

REM Push to GitHub
echo Pushing changes to GitHub...
git push origin main

echo === GitHub update complete! ===
echo Repository updated: https://github.com/khushmevada1183/Stock-Sense

pause 