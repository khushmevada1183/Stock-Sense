# Stock-Sense Deployment Guide

## Deploying to Render

### Prerequisites
- A GitHub account with your Stock-Sense repository
- A Render.com account
- An Indian Stock API key (or equivalent API key for stock data)

### Step 1: Create a New Web Service in Render

1. Log in to your Render dashboard
2. Click on "New" and select "Web Service"
3. Connect your GitHub repository
4. Select the Stock-Sense repository

### Step 2: Configure the Web Service

Use the following settings:
- **Name**: `stock-sense` (or your preferred name)
- **Environment**: `Node`
- **Region**: Choose the region closest to your target audience
- **Branch**: `main` (or your preferred branch)
- **Build Command**: `npm install && node build.js`
- **Start Command**: `chmod +x deploy.sh && ./deploy.sh`
- **Instance Type**: Free (or other as needed)

### Step 3: Set Environment Variables

Add these environment variables in the Render dashboard:
- `NODE_ENV`: `production`
- `PORT`: `5005` (Render will override this with its own PORT)
- `STOCK_API_KEY`: Your Indian Stock API key
- `CORS_ORIGIN`: `*`

### Step 4: Deploy

Click "Create Web Service" to start the deployment process.

### Common Issues and Solutions

#### Missing API Key
If you see "Missing API key" errors in the logs, make sure you've set the `STOCK_API_KEY` environment variable in the Render dashboard.

#### Port Configuration
Render assigns its own PORT which your application must use. The application is configured to automatically detect and use Render's PORT.

#### Static Files Not Found
If you see "ENOENT: no such file or directory, stat 'frontend/out/index.html'" errors:
- This is handled gracefully in the latest version
- The backend will show a fallback API page until the frontend is built

#### Troubleshooting
If you continue to experience issues:
1. Check the Render logs for specific error messages
2. Ensure all environment variables are set correctly
3. Verify that your API key is valid
4. Consider temporarily enabling the "Debug" option in Render settings

## Required Environment Variables

```
# Server Configuration
PORT=5005                      # Default port, will be overridden by Render
BACKEND_PORT=5005              # Backend port
FRONTEND_PORT=3000             # Frontend port
NODE_ENV=production            # Environment

# API Keys
STOCK_API_KEY=your_api_key_here  # Your Indian Stock API key

# CORS Configuration
CORS_ORIGIN=*                  # Cross-Origin Resource Sharing setting
``` 