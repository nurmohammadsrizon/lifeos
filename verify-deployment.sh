#!/bin/bash

# Post-Deployment Verification Script
# Run this after deployment to verify everything is working

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Counters
CHECKS_TOTAL=0
CHECKS_PASSED=0
CHECKS_FAILED=0

# Helper functions
check_pass() {
    echo -e "${GREEN}✓ PASS:${NC} $1"
    ((CHECKS_PASSED++))
    ((CHECKS_TOTAL++))
}

check_fail() {
    echo -e "${RED}✗ FAIL:${NC} $1"
    ((CHECKS_FAILED++))
    ((CHECKS_TOTAL++))
}

check_warn() {
    echo -e "${YELLOW}⚠ WARN:${NC} $1"
}

section() {
    echo ""
    echo -e "${BLUE}===== $1 =====${NC}"
}

# Main verification

section "Docker Services Status"

# Check if services are running
if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
    check_pass "Docker services are running"
else
    check_fail "Some Docker services are not running"
fi

# Check backend
if docker-compose -f docker-compose.prod.yml ps backend | grep -q "Up"; then
    check_pass "Backend service is running"
else
    check_fail "Backend service is not running"
fi

# Check frontend
if docker-compose -f docker-compose.prod.yml ps frontend | grep -q "Up"; then
    check_pass "Frontend service is running"
else
    check_fail "Frontend service is not running"
fi

# Check database
if docker-compose -f docker-compose.prod.yml ps db | grep -q "Up"; then
    check_pass "Database service is running"
else
    check_fail "Database service is not running"
fi

# Check Redis
if docker-compose -f docker-compose.prod.yml ps redis | grep -q "Up"; then
    check_pass "Redis service is running"
else
    check_warn "Redis service is not running (optional)"
fi

section "Health Checks"

# API Health
if curl -s http://localhost:8000/health | grep -q "healthy"; then
    check_pass "Backend API is healthy"
else
    check_fail "Backend API health check failed"
fi

# Database connectivity
if docker-compose -f docker-compose.prod.yml exec -T db pg_isready -U lifeos &>/dev/null; then
    check_pass "Database is accessible"
else
    check_fail "Database connection failed"
fi

# Redis connectivity
if docker-compose -f docker-compose.prod.yml exec -T redis redis-cli ping | grep -q "PONG"; then
    check_pass "Redis is accessible"
else
    check_warn "Redis health check failed"
fi

section "Network Configuration"

# Check if ports are listening
if netstat -tuln 2>/dev/null | grep -q ":80 "; then
    check_pass "Port 80 (HTTP) is open"
else
    check_fail "Port 80 (HTTP) is not listening"
fi

if netstat -tuln 2>/dev/null | grep -q ":443 "; then
    check_pass "Port 443 (HTTPS) is open"
else
    check_warn "Port 443 (HTTPS) is not listening (check if using different setup)"
fi

if netstat -tuln 2>/dev/null | grep -q ":8000 "; then
    check_pass "Port 8000 (Backend) is open"
else
    check_fail "Port 8000 (Backend) is not listening"
fi

section "Environment Configuration"

# Check if .env file exists
if [ -f ".env" ]; then
    check_pass ".env file exists"
else
    check_fail ".env file not found"
fi

# Check if critical env vars are set
if grep -q "SECRET_KEY" .env && [ "$(grep 'SECRET_KEY' .env | cut -d'=' -f2)" != "your-super-secret-key-change-this-in-production" ]; then
    check_pass "SECRET_KEY is configured"
else
    check_fail "SECRET_KEY is not properly configured"
fi

if grep -q "DATABASE_URL" .env; then
    check_pass "DATABASE_URL is configured"
else
    check_fail "DATABASE_URL is not configured"
fi

section "Disk Space & Resources"

# Check disk space
DISK_USAGE=$(df -h / | tail -1 | awk '{print $5}' | cut -d'%' -f1)
if [ "$DISK_USAGE" -lt 90 ]; then
    check_pass "Disk usage is acceptable ($DISK_USAGE%)"
else
    check_fail "Disk usage is high ($DISK_USAGE%)"
fi

# Check memory
MEMORY_AVAILABLE=$(free -h | grep Mem | awk '{print $7}')
check_pass "Memory available: $MEMORY_AVAILABLE"

# Check Docker disk usage
DOCKER_SIZE=$(docker system df | grep "Total" | awk '{print $4}')
check_pass "Docker disk usage: $DOCKER_SIZE"

section "Logs & Errors"

# Check for recent errors in backend
if docker-compose -f docker-compose.prod.yml logs backend --tail=100 | grep -i "error\|exception\|critical" | head -5 > /tmp/errors.txt; then
    ERROR_COUNT=$(wc -l < /tmp/errors.txt)
    if [ "$ERROR_COUNT" -gt 5 ]; then
        check_warn "Found $ERROR_COUNT recent errors in backend logs"
        head -3 /tmp/errors.txt
    else
        check_pass "No significant errors found in recent logs"
    fi
else
    check_pass "No errors found in recent logs"
fi

section "Database Status"

# Check database size
DB_SIZE=$(docker-compose -f docker-compose.prod.yml exec -T db psql -U lifeos -d lifeos -c "SELECT pg_size_pretty(pg_database_size('lifeos'));" 2>/dev/null | tail -1)
if [ -n "$DB_SIZE" ]; then
    check_pass "Database size: $DB_SIZE"
else
    check_warn "Could not determine database size"
fi

# Check number of database connections
CONNECTIONS=$(docker-compose -f docker-compose.prod.yml exec -T db psql -U lifeos -d lifeos -c "SELECT count(*) FROM pg_stat_activity;" 2>/dev/null | grep -oE "[0-9]+$")
check_pass "Active database connections: $CONNECTIONS"

section "SSL/TLS Certificate"

# Check if cert files exist
if [ -f "certs/fullchain.pem" ]; then
    check_pass "SSL certificate file exists"
    
    # Check certificate expiration
    EXPIRY=$(openssl x509 -enddate -noout -in certs/fullchain.pem | cut -d'=' -f2)
    EXPIRY_DATE=$(date -d "$EXPIRY" +%s)
    CURRENT_DATE=$(date +%s)
    DAYS_LEFT=$(( ($EXPIRY_DATE - $CURRENT_DATE) / 86400 ))
    
    if [ "$DAYS_LEFT" -gt 30 ]; then
        check_pass "SSL certificate expires in $DAYS_LEFT days"
    else
        check_fail "SSL certificate expires in $DAYS_LEFT days (renew soon)"
    fi
else
    check_warn "SSL certificate file not found"
fi

section "Backup Status"

# Check if backups directory exists
if [ -d "backups" ]; then
    check_pass "Backups directory exists"
    
    # Check last backup
    LAST_BACKUP=$(ls -t backups/ 2>/dev/null | head -1)
    if [ -n "$LAST_BACKUP" ]; then
        BACKUP_TIME=$(date -d "$(stat -c '%y' backups/$LAST_BACKUP | cut -d' ' -f1,2)" +%s)
        CURRENT_TIME=$(date +%s)
        HOURS_AGO=$(( ($CURRENT_TIME - $BACKUP_TIME) / 3600 ))
        
        if [ "$HOURS_AGO" -lt 48 ]; then
            check_pass "Recent backup found ($HOURS_AGO hours ago)"
        else
            check_warn "Last backup is old ($HOURS_AGO hours ago)"
        fi
    else
        check_warn "No backups found"
    fi
else
    check_warn "Backups directory not found"
fi

section "Summary"

echo ""
echo -e "${BLUE}Total Checks:${NC} $CHECKS_TOTAL"
echo -e "${GREEN}Passed:${NC} $CHECKS_PASSED"
echo -e "${RED}Failed:${NC} $CHECKS_FAILED"
echo ""

if [ $CHECKS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All critical checks passed!${NC}"
    exit 0
else
    echo -e "${RED}✗ Some checks failed. Please review the issues above.${NC}"
    exit 1
fi
