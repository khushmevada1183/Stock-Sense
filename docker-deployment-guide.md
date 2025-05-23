# Docker Hub Deployment Guide

This guide provides step-by-step instructions for building and pushing your Stock Sense project to Docker Hub.

## Prerequisites
- Docker Desktop installed and running
- Docker Hub account
- Personal Access Token for Docker Hub

## Steps to Deploy to Docker Hub

### 1. Log in to Docker Hub
```bash
docker login -u khushmevada1183
```
When prompted for password, enter your Personal Access Token (not your Docker Hub password).

### 2. Build and Tag the Frontend Image
```bash
cd frontend
docker build -t khushmevada1183/stock-sense-frontend:latest .
cd ..
```

### 3. Build and Tag the Backend Image
```bash
cd backend
docker build -t khushmevada1183/stock-sense-backend:latest .
cd ..
```

### 4. Push the Images to Docker Hub
```bash
docker push khushmevada1183/stock-sense-frontend:latest
docker push khushmevada1183/stock-sense-backend:latest
```

### 5. Using Docker Compose for Local Testing
After pushing the images, you can test them locally:
```bash
docker-compose up
```

## Accessing the Deployed Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:10000/api
- API Documentation: http://localhost:10000/api/docs

## Troubleshooting

### Common Issues:

1. **Docker Build Failures**
   - Check for syntax errors in Dockerfile
   - Ensure all required files are included
   - Verify all dependencies are accessible

2. **Image Push Failures**
   - Verify Docker Hub credentials
   - Check Docker Hub repository permissions
   - Ensure you have sufficient internet bandwidth

3. **Container Startup Issues**
   - Check logs: `docker-compose logs`
   - Verify environment variables
   - Check port conflicts

## Continuous Deployment

For automated builds and deployment with GitHub Actions:

1. Add Docker Hub credentials to GitHub repository secrets
2. Create a GitHub Actions workflow in `.github/workflows/docker-build.yml`
3. Configure the workflow to build and push on commits to main branch

## Additional Information

- Docker Hub Repository: https://hub.docker.com/u/khushmevada1183
- GitHub Repository: https://github.com/khushmevada1183/Stock-Sense
- Render Dashboard: https://dashboard.render.com/

## Important Links and Credentials

- **Docker Hub Repository**: `https://hub.docker.com/u/khushmevada1183` (or your specific image repos)
- **GitHub Repository**: `https://github.com/khushmevada1183/Stock-Sense`
- **Render Dashboard**: `https://dashboard.render.com/` 