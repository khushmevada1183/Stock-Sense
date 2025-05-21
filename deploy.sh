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
export PORT=5005
export BACKEND_PORT=5005
export FRONTEND_PORT=3000
export NODE_ENV=production

echo "Starting application..."
node run.js 