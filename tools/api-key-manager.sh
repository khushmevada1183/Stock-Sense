#!/bin/bash
# API Key Manager for Indian Stock Analyzer
# This script provides a command-line interface to manage API keys
# Usage: ./api-key-manager.sh [command] [arguments]

# Default server URL - adjust if your server runs on a different port
BASE_URL="http://localhost:5002/api/keys"

# Get admin password from environment or use default
if [ -z "$ADMIN_PASSWORD" ]; then
  ADMIN_PASSWORD="admin123"  # Default password - change in production!
fi

# Check if curl is installed
if ! command -v curl &> /dev/null; then
  echo "Error: curl is required but not installed. Please install curl and try again."
  exit 1
fi

# Function to format keys for display
format_key() {
  # First 5 and last 4 characters of the key
  if [ ${#1} -gt 9 ]; then
    echo "${1:0:5}...${1: -4}"
  else
    echo "$1"
  fi
}

# Function to create a progress bar
progress_bar() {
  local percent=$1
  local bar_length=20
  local filled_length=$((percent * bar_length / 100))
  local empty_length=$((bar_length - filled_length))
  
  # Create the filled and empty parts of the bar
  local filled=$(printf "%${filled_length}s" | tr ' ' '█')
  local empty=$(printf "%${empty_length}s" | tr ' ' '░')
  
  echo -n "[${filled}${empty}] ${percent}%"
}

# Display banner
echo "====================================="
echo "Indian Stock Analyzer API Key Manager"
echo "====================================="

# Handle commands
case "$1" in
  list|ls)
    echo "Listing all API keys..."
    echo "-----------------------------------"
    response=$(curl -s -X GET "$BASE_URL" \
      -H "x-admin-password: $ADMIN_PASSWORD")
    
    # Check if response contains error
    if echo "$response" | grep -q "error"; then
      echo "Error: $(echo "$response" | grep -o '"error":"[^"]*"' | cut -d':' -f2 | tr -d '"')"
      exit 1
    fi
    
    # Try to format as a table if jq is available
    if command -v jq &> /dev/null; then
      # Get current date
      current_date=$(date +"%Y-%m")
      
      # Print header
      echo "API Keys Status (Current Month: ${current_date})"
      echo "----------------------------------------------------------------------"
      
      # Get and display each key
      keys=$(echo "$response" | jq -r '.keys')
      echo "$response" | jq -r '.keys | length' | while read -r count; do
        for i in $(seq 0 $((count-1))); do
          key=$(echo "$response" | jq -r ".keys[$i].key")
          is_current=$(echo "$response" | jq -r ".keys[$i].isCurrent")
          is_available=$(echo "$response" | jq -r ".keys[$i].isAvailable")
          reset_time=$(echo "$response" | jq -r ".keys[$i].resetTime")
          usage_count=$(echo "$response" | jq -r ".keys[$i].usageCount")
          monthly_usage=$(echo "$response" | jq -r ".keys[$i].monthlyUsage // 0")
          monthly_limit=$(echo "$response" | jq -r ".keys[$i].monthlyLimit // 500")
          monthly_remaining=$(echo "$response" | jq -r ".keys[$i].monthlyRemaining // $((500-monthly_usage))")
          usage_percent=$(echo "$response" | jq -r ".keys[$i].monthlyUsagePercent // $(( monthly_usage * 100 / 500 ))")
          
          # Format status
          if [ "$is_current" = "true" ]; then
            status="✓ CURRENT"
          else
            status="       "
          fi
          
          if [ "$is_available" = "true" ]; then
            availability="AVAILABLE"
          else
            availability="RATE LIMITED until $(echo "$reset_time" | cut -d'T' -f2 | cut -d'.' -f1)"
          fi
          
          # Display key info
          echo "Key: $key $status"
          echo "Status: $availability"
          echo "Monthly Usage: $monthly_usage / $monthly_limit requests ($monthly_remaining remaining)"
          progress_bar "$usage_percent"
          echo ""
          echo "----------------------------------------------------------------------"
        done
      done
    else
      # Simple formatting without jq
      echo "$response" | tr ',' '\n' | tr -d '{}"[]' | sed 's/:/: /g'
    fi
    ;;
    
  add)
    if [ -z "$2" ]; then
      echo "Error: API key is required"
      echo "Usage: ./api-key-manager.sh add <api-key>"
      exit 1
    fi
    
    echo "Adding new API key: $(format_key "$2")"
    response=$(curl -s -X POST "$BASE_URL" \
      -H "Content-Type: application/json" \
      -H "x-admin-password: $ADMIN_PASSWORD" \
      -d "{\"apiKey\": \"$2\"}")
    
    if echo "$response" | grep -q "error"; then
      echo "Error: $(echo "$response" | grep -o '"error":"[^"]*"' | cut -d':' -f2 | tr -d '"')"
      exit 1
    else
      echo "Success: API key added to rotation"
    fi
    ;;
    
  remove|rm)
    if [ -z "$2" ]; then
      echo "Error: API key is required"
      echo "Usage: ./api-key-manager.sh remove <api-key>"
      exit 1
    fi
    
    echo "Removing API key: $(format_key "$2")"
    response=$(curl -s -X DELETE "$BASE_URL" \
      -H "Content-Type: application/json" \
      -H "x-admin-password: $ADMIN_PASSWORD" \
      -d "{\"apiKey\": \"$2\"}")
    
    if echo "$response" | grep -q "error"; then
      echo "Error: $(echo "$response" | grep -o '"error":"[^"]*"' | cut -d':' -f2 | tr -d '"')"
      exit 1
    else
      echo "Success: API key removed from rotation"
    fi
    ;;
    
  rotate)
    echo "Rotating to next available API key..."
    response=$(curl -s -X POST "$BASE_URL/rotate" \
      -H "x-admin-password: $ADMIN_PASSWORD")
    
    if echo "$response" | grep -q "error"; then
      echo "Error: $(echo "$response" | grep -o '"error":"[^"]*"' | cut -d':' -f2 | tr -d '"')"
      exit 1
    else
      echo "Success: Rotated to next available API key"
    fi
    ;;
    
  download)
    echo "Downloading the latest version of this script from the server..."
    curl -s -o "api-key-manager.sh" "$BASE_URL/cli-script" \
      -H "x-admin-password: $ADMIN_PASSWORD"
    chmod +x api-key-manager.sh
    echo "Script updated successfully"
    ;;
    
  quota)
    echo "Monthly API Key Quota Status"
    echo "-----------------------------------"
    response=$(curl -s -X GET "$BASE_URL" \
      -H "x-admin-password: $ADMIN_PASSWORD")
    
    # Check if response contains error
    if echo "$response" | grep -q "error"; then
      echo "Error: $(echo "$response" | grep -o '"error":"[^"]*"' | cut -d':' -f2 | tr -d '"')"
      exit 1
    fi
    
    if command -v jq &> /dev/null; then
      # Calculate total usage across all keys
      total_usage=$(echo "$response" | jq -r '.keys | map(.monthlyUsage // 0) | add')
      total_limit=$(echo "$response" | jq -r '.keys | length * (.keys[0].monthlyLimit // 500)')
      total_remaining=$((total_limit - total_usage))
      usage_percent=$((total_usage * 100 / total_limit))
      
      echo "Total Monthly Usage: $total_usage / $total_limit requests ($total_remaining remaining)"
      progress_bar "$usage_percent"
      echo ""
      
      # Sort keys by usage percentage
      echo "Keys by Usage (highest first):"
      echo "$response" | jq -r '.keys | sort_by(.monthlyUsagePercent) | reverse | .[] | "\(.key): \(.monthlyUsage)/\(.monthlyLimit) (\(.monthlyUsagePercent)%)"'
    else
      echo "Please install jq for better formatting of quota information"
      echo "$response" | tr ',' '\n' | grep -E 'monthlyUsage|monthlyLimit|monthlyRemaining' | tr -d '{}"[]' | sed 's/:/: /g'
    fi
    ;;
    
  help|--help|-h)
    echo "Commands:"
    echo "  list, ls                  - List all API keys with status"
    echo "  add <api-key>             - Add a new API key to the rotation"
    echo "  remove, rm <api-key>      - Remove an API key from rotation"
    echo "  rotate                    - Manually rotate to next available key"
    echo "  quota                     - Show monthly quota usage across all keys"
    echo "  download                  - Download latest version of this script"
    echo "  help, --help, -h          - Show this help message"
    echo ""
    echo "Environment Variables:"
    echo "  ADMIN_PASSWORD            - Set admin password (default: admin123)"
    ;;
    
  *)
    if [ -n "$1" ]; then
      echo "Error: Unknown command '$1'"
      echo ""
    fi
    
    echo "Available commands: list, add, remove, rotate, quota, download, help"
    echo "Run './api-key-manager.sh help' for more information"
    ;;
esac 