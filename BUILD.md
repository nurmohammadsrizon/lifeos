# Build Configuration

This file contains production build configurations.

## Backend Build

### Python Version
- **Recommended:** Python 3.12
- **Minimum:** Python 3.11

### Build Stages
1. **Builder Stage** - Install dependencies in isolated environment
2. **Production Stage** - Minimal runtime image with only necessary components

### Optimization
- Uses multi-stage build to reduce image size
- Python slim image for smaller footprint
- Pip cache disabled in Docker
- Gunicorn with Uvicorn workers for performance

## Frontend Build

### Node Version
- **Recommended:** Node.js 20 LTS
- **Minimum:** Node.js 18

### Build Process
1. Install dependencies
2. Run Vite build
3. Optimize assets
4. Serve with Nginx

### Optimization
- Tree-shaking and code splitting by Vite
- Gzip compression enabled in Nginx
- Static asset caching configured
- CSS and JS minification

## Docker Image Optimization

### Backend Image
```
FROM python:3.12-slim (123MB)
+ dependencies (~200MB)
+ application code (~50MB)
= Total: ~370MB
```

### Frontend Image
```
FROM node:20-alpine (200MB) - builder stage
FROM nginx:alpine (42MB) - production
= Final: ~50MB (with assets ~150MB)
```

## Build Commands

### Local Build

```bash
# Backend
docker build -f Dockerfile.backend -t lifeos-backend:latest .

# Frontend
docker build -f Dockerfile.frontend -t lifeos-frontend:latest .

# With tag
docker build -f Dockerfile.backend -t lifeos-backend:v1.0.0 .
```

### Production Build

```bash
# Using docker-compose
docker-compose -f docker-compose.prod.yml build

# Force rebuild
docker-compose -f docker-compose.prod.yml build --no-cache
```

## Build Arguments (Optional)

You can pass build arguments to customize builds:

```bash
docker build \
  --build-arg BUILD_ENV=production \
  --build-arg VERSION=1.0.0 \
  -f Dockerfile.backend .
```

## Image Registry

### Push to Registry

```bash
# Tag image
docker tag lifeos-backend:latest ghcr.io/yourusername/lifeos-backend:latest

# Login to registry
docker login ghcr.io

# Push image
docker push ghcr.io/yourusername/lifeos-backend:latest

# Pull from registry
docker pull ghcr.io/yourusername/lifeos-backend:latest
```

## Build Caching

Docker uses layer caching for faster builds:
- Dependencies are cached separately
- Application code changes don't invalidate dependency cache
- Use `.dockerignore` to exclude unnecessary files

## Build Troubleshooting

### Out of Memory During Build
```bash
docker build --memory 2g -f Dockerfile.backend .
```

### Clear Build Cache
```bash
docker builder prune -a
```

### Debug Build
```bash
docker build -f Dockerfile.backend --progress=plain .
```
