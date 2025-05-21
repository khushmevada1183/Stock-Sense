#!/bin/bash

# Stock Sense Production Deployment Script
echo "=== Stock Sense Production Deployment ==="

# Ensure script is executable
if [ ! -x "$0" ]; then
  echo "Making script executable..."
  chmod +x "$0"
fi

# Check for Docker and Docker Compose
if ! command -v docker &> /dev/null; then
  echo "Docker is not installed. Please install Docker first."
  exit 1
fi

if ! command -v docker-compose &> /dev/null; then
  echo "Docker Compose is not installed. Please install Docker Compose first."
  exit 1
fi

# Pull latest changes if in a git repository
if [ -d ".git" ]; then
  echo "Git repository detected. Pulling latest changes..."
  git pull
fi

# Build the application using Docker Compose
echo "Building containers..."
docker-compose build --no-cache

# Start the application
echo "Starting application containers..."
docker-compose up -d

# Check if containers are running
echo "Checking container status..."
docker-compose ps

echo ""
echo "=== Deployment completed ==="
echo "The Stock Sense application should now be available at:"
echo "- Frontend: http://localhost:3000"
echo "- Backend API: http://localhost:10000/api"
echo "- Main website via NGINX: http://localhost"
echo ""
echo "To check logs, use: docker-compose logs -f"
echo "To stop the application, use: docker-compose down" 