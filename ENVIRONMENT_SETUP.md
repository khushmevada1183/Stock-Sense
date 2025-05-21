# Environment Setup Guide for Stock Analyzer

This guide explains how to set up environment variables for the Stock Analyzer project to ensure your API keys remain secure when pushing to GitHub.

## Why Environment Variables?

Environment variables are used to store sensitive information like API keys, passwords, and other configuration settings that should not be committed to version control. This approach:

1. Keeps your sensitive data secure
2. Allows different configurations for development, testing, and production
3. Makes your application more portable

## Setup Instructions

### Backend Environment Variables

1. Create a `.env` file in the `backend` directory
2. Copy the contents from `backend/.env.example`
3. Replace the placeholder values with your actual API keys and settings:

```
# Server Configuration
PORT=5002
FRONTEND_PORT=3001
CORS_ORIGIN=http://localhost:3001

# API Keys
STOCK_API_KEY=your_actual_api_key_here
INDIAN_API_KEY=your_actual_indian_api_key_here

# Rate Limiting
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX_REQUESTS=100

# Admin Access
ADMIN_PASSWORD=your_secure_password_here
```

### Frontend Environment Variables

1. Create a `.env.local` file in the `frontend` directory
2. Copy the contents from `frontend/.env.example`
3. Replace the placeholder values with your actual API keys and settings:

```
# API URLs
NEXT_PUBLIC_API_URL=http://localhost:5002/api
NEXT_PUBLIC_INDIAN_API_URL=https://stock.indianapi.in

# API Keys
NEXT_PUBLIC_INDIAN_API_KEY=your_actual_api_key_here

# Multiple API keys (comma-separated)
NEXT_PUBLIC_INDIAN_API_KEYS=key1,key2,key3,key4,key5

# App Environment
NEXT_PUBLIC_APP_ENV=development
```

## Security Notes

1. **NEVER commit your `.env` or `.env.local` files to Git**
2. The `.gitignore` file is configured to exclude these files from version control
3. When deploying to production, set environment variables through your hosting platform's dashboard
4. For local development, each developer should have their own `.env` files

## For Deployment

When deploying to platforms like Vercel, Netlify, or Heroku:

1. Configure environment variables through the platform's dashboard
2. Do not include sensitive values in build commands or configuration files
3. Use appropriate secrets management for your deployment platform

## Troubleshooting

If you're having issues with environment variables:

1. Make sure the `.env` files are in the correct directories
2. Verify that you've restarted your development servers after making changes
3. Check that the variable names match exactly what's expected in the code
4. For Next.js frontend, remember that only variables prefixed with `NEXT_PUBLIC_` are accessible in the browser
