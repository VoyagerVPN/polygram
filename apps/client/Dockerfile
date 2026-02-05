# Build stage
FROM node:22-alpine AS builder

# Install pnpm
RUN npm install -g pnpm@10

# Build-time env variables
ARG VITE_API_URL=http://localhost:3001/api
ARG VITE_WS_URL=ws://localhost:3001/ws
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_WS_URL=${VITE_WS_URL}

WORKDIR /app

# Copy all source files
COPY . .

# Install dependencies for all packages
RUN pnpm install --frozen-lockfile

# Build the client app (using workspace context)
RUN pnpm -F @polygram/client build

# Production stage - Nginx for static serving
FROM nginx:alpine AS production

# Copy the built assets to the Nginx html folder
COPY --from=builder /app/apps/client/dist /usr/share/nginx/html

# Add a custom nginx config for SPA routing
COPY apps/client/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
