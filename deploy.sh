#!/bin/bash

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Log functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    log_success "Docker is installed"
}

# Check if Docker Compose is installed
check_docker_compose() {
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    log_success "Docker Compose is installed"
}

# Setup environment
setup_env() {
    log_info "Setting up environment..."
    
    if [ ! -f .env ]; then
        if [ -f .env.example ]; then
            cp .env.example .env
            log_success "Created .env from .env.example"
            log_warning "Please update .env with your actual values"
        else
            log_error ".env.example not found"
            exit 1
        fi
    else
        log_success ".env already exists"
    fi
}

# Build images
build_images() {
    log_info "Building Docker images..."
    
    if [ "$1" == "prod" ]; then
        docker-compose -f docker-compose.prod.yml build --no-cache
    else
        docker-compose build
    fi
    
    if [ $? -eq 0 ]; then
        log_success "Docker images built successfully"
    else
        log_error "Failed to build Docker images"
        exit 1
    fi
}

# Start services
start_services() {
    log_info "Starting services..."
    
    if [ "$1" == "prod" ]; then
        docker-compose -f docker-compose.prod.yml up -d
    else
        docker-compose up -d
    fi
    
    if [ $? -eq 0 ]; then
        log_success "Services started successfully"
        sleep 3
        show_status
    else
        log_error "Failed to start services"
        exit 1
    fi
}

# Stop services
stop_services() {
    log_info "Stopping services..."
    
    if [ "$1" == "prod" ]; then
        docker-compose -f docker-compose.prod.yml down
    else
        docker-compose down
    fi
    
    if [ $? -eq 0 ]; then
        log_success "Services stopped successfully"
    else
        log_error "Failed to stop services"
        exit 1
    fi
}

# Show service status
show_status() {
    log_info "Service status:"
    
    if [ "$1" == "prod" ]; then
        docker-compose -f docker-compose.prod.yml ps
    else
        docker-compose ps
    fi
}

# View logs
view_logs() {
    log_info "Displaying logs (press Ctrl+C to exit)..."
    
    if [ "$1" == "prod" ]; then
        docker-compose -f docker-compose.prod.yml logs -f
    else
        docker-compose logs -f
    fi
}

# Run migrations
run_migrations() {
    log_info "Running database migrations..."
    
    if [ "$1" == "prod" ]; then
        docker-compose -f docker-compose.prod.yml exec backend alembic upgrade head
    else
        docker-compose exec backend alembic upgrade head
    fi
    
    if [ $? -eq 0 ]; then
        log_success "Migrations completed successfully"
    else
        log_error "Failed to run migrations"
        exit 1
    fi
}

# Run tests
run_tests() {
    log_info "Running tests..."
    
    if [ "$1" == "prod" ]; then
        docker-compose -f docker-compose.prod.yml exec backend pytest
    else
        docker-compose exec backend pytest
    fi
}

# Backup database
backup_database() {
    log_info "Creating database backup..."
    
    mkdir -p backups
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_FILE="backups/lifeos_backup_${TIMESTAMP}.sql"
    
    if [ "$1" == "prod" ]; then
        docker-compose -f docker-compose.prod.yml exec -T db pg_dump -U ${DB_USER} ${DB_NAME} > ${BACKUP_FILE}
    else
        docker-compose exec -T db pg_dump -U lifeos lifeos > ${BACKUP_FILE}
    fi
    
    if [ $? -eq 0 ]; then
        log_success "Database backed up to ${BACKUP_FILE}"
    else
        log_error "Failed to backup database"
        exit 1
    fi
}

# Clean up
cleanup() {
    log_info "Cleaning up..."
    
    if [ "$1" == "prod" ]; then
        docker-compose -f docker-compose.prod.yml down -v
    else
        docker-compose down -v
    fi
    
    docker system prune -f
    log_success "Cleanup completed"
}

# Show help
show_help() {
    echo "LifeOS Deployment Script"
    echo ""
    echo "Usage: ./deploy.sh [command] [environment]"
    echo ""
    echo "Commands:"
    echo "  setup           Set up environment and configuration"
    echo "  build           Build Docker images"
    echo "  start           Start services"
    echo "  stop            Stop services"
    echo "  restart         Restart services"
    echo "  status          Show service status"
    echo "  logs            View service logs"
    echo "  migrate         Run database migrations"
    echo "  test            Run tests"
    echo "  backup          Create database backup"
    echo "  clean           Clean up containers and volumes"
    echo "  help            Show this help message"
    echo ""
    echo "Environment:"
    echo "  dev (default)   Development environment"
    echo "  prod            Production environment"
    echo ""
    echo "Examples:"
    echo "  ./deploy.sh setup dev"
    echo "  ./deploy.sh build prod"
    echo "  ./deploy.sh start prod"
    echo "  ./deploy.sh logs dev"
}

# Main script
COMMAND=${1:-help}
ENVIRONMENT=${2:-dev}

case $COMMAND in
    setup)
        check_docker
        check_docker_compose
        setup_env
        ;;
    build)
        check_docker
        check_docker_compose
        build_images $ENVIRONMENT
        ;;
    start)
        check_docker
        check_docker_compose
        start_services $ENVIRONMENT
        ;;
    stop)
        check_docker
        check_docker_compose
        stop_services $ENVIRONMENT
        ;;
    restart)
        check_docker
        check_docker_compose
        stop_services $ENVIRONMENT
        start_services $ENVIRONMENT
        ;;
    status)
        check_docker
        check_docker_compose
        show_status $ENVIRONMENT
        ;;
    logs)
        check_docker
        check_docker_compose
        view_logs $ENVIRONMENT
        ;;
    migrate)
        check_docker
        check_docker_compose
        run_migrations $ENVIRONMENT
        ;;
    test)
        check_docker
        check_docker_compose
        run_tests $ENVIRONMENT
        ;;
    backup)
        check_docker
        check_docker_compose
        backup_database $ENVIRONMENT
        ;;
    clean)
        check_docker
        check_docker_compose
        cleanup $ENVIRONMENT
        ;;
    help)
        show_help
        ;;
    *)
        log_error "Unknown command: $COMMAND"
        show_help
        exit 1
        ;;
esac
