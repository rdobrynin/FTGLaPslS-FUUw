# FTGLaPslS-FUUw
Koa auth

### Migrations

make command: migrate-up-docker:
`docker-compose exec app npm run migration:run`

make command: migrate-down-docker:
`docker-compose exec app npm run migration:revert`

make command: migrate-status-docker:
`docker-compose exec app npm run migration:show`
