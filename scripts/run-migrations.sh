#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}  Database Migration Script${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""


echo -e "${YELLOW}Waiting for PostgreSQL to be ready...${NC}"
MAX_RETRIES=30
RETRY_COUNT=0

until PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -U "$DB_USERNAME" -d "$DB_DATABASE" -c '\q' 2>/dev/null; do
  RETRY_COUNT=$((RETRY_COUNT + 1))

  if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
    echo -e "${RED}ERROR: PostgreSQL is not available after $MAX_RETRIES attempts${NC}"
    exit 1
  fi

  echo -e "${YELLOW}PostgreSQL is unavailable - sleeping (attempt $RETRY_COUNT/$MAX_RETRIES)${NC}"
  sleep 2
done

echo -e "${GREEN}✓ PostgreSQL is ready!${NC}"
echo ""


echo -e "${YELLOW}Waiting for Redis to be ready...${NC}"
RETRY_COUNT=0

until redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" ping 2>/dev/null | grep -q PONG; do
  RETRY_COUNT=$((RETRY_COUNT + 1))

  if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
    echo -e "${RED}ERROR: Redis is not available after $MAX_RETRIES attempts${NC}"
    exit 1
  fi

  echo -e "${YELLOW}Redis is unavailable - sleeping (attempt $RETRY_COUNT/$MAX_RETRIES)${NC}"
  sleep 2
done

echo -e "${GREEN}✓ Redis is ready!${NC}"
echo ""

echo -e "${YELLOW}Checking migration status...${NC}"
npm run migration:show 2>/dev/null || echo -e "${YELLOW}No migrations table found yet${NC}"
echo ""

echo -e "${YELLOW}Running database migrations...${NC}"
if npm run migration:run; then
  echo ""
  echo -e "${GREEN}✓ Migrations completed successfully!${NC}"
else
  echo ""
  echo -e "${RED}✗ Migration failed!${NC}"
  exit 1
fi

echo ""
echo -e "${YELLOW}========================================${NC}"

# If isset RUN_APP_AFTER_MIGRATIONS run below script:
if [ "$RUN_APP_AFTER_MIGRATIONS" = "true" ]; then
  echo -e "${GREEN}Starting application...${NC}"
  echo -e "${YELLOW}========================================${NC}"
  echo ""
  npm start
else
  echo -e "${GREEN}Migration script completed. Application not started.${NC}"
  echo -e "${YELLOW}Set RUN_APP_AFTER_MIGRATIONS=true to auto-start the app${NC}"
fi
