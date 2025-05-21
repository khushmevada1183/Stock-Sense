#!/bin/bash
git add package.json
git add Procfile
git commit -m "Fix deployment issues: update Procfile and package.json"
git remote -v
echo "Now run: git push origin main" 