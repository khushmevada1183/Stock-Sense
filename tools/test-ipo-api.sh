#!/bin/bash

# Test IPO API connection
# This script runs the IPO API test to verify connectivity without using up too many API calls

echo "================================================"
echo "    Indian Stock API - IPO Endpoint Test"
echo "================================================"
echo ""
echo "This script tests the connection to the IPO API"
echo "to verify functionality without triggering rate limits."
echo ""

# Determine directory
SCRIPT_DIR="$(dirname "$0")"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
TEST_SCRIPT="$PROJECT_ROOT/frontend/tests/run-ipo-test.js"

# Check if test script exists
if [ ! -f "$TEST_SCRIPT" ]; then
  echo "Error: Test script not found at $TEST_SCRIPT"
  exit 1
fi

# Check for Node.js
if ! command -v node &> /dev/null; then
  echo "Error: Node.js is not installed or not in PATH"
  exit 1
fi

# Parse arguments
TEST_TYPE=""
if [ "$1" == "detailed" ] || [ "$1" == "full" ]; then
  TEST_TYPE="detailed"
elif [ "$1" == "detailed-only" ]; then
  TEST_TYPE="detailed-only"
fi

# Run test with Node.js
cd "$PROJECT_ROOT"
echo "Running test script..."
echo "--------------------------------------------"
node "$TEST_SCRIPT" $TEST_TYPE
echo "--------------------------------------------"
echo "Test completed." 