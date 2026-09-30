FROM node:22-alpine
WORKDIR /app

COPY shared /shared
WORKDIR /shared
RUN npm ci
WORKDIR /app
COPY backend/package.json backend/package-lock.json ./
COPY backend/prisma ./prisma
RUN npm ci

COPY backend/ .
RUN npm run build

EXPOSE 3001
CMD ["sh", "docker-entrypoint.sh"]
