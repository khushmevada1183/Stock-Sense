# Stock Sense Frontend Production Deployment Guide

This document outlines the steps required to deploy the Stock Sense frontend to a production environment.

## Prerequisites

- Node.js v16.0.0 or higher
- npm v8.0.0 or higher
- Access to the production server or hosting service

## Building for Production

The application has been successfully built using Next.js, with all type checks passing. To build the application for production:

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Build the application
npm run build

# Start the production server
npm start
```

## Deployment Options

### Option 1: Traditional Node.js Hosting

1. Upload the following directory structure to your server:
   - `.next/` - The compiled application
   - `public/` - Static assets
   - `node_modules/` - (or install dependencies on the server)
   - `package.json` - Dependency and script definitions
   - `next.config.js` - Next.js configuration

2. Set up environment variables:
   ```
   PORT=3000
   NODE_ENV=production
   API_URL=https://your-api-domain.com
   NEXT_PUBLIC_API_URL=https://your-api-domain.com
   ```

3. Run the production server:
   ```bash
   npm start
   ```

### Option 2: Vercel (Recommended)

As this is a Next.js application, Vercel offers the simplest deployment solution:

1. Install Vercel CLI (optional):
   ```bash
   npm install -g vercel
   ```

2. Deploy from the command line:
   ```bash
   vercel
   ```

   Or connect your GitHub repository to Vercel for automatic deployments.

3. Set environment variables in the Vercel dashboard.

### Option 3: Containerized Deployment

1. Create a `Dockerfile` in the root directory:
   ```dockerfile
   FROM node:18-alpine AS builder
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npm run build

   FROM node:18-alpine AS runner
   WORKDIR /app
   ENV NODE_ENV production

   COPY --from=builder /app/public ./public
   COPY --from=builder /app/.next ./.next
   COPY --from=builder /app/node_modules ./node_modules
   COPY --from=builder /app/package.json ./

   EXPOSE 3000
   CMD ["npm", "start"]
   ```

2. Build and run the Docker container:
   ```bash
   docker build -t stock-sense-frontend .
   docker run -p 3000:3000 stock-sense-frontend
   ```

## Server Configuration

### NGINX Configuration

If using NGINX as a reverse proxy:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Apache Configuration

If using Apache:

```apache
<VirtualHost *:80>
    ServerName yourdomain.com
    
    ProxyPreserveHost On
    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/
    
    ErrorLog ${APACHE_LOG_DIR}/error.log
    CustomLog ${APACHE_LOG_DIR}/access.log combined
</VirtualHost>
```

## Post-Deployment Checks

After deployment, verify the following:

1. Stock details page is loading without errors (test with different stock symbols)
2. Charts are rendering properly
3. API calls are working correctly
4. Verify mobile responsiveness

## Troubleshooting Common Issues

### Charts Not Rendering

If charts are not rendering in production:

1. Ensure Chart.js is properly initialized in SSR environment:
   ```javascript
   // Use dynamic import for Chart.js components
   import dynamic from 'next/dynamic'
   
   const ChartComponent = dynamic(() => import('../components/ChartComponent'), {
     ssr: false
   })
   ```

2. Verify canvas cleanup on unmount:
   ```javascript
   useEffect(() => {
     return () => {
       if (chartRef.current) {
         chartRef.current.destroy();
       }
     };
   }, []);
   ```

### API Connection Issues

1. Ensure all API URLs are using environment variables
2. Check CORS configuration on the backend
3. Verify API endpoints are accessible from the production environment

### Performance Optimization

1. Enable gzip compression on your server
2. Implement caching strategies
3. Use a CDN for static assets

## Monitoring and Analytics

1. Set up error tracking with services like Sentry
2. Implement analytics with Google Analytics or similar
3. Set up server monitoring

## Security Considerations

1. Ensure all API keys are stored as environment variables
2. Implement Content Security Policy (CSP)
3. Set up HTTPS using a valid SSL certificate
4. Regularly update dependencies

---

For further assistance, please contact the development team. 