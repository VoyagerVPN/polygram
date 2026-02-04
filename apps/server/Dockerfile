# Build stage
FROM node:22-alpine AS builder

# Install pnpm
RUN npm install -g pnpm@10
ENV CI=true
# Prisma 7 uses WASM by default, no native engines needed

WORKDIR /app

# Copy everything for building
COPY . .

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Generate Prisma Client and build all packages
# The client is now generated INTO src/infrastructure/prisma
RUN pnpm -F @polygram/server db:generate && pnpm -r build

# CRITICAL: Copy the generated JS client from src to dist because tsc doesn't do it
RUN mkdir -p apps/server/dist/apps/server/src/infrastructure/prisma && \
    cp -r apps/server/src/infrastructure/prisma/* apps/server/dist/apps/server/src/infrastructure/prisma/

# Isolate the server package into /isolated
RUN pnpm --filter @polygram/server deploy --legacy --prod /isolated

# Production stage
FROM node:22-alpine AS production
# openssl is no longer needed for Prisma 7 Rust-free (WASM) client
WORKDIR /app

# Copy the isolated package package.json and node_modules
COPY --from=builder /isolated .

# Copy the build artifacts (including the generated and compiled Prisma client)
COPY --from=builder /app/apps/server/dist ./dist
# Shared package dist
COPY --from=builder /app/packages/shared/dist ./node_modules/@polygram/shared/dist

# Prisma schema for migrations
COPY --from=builder /app/apps/server/prisma ./prisma

# Expose port
EXPOSE 3000

# Entrypoint script for migrations and setup
COPY apps/server/docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["docker-entrypoint.sh"]

# Start the server
CMD ["node", "dist/apps/server/src/index.js"]
