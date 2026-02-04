# Build stage
FROM node:22-alpine AS builder

# Install pnpm
RUN npm install -g pnpm@10

WORKDIR /app

# Copy everything for building
COPY . .

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Generate Prisma Client and build
RUN pnpm -F @polygram/server build

# Isolate the server package into /isolated
# This command copies the package and its production dependencies (including shared workspace)
RUN pnpm --filter @polygram/server deploy --prod /isolated

# Production stage
FROM node:22-alpine AS production

WORKDIR /app

# Copy the isolated package from builder
COPY --from=builder /isolated .

# Ensure the build artifacts are present (pnpm deploy might not include dist if ignored)
COPY --from=builder /app/apps/server/dist ./dist

# Expose port
EXPOSE 3000

# Start from the flat isolated structure
# Since we deployed @polygram/server, apps/server/dist becomes ./dist
# Based on previous build check, index.js is at dist/apps/server/src/index.js
CMD ["node", "dist/apps/server/src/index.js"]
