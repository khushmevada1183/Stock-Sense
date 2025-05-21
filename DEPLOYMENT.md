# Stock-Sense Deployment Guide

## Deploying to Render

### Prerequisites
- A GitHub account with your Stock-Sense repository
- A Render.com account
- An Indian Stock API key (or equivalent API key for stock data)

### Option 1: Using Render Blueprint (Recommended)

The easiest way to deploy is using the Render Blueprint defined in our `render.yaml` file:

1. Fork this repository to your GitHub account
2. Log in to your Render dashboard
3. Click "New" and select "Blueprint"
4. Connect to your GitHub account and select your forked repository
5. Render will automatically detect the `render.yaml` file and set up both services
6. Enter your API key when prompted
7. Click "Apply" to start deploying both services

This will create two services:
- `stock-sense-backend`: The Express.js API server
- `stock-sense-frontend`: The Next.js frontend application

### Option 2: Manual Setup (Two Services)

If you prefer to set up the services manually:

#### Backend Service
1. Log in to your Render dashboard
2. Click on "New" and select "Web Service"
3. Connect your GitHub repository
4. Configure with these settings:
   - **Name**: `stock-sense-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && cd backend && npm install`
   - **Start Command**: `cd backend && node server.js`
   - **Environment Variables**:
     - `NODE_ENV`: `production`
     - `PORT`: `5005`
     - `RENDER`: `true`
     - `STOCK_API_KEY`: Your API key
     - `CORS_ORIGIN`: `*`

#### Frontend Service
1. Click on "New" and select "Web Service" again
2. Connect to the same repository
3. Configure with these settings:
   - **Name**: `stock-sense-frontend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && cd frontend && npm install && npm run build`
   - **Start Command**: `cd frontend && npm start`
   - **Environment Variables**:
     - `NODE_ENV`: `production`
     - `PORT`: `3000`
     - `NEXT_PUBLIC_API_URL`: URL of your backend service (e.g., `https://stock-sense-backend.onrender.com`)

### How This Multi-Service Deployment Works

1. **Backend Service**:
   - Runs the Express.js server directly
   - Handles all API requests and data processing
   - Connects to the stock API using your API key

2. **Frontend Service**:
   - Runs the Next.js application in production mode
   - Makes API calls to the backend service
   - Provides the user interface and interactivity

This approach has several advantages:
- Each service scales independently
- Frontend and backend are properly isolated
- Easier to debug issues in each service
- Follows best practices for microservices architecture

### Troubleshooting Common Issues

#### API Connection Issues
If the frontend can't connect to the backend:
1. Verify that the `NEXT_PUBLIC_API_URL` is set correctly
2. Check for CORS issues in the browser console
3. Ensure the backend is up and running

#### Missing API Key
If you see "Missing API key" errors in the logs, make sure you've set the `STOCK_API_KEY` 
environment variable in the backend service settings.

#### Service Health
Each service has its own logs and metrics in the Render dashboard:
1. Navigate to the service in your Render dashboard
2. Click "Logs" to see runtime logs
3. Check "Events" to see build and deployment events

## Required Environment Variables

### Backend Service
```
NODE_ENV=production
PORT=5005
RENDER=true
STOCK_API_KEY=your_api_key_here
CORS_ORIGIN=*
```

### Frontend Service
```
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_API_URL=https://your-backend-service.onrender.com
``` 