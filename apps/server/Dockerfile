# Build stage
FROM node:22-alpine AS builder

# Install pnpm
RUN npm install -g pnpm@10
ENV CI=true
# ENV PRISMA_CLIENT_ENGINE_TYPE=library

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
RUN apk add --no-cache openssl
# ENV PRISMA_CLIENT_ENGINE_TYPE=library
WORKDIR /app

# Copy the isolated package package.json and node_modules
COPY --from=builder /isolated .

# Copy the build artifacts (including the generated and compiled Prisma client)
COPY --from=builder /app/apps/server/dist ./dist
# Shared package dist
COPY --from=builder /app/packages/shared/dist ./node_modules/@polygram/shared/dist

# Expose port
EXPOSE 3000

# Entrypoint script for migrations and setup
COPY apps/server/docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["docker-entrypoint.sh"]

# Start the server
CMD ["node", "dist/apps/server/src/index.js"]
