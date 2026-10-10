# =========================
# Build stage
# =========================
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files first for better Docker layer caching
COPY package*.json ./

# Install all dependencies
RUN npm ci

# Copy the entire project
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build NestJS application
RUN npm run build


# =========================
# Production stage
# =========================
FROM node:22-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy compiled NestJS application
COPY --from=builder /app/dist ./dist

# Copy Prisma schema and migrations
COPY --from=builder /app/prisma ./prisma

# Copy Prisma configuration
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

# Copy generated Prisma Client
COPY --from=builder /app/generated ./generated

EXPOSE 3000

CMD ["node", "dist/src/main.js"]