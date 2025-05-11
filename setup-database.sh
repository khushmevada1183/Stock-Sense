#!/bin/bash
# This script installs PostgreSQL dependencies and sets up the database for Indian Stock Analyzer

echo "==================================="
echo "Indian Stock Analyzer - Database Setup"
echo "==================================="

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
  echo "PostgreSQL is not installed or not in your PATH."
  echo "For Ubuntu/Debian: sudo apt install postgresql postgresql-contrib"
  echo "For Mac: brew install postgresql"
  echo "After installation, ensure the bin directory is in your PATH."
  exit 1
fi

echo "PostgreSQL is installed."

# Navigate to the backend directory
cd backend

# Install dependencies
echo "Installing backend dependencies..."
npm install

# Run the database setup script
echo "Setting up the database..."
node src/db/setup-db.js

if [ $? -ne 0 ]; then
  echo "Database setup failed."
  echo "Please check the error messages above."
  exit 1
fi

echo "==================================="
echo "Database setup completed successfully!"
echo "==================================="

echo "The application now uses https://stock.indianapi.in/stock API endpoint"
echo "All stock data is cached in PostgreSQL for faster retrieval"

# Return to the root directory
cd ..

echo "Start the application using ./start.sh"
