#!/bin/bash
echo "==== Stock-Sense Deployment Helper ===="
echo "Installing root dependencies..."
npm install

echo "Installing backend dependencies..."
cd backend
npm install
cd ..

echo "Installing frontend dependencies..."
cd frontend
npm install

echo "Building frontend..."
npm run build
npm run export || mkdir -p out
cd ..

echo "Ensuring out directory exists..."
mkdir -p frontend/out

echo "Setting up environment variables..."
export PORT=${PORT:-5005}
export BACKEND_PORT=${PORT:-5005}
export FRONTEND_PORT=$((BACKEND_PORT + 1))
export NODE_ENV=production

# Detect if we're in a cloud environment
if [ -n "$RENDER" ] || [ -n "$VERCEL" ] || [ -n "$HEROKU" ]; then
  echo "Cloud environment detected. Running in production mode..."
  echo "Backend will run on port $PORT"
  
  # In production, we just need to run the backend
  # The frontend is served as static files by the backend
  cd backend
  node server.js
else
  echo "Starting application in development mode..."
  echo "Backend: $BACKEND_PORT, Frontend: $FRONTEND_PORT"
  node run.js
fi 