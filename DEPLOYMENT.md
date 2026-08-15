# LifeOS Deployment Guide

Comprehensive guide for deploying LifeOS to development, staging, and production environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Development Deployment](#development-deployment)
4. [Production Deployment](#production-deployment)
5. [Environment Configuration](#environment-configuration)
6. [Deployment Scripts](#deployment-scripts)
7. [Monitoring](#monitoring)
8. [Troubleshooting](#troubleshooting)
9. [Security Considerations](#security-considerations)

---

## Prerequisites

### Required Tools

- **Docker** (version 20.10+)
- **Docker Compose** (version 2.0+)
- **Git**
- **Python** 3.12+ (for local development)
- **Node.js** 20+ (for frontend development)

### System Requirements

**Development:**
- RAM: 4GB minimum
- Disk: 20GB minimum
- CPU: 2 cores minimum

**Production:**
- RAM: 8GB minimum
- Disk: 50GB minimum
- CPU: 4 cores recommended

### Install Docker (Ubuntu/Debian)

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

### Install Docker (macOS)

```bash
# Using Homebrew
brew install docker docker-compose
```

### Install Docker (Windows)

- Download [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop)
- Enable WSL 2 backend

---

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/lifeos.git
cd lifeos
```

### 2. Set Up Environment

```bash
cp .env.example .env
# Edit .env with your configuration
nano .env
```

### 3. Start Services (Development)

```bash
# Using deploy script
chmod +x deploy.sh
./deploy.sh setup dev
./deploy.sh build dev
./deploy.sh start dev

# Or using docker-compose directly
docker-compose up -d
```

### 4. Verify Deployment

```bash
# Check service status
docker-compose ps

# View logs
docker-compose logs -f

# Test API
curl http://localhost:8000/health

# Access application
# Frontend: http://localhost:80 or http://localhost:5173 (dev)
# API: http://localhost:8000
```

---

## Development Deployment

### Using Docker Compose (Recommended)

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down

# Restart specific service
docker-compose restart backend
```

### Using Deploy Script

```bash
# Setup environment
./deploy.sh setup dev

# Build images
./deploy.sh build dev

# Start services
./deploy.sh start dev

# View status
./deploy.sh status dev

# View logs
./deploy.sh logs dev

# Stop services
./deploy.sh stop dev
```

### Local Development (Without Docker)

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn App:app --reload

# Frontend (in another terminal)
cd client/lifeos
npm install
npm run dev
```

---

## Production Deployment

### Prerequisites for Production

1. **Obtain SSL/TLS Certificates**
   ```bash
   # Using Let's Encrypt with Certbot
   sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com
   
   # Copy certificates to project
   mkdir -p certs
   sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem certs/
   sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem certs/
   sudo chown -R $USER:$USER certs/
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env.production
   # Update all production values
   ```

3. **Configure Nginx (if using separate Nginx)**
   - Update `nginx-prod.conf` with your domain
   - Configure SSL certificates path

### Deploy Using Docker Compose

```bash
# Pull latest changes
git pull origin main

# Build images
docker-compose -f docker-compose.prod.yml build

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Run migrations
docker-compose -f docker-compose.prod.yml exec backend alembic upgrade head

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f backend
```

### Using Deploy Script

```bash
./deploy.sh setup prod
./deploy.sh build prod
./deploy.sh start prod
./deploy.sh migrate prod
./deploy.sh status prod
```

### Manual Server Deployment

```bash
# On your production server

# 1. Clone repository
git clone https://github.com/yourusername/lifeos.git /app/lifeos
cd /app/lifeos

# 2. Create environment file
cp .env.example .env
# Edit with production values

# 3. Build and start
docker-compose -f docker-compose.prod.yml up -d

# 4. Run migrations
docker-compose -f docker-compose.prod.yml exec backend alembic upgrade head

# 5. Create backups directory
mkdir -p backups
chmod 755 backups
```

---

## Environment Configuration

### Core Settings

```env
# Application
ENVIRONMENT=production
DEBUG=false
SECRET_KEY=your-secret-key-here

# Server
SERVER_HOST=0.0.0.0
SERVER_PORT=8000

# Database
DATABASE_URL=postgresql://user:password@db:5432/lifeos
DB_USER=lifeos
DB_PASSWORD=strong-password
DB_NAME=lifeos

# Email
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=app-password
MAIL_FROM=noreply@lifeos.com

# API Keys
GEMINI_API_KEY=your-gemini-key
SENTRY_DSN=optional-sentry-url

# Redis (for production)
REDIS_URL=redis://redis:6379/0
REDIS_PASSWORD=redis-password

# CORS
BACKEND_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
FRONTEND_URL=https://yourdomain.com
```

### Generate Secret Key

```python
import secrets
print(secrets.token_urlsafe(32))
```

---

## Deployment Scripts

### Deploy Script Usage

The `deploy.sh` script automates common deployment tasks.

```bash
chmod +x deploy.sh

# Setup
./deploy.sh setup [dev|prod]

# Build
./deploy.sh build [dev|prod]

# Start
./deploy.sh start [dev|prod]

# Stop
./deploy.sh stop [dev|prod]

# Restart
./deploy.sh restart [dev|prod]

# Status
./deploy.sh status [dev|prod]

# Logs
./deploy.sh logs [dev|prod]

# Database Migrations
./deploy.sh migrate [dev|prod]

# Tests
./deploy.sh test [dev|prod]

# Backup
./deploy.sh backup [dev|prod]

# Cleanup
./deploy.sh clean [dev|prod]
```

### Build Deployment Script

```bash
chmod +x build-deployment.sh
./build-deployment.sh
```

This script:
- Installs all dependencies
- Builds frontend
- Builds Docker images
- Creates necessary directories

---

## Monitoring

### View Logs

```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend

# Follow logs with filter
docker-compose -f docker-compose.prod.yml logs -f backend | grep ERROR
```

### Health Checks

```bash
# API health
curl http://localhost:8000/health

# Database connection
docker-compose -f docker-compose.prod.yml exec db pg_isready

# Redis health
docker-compose -f docker-compose.prod.yml exec redis redis-cli ping
```

### Container Metrics

```bash
# CPU and Memory usage
docker stats

# Detailed container info
docker inspect lifeos-backend-prod

# Log size
docker exec lifeos-backend-prod du -sh /app/logs
```

### Database Monitoring

```bash
# Connect to database
docker-compose -f docker-compose.prod.yml exec db psql -U lifeos -d lifeos

# Useful queries
\dt                                    # List tables
SELECT COUNT(*) FROM users;           # Count users
SELECT * FROM pg_stat_statements;     # Query performance
```

---

## Troubleshooting

### Common Issues

#### 1. Port Already in Use

```bash
# Find process using port
lsof -i :8000
# Kill process
kill -9 <PID>

# Or change port in .env
```

#### 2. Database Connection Error

```bash
# Check database logs
docker-compose logs db

# Verify DATABASE_URL in .env
# Test connection
docker-compose exec backend python -c "
from sqlalchemy import create_engine
engine = create_engine('YOUR_DATABASE_URL')
with engine.connect() as conn:
    print('Connected!')
"
```

#### 3. Frontend Build Fails

```bash
# Clear cache
rm -rf client/lifeos/node_modules client/lifeos/package-lock.json

# Reinstall
cd client/lifeos
npm install
npm run build
```

#### 4. Service Won't Start

```bash
# Check logs
docker-compose logs backend

# Rebuild image
docker-compose build --no-cache backend

# Remove containers and volumes
docker-compose down -v

# Start fresh
docker-compose up -d
```

#### 5. Out of Memory

```bash
# Check disk space
df -h

# Clean up Docker
docker system prune -a

# Check memory usage
free -h

# Increase Docker memory limits in docker-compose.prod.yml
```

### Debug Mode

```bash
# Enable debug logging
export DEBUG=true
export LOG_LEVEL=DEBUG

# Restart services
docker-compose restart backend
docker-compose logs -f backend
```

---

## Security Considerations

### Essential Security Measures

1. **Environment Variables**
   - Never commit `.env` files
   - Use strong, random secrets
   - Rotate secrets regularly

2. **Database Security**
   ```bash
   # Strong password
   DB_PASSWORD=$(openssl rand -base64 32)
   
   # Restrict access
   # Only backend container should access database
   ```

3. **SSL/TLS Certificates**
   - Use HTTPS in production
   - Renew certificates before expiration
   - Set up auto-renewal

4. **Backup Strategy**
   ```bash
   # Daily backups
   ./deploy.sh backup prod
   
   # Automated backup script
   0 2 * * * /app/lifeos/deploy.sh backup prod >> /var/log/lifeos-backup.log
   ```

5. **Network Security**
   - Use Docker networks (isolated)
   - Implement firewall rules
   - Restrict database port access

6. **Secrets Management**
   ```bash
   # Use Docker secrets for production
   # Or environment-based secret management
   ```

7. **Container Security**
   - Run as non-root user
   - Use health checks
   - Set resource limits
   - Regular image updates

### Backup and Recovery

```bash
# Create backup
./deploy.sh backup prod

# List backups
ls -lah backups/

# Restore from backup
docker-compose -f docker-compose.prod.yml exec db psql -U lifeos -d lifeos < backups/lifeos_backup_TIMESTAMP.sql

# Backup volumes
docker run --rm -v lifeos_postgres_data_prod:/data -v $(pwd)/backups:/backups \
  alpine tar czf /backups/postgres_backup.tar.gz -C / data
```

---

## Scaling and Performance

### Horizontal Scaling

```yaml
# In docker-compose.prod.yml
backend:
  deploy:
    replicas: 3  # Run 3 instances
```

### Load Balancing

The Nginx service automatically load balances between multiple backend instances.

### Caching

- Redis is configured for caching
- Enable application-level caching
- Use CDN for static assets

### Database Optimization

```bash
# Connect to database
docker-compose -f docker-compose.prod.yml exec db psql -U lifeos -d lifeos

# Analyze queries
EXPLAIN ANALYZE SELECT * FROM users WHERE id = 1;

# Create indexes
CREATE INDEX idx_users_email ON users(email);
```

---

## CI/CD Pipeline

GitHub Actions workflow is configured in `.github/workflows/deploy.yml`.

### Workflow Steps

1. **Test** - Run backend and frontend tests
2. **Build** - Build Docker images
3. **Deploy** - Deploy to production (main branch only)

### Setup GitHub Actions Secrets

```bash
# In GitHub Settings > Secrets
DEPLOY_HOST=your-server.com
DEPLOY_USER=deploy-user
DEPLOY_KEY=<SSH private key>
```

---

## Support and Resources

- [Docker Documentation](https://docs.docker.com/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024 | Initial deployment setup |

---

**Last Updated:** 2024
**Maintainer:** LifeOS Team
