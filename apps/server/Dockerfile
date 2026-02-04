# Build stage
FROM node:22-alpine AS builder

# Install pnpm
RUN npm install -g pnpm@10

WORKDIR /app

# Copy workspace files
COPY pnpm-workspace.yaml package.json ./
COPY pnpm-lock.yaml ./
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
FROM node:22-alpine AS production

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@10

# Copy workspace files
COPY pnpm-workspace.yaml package.json ./
COPY pnpm-lock.yaml ./
COPY packages/shared/package.json packages/shared/
COPY apps/server/package.json apps/server/

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy built files and generated prisma client
COPY --from=builder /app/packages/shared/dist/ packages/shared/dist/
COPY --from=builder /app/apps/server/dist/ apps/server/dist/
COPY --from=builder /app/apps/server/prisma/ apps/server/prisma/
COPY --from=builder /app/node_modules/.prisma/ node_modules/.prisma/

# Expose port
EXPOSE 3000

# Start the server
CMD ["node", "apps/server/dist/index.js"]
