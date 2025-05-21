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
cd ..

echo "Starting application..."
node run.js 