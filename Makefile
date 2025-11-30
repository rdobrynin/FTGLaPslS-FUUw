.PHONY: help migrate-create migrate-generate migrate-up migrate-down migrate-status db-reset

help:
	@echo "Available commands:"
	@echo "  make migrate-create NAME=YourMigrationName  - Create empty migration"
	@echo "  make migrate-generate NAME=YourMigrationName - Generate migration from entities"
	@echo "  make migrate-up                              - Run pending migrations"
	@echo "  make migrate-down                            - Revert last migration"
	@echo "  make migrate-status                          - Show migration status"
	@echo "  make db-reset                                - Reset database (dangerous!)"

migrate-create:
	@if [ -z "$(NAME)" ]; then \
		echo "Error: NAME is required. Usage: make migrate-create NAME=YourMigrationName"; \
		exit 1; \
	fi
	npm run migration:create src/migrations/$(NAME)

migrate-generate:
	@if [ -z "$(NAME)" ]; then \
		echo "Error: NAME is required. Usage: make migrate-generate NAME=YourMigrationName"; \
		exit 1; \
	fi
	npm run migration:generate src/migrations/$(NAME)

migrate-up:
	npm run migration:run

migrate-down:
	npm run migration:revert

migrate-status:
	npm run migration:show

db-reset:
	@read -p "Are you sure you want to drop all tables? (yes/no): " confirm; \
	if [ "$$confirm" = "yes" ]; then \
		npm run schema:drop && npm run migration:run; \
		echo "Database reset completed!"; \
	else \
		echo "Operation cancelled"; \
	fi
