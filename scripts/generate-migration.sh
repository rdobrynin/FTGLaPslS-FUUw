if [ -z "$1" ]; then
  echo "Usage: ./scripts/generate-migration.sh MigrationName"
  exit 1
fi

MIGRATION_NAME=$1
npm run migration:generate src/migrations/$MIGRATION_NAME

echo "Migration generated: src/migrations/$MIGRATION_NAME.ts"
