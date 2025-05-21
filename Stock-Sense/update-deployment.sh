#!/bin/bash
echo "Committing deployment fixes..."
git add run.js
git add package.json
git add Procfile
git add deploy.sh
git add DEPLOYMENT.md
git add render.yaml
git add backend/server.js
git add scripts/run.js
git add frontend/next.config.js
git add frontend/package.json
git commit -m "Fix frontend export and static file serving"
git push origin main 