#!/bin/bash

# Build deployment ready version

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Building LifeOS for deployment...${NC}\n"

# Install frontend dependencies
echo -e "${BLUE}Installing frontend dependencies...${NC}"
cd client/lifeos
npm install
npm run build
cd ../..

# Copy frontend build to backend static files (if needed)
echo -e "${BLUE}Frontend build completed${NC}\n"

# Install backend dependencies
echo -e "${BLUE}Installing backend dependencies...${NC}"
pip install -r requirements.txt
pip install -r backend/requirements.txt

echo -e "${BLUE}Creating necessary directories...${NC}"
mkdir -p logs
mkdir -p uploads/files
mkdir -p backups

# Build Docker images
echo -e "${BLUE}Building Docker images...${NC}"
docker-compose build

echo -e "${GREEN}✓ Deployment build completed successfully!${NC}\n"
echo -e "${BLUE}Next steps:${NC}"
echo "1. Update .env with your production configuration"
echo "2. Run: docker-compose -f docker-compose.prod.yml up -d"
echo "3. Run migrations: docker-compose -f docker-compose.prod.yml exec backend alembic upgrade head"
