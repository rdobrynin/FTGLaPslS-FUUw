FROM node:23-alpine

WORKDIR /app

RUN apk add --no-cache bash postgresql-client

ARG PORT=3000

COPY package*.json ./

RUN npm install

COPY . .

RUN chmod +x scripts/run-migrations.sh

RUN npm run build

EXPOSE $PORT

CMD ["./scripts/run-migrations.sh"]
