#!/bin/bash

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Change to the script directory
cd "$SCRIPT_DIR"

echo "==================================="
echo "Indian Stock Analyzer Starter"
echo "==================================="
echo ""
echo "Starting application from: $(pwd)"
echo ""

# Run the node script
node run.js 