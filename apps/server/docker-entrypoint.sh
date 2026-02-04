#!/bin/sh
set -e

echo "[Entrypoint] Starting Polygram Server..."

# 1. Validate environment
if [ -z "$BOT_TOKEN" ]; then
    echo "ERROR: BOT_TOKEN is not set!"
    exit 1
fi

# 2. Run Database Migrations
echo "[Entrypoint] Running database migrations..."
if npx prisma migrate deploy; then
    echo "[Entrypoint] Migrations applied successfully."
else
    echo "ERROR: Database migrations failed!"
    exit 1
fi

# 3. Start the application
echo "[Entrypoint] Starting application..."
exec "$@"
