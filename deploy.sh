#!/bin/bash
echo "==== Stock-Sense Deployment Helper ===="

# Print environment for debugging
echo "Environment: NODE_ENV=$NODE_ENV"
echo "Render detection: RENDER=$RENDER"
echo "Current directory: $(pwd)"
echo "Contents of current directory:"
ls -la

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
mkdir -p out
cd ..

echo "Ensuring out directory exists..."
mkdir -p frontend/out

echo "Setting up environment variables..."
export PORT=${PORT:-5005}
export BACKEND_PORT=${PORT:-5005}
export FRONTEND_PORT=$((BACKEND_PORT + 1))
export NODE_ENV=production
export RENDER=true

echo "Running in production mode (backend only)..."
echo "Backend will run on port $PORT"

# In production, we just need to run the backend
cd backend
echo "Starting backend server.js directly..."
echo "Working directory: $(pwd)"
node server.js 