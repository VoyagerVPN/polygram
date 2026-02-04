# Build stage
FROM node:20-alpine AS builder

# Install pnpm
RUN npm install -g pnpm@10

WORKDIR /app

# Copy workspace files
COPY pnpm-workspace.yaml package.json ./
COPY packages/shared/package.json packages/shared/
COPY apps/server/package.json apps/server/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY packages/shared/ packages/shared/
COPY apps/server/ apps/server/
COPY apps/server/prisma/ apps/server/prisma/

# Generate Prisma Client and build
RUN cd apps/server && pnpm db:generate && pnpm build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@10

# Copy workspace files
COPY pnpm-workspace.yaml package.json ./
COPY packages/shared/package.json packages/shared/
COPY apps/server/package.json apps/server/

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy built files
COPY --from=builder /app/packages/shared/dist/ packages/shared/dist/
COPY --from=builder /app/apps/server/dist/ apps/server/dist/
COPY --from=builder /app/apps/server/prisma/ apps/server/prisma/
COPY --from=builder /app/node_modules/.pnpm/@prisma+client* node_modules/.pnpm/
COPY --from=builder /app/node_modules/.bin/prisma node_modules/.bin/

# Expose port
EXPOSE 3000

# Start the server
CMD ["node", "apps/server/dist/index.js"]
