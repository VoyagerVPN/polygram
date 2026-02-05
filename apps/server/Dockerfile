# Build stage
FROM node:22-alpine AS builder

# Install pnpm
RUN npm install -g pnpm@10
ENV CI=true
# Dummy DATABASE_URL is required for Prisma config validation during 'prisma generate'
ENV DATABASE_URL="postgresql://postgres:postgres@localhost:5432/unused"

WORKDIR /app

# Copy everything for building
COPY . .

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Generate Prisma Client and build all packages
RUN pnpm -F @polygram/server db:generate && pnpm -r build

# Copy generated Prisma Client to dist for correct relative paths
RUN cp -r /app/apps/server/src/generated /app/apps/server/dist/

# Isolate the server package into /isolated
RUN pnpm --filter @polygram/server deploy --legacy --prod /isolated

# Production stage
FROM node:22-alpine AS production

WORKDIR /app

# Copy the isolated package package.json and node_modules
COPY --from=builder /isolated .

# Copy the build artifacts (includes generated Prisma Client in dist/generated)
COPY --from=builder /app/apps/server/dist ./dist

# Copy generated Prisma Client to node_modules for runtime
COPY --from=builder /app/apps/server/src/generated/prisma ./node_modules/.prisma/client

# Shared package dist
COPY --from=builder /app/packages/shared/dist ./node_modules/@polygram/shared/dist

# Prisma schema for migrations
COPY --from=builder /app/apps/server/prisma/schema.prisma ./prisma/

# Expose port
EXPOSE 3000

# Entrypoint script for migrations and setup
COPY apps/server/docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["docker-entrypoint.sh"]

# Start the server
CMD ["node", "dist/apps/server/src/index.js"]
