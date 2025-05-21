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
- **Start Command**: `bash deploy.sh`
- **Instance Type**: Free (or other as needed)

### Step 3: Set Environment Variables

Add these environment variables in the Render dashboard:
- `NODE_ENV`: `production`
- `RENDER`: `true`
- `STOCK_API_KEY`: Your Indian Stock API key
- `CORS_ORIGIN`: `*`

### Step 4: Deploy

Click "Create Web Service" to start the deployment process.

### How This Deployment Works

1. The build process:
   - Installs all dependencies (root, backend, frontend)
   - Builds the frontend as static files (using Next.js export)
   
2. The deployment process:
   - The `deploy.sh` script runs in production mode
   - It prints diagnostic information to help with troubleshooting
   - It installs dependencies if needed
   - The frontend is built and exported to static files
   - Only the backend server is started (not the development servers)
   - The backend serves the static frontend files

3. Handling requests:
   - API requests are handled by the Express backend
   - Frontend routes are served from the static files in `/frontend/out`
   - If static files aren't found, a helpful fallback page is shown

### Common Issues and Solutions

#### Rate Limiting Errors
The application now uses a proper configuration for rate limiting in proxy environments:
- Uses trusted proxies instead of trusting all proxies
- Proper IP detection from X-Forwarded-For headers

#### Static File Issues
If frontend files are not loading:
1. Check the build logs to ensure the frontend is successfully built
2. Verify the frontend/out directory exists and contains files
3. The app will show a helpful fallback page if static files aren't found

#### Port Configuration
The application will use the port provided by Render and automatically configure itself.

#### Missing API Key
If you see "Missing API key" errors in the logs, make sure you've set one of these environment variables:
- `STOCK_API_KEY` (preferred)
- `STOCKAPI_KEY`
- `INDIAN_STOCK_API_KEY`

#### Troubleshooting
If you continue to experience issues:
1. Check the Render logs for specific error messages
2. Review the diagnostic output from the deploy.sh script
3. Ensure the frontend is building properly
4. Verify API key and environment variables are set correctly

## Required Environment Variables

```
# Server Configuration
NODE_ENV=production            # Environment

# API Keys
STOCK_API_KEY=your_api_key_here  # Your Indian Stock API key

# Cloud Detection
RENDER=true                    # Helps the app detect it's running on Render

# CORS Configuration
CORS_ORIGIN=*                  # Cross-Origin Resource Sharing setting
``` 