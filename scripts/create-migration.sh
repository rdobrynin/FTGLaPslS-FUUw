if [ -z "$1" ]; then
  echo "Usage: ./scripts/create-migration.sh MigrationName"
  exit 1
fi

MIGRATION_NAME=$1
npm run migration:create src/migrations/$MIGRATION_NAME

echo "Migration created: src/migrations/$MIGRATION_NAME.ts"

if [ -z "$1" ]; then
  echo "Usage: ./scripts/generate-migration.sh MigrationName"
  exit 1
fi

MIGRATION_NAME=$1
npm run migration:generate src/migrations/$MIGRATION_NAME

echo "Migration generated: src/migrations/$MIGRATION_NAME.ts"

# scripts/migrate-up.sh
#!/bin/bash
# Выполнить все pending миграции

echo "Running pending migrations..."
npm run migration:run
echo "Migrations completed!"

# scripts/migrate-down.sh
#!/bin/bash
# Откатить последнюю миграцию

echo "Reverting last migration..."
npm run migration:revert
echo "Migration reverted!"

echo "Migration status:"
npm run migration:show

read -p "Are you sure you want to drop all tables? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
  echo "Operation cancelled"
  exit 0
fi

echo "Dropping all tables..."
npm run schema:drop

echo "Running all migrations..."
npm run migration:run

echo "Database reset completed!"
