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
