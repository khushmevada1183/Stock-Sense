# Stock Sense Deployment Guide

## Quick Start

For a quick deployment using Docker:

```bash
# Make the deployment script executable
chmod +x deploy-production.sh

# Run the deployment script
./deploy-production.sh
```

## Deployment Options

### Option 1: Docker (Recommended)

The simplest way to deploy the entire application stack:

```bash
# Build and start the containers
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the application
docker-compose down
```

### Option 2: Manual Deployment

#### Frontend Deployment

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the application:
   ```bash
   npm run build
   ```

4. Start the production server:
   ```bash
   npm start
   ```

#### Backend Deployment

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   node server.js
   ```

## Configuration

### Environment Variables

Create a `.env` file in the project root with the following variables:

```
# Backend
PORT=10000
NODE_ENV=production

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:10000/api
```

### NGINX Configuration

An NGINX configuration is provided in the `nginx/nginx.conf` file. This is automatically used when deploying with Docker.

## Production Considerations

1. **SSL/TLS**: In production, enable HTTPS by obtaining an SSL certificate.
2. **API Keys**: Ensure all API keys are set as environment variables.
3. **Database Backups**: If using a database, ensure regular backups.
4. **Monitoring**: Set up monitoring for the application.

## Troubleshooting

### Chart Rendering Issues

If charts are not rendering in production:

1. Check browser console for errors
2. Verify Chart.js is properly loading and initializing
3. Ensure canvas cleanup is working correctly

### API Connection Issues

1. Check the API server is running
2. Verify CORS is configured correctly
3. Ensure environment variables are set correctly

## More Information

For detailed deployment guides, see:

- [Frontend Production Deployment](./frontend/PRODUCTION_DEPLOYMENT.md)
- [Environment Setup](./ENVIRONMENT_SETUP.md)
- [Deployment Documentation](./DEPLOYMENT.md) 