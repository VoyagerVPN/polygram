# Build stage
FROM node:22-alpine AS builder

# Install pnpm
RUN npm install -g pnpm@10

WORKDIR /app

# Copy workspace files
COPY pnpm-workspace.yaml package.json ./
COPY pnpm-lock.yaml ./
COPY packages/shared/package.json packages/shared/
COPY apps/client/package.json apps/client/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY packages/shared/ packages/shared/
COPY apps/client/ apps/client/

# Build the client app
RUN cd apps/client && pnpm build

# Serve stage
FROM nginx:alpine AS production

# Copy build artifacts to nginx public folder
COPY --from=builder /app/apps/client/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
