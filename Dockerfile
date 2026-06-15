# Multi-stage Dockerfile for JobPilot AI API Server
FROM node:20-alpine AS builder

WORKDIR /app

# Copy lockfiles and workspaces configs
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages/types/package*.json ./packages/types/
COPY packages/shared/package*.json ./packages/shared/
COPY packages/database/package*.json ./packages/database/
COPY packages/ai/package*.json ./packages/ai/

# Install dependencies (workspaces resolved)
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma Client for MongoDB
RUN npx prisma generate --schema=packages/database/prisma/schema.prisma

# Build all monorepo packages
RUN npm run build:packages
RUN npm run build:api

# Production Stage
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app /app

EXPOSE 4000

ENV NODE_ENV=production
ENV PORT=4000

CMD ["npm", "run", "start", "--workspace=apps/api"]
