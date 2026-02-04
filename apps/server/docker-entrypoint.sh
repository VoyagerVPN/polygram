#!/bin/sh
set -e

echo "[Entrypoint] Starting Polygram Server..."

# 1. Validate environment
if [ -z "$BOT_TOKEN" ]; then
    echo "ERROR: BOT_TOKEN is not set!"
    exit 1
fi

if [ -z "$DATABASE_URL" ]; then
    echo "ERROR: DATABASE_URL is not set!"
    exit 1
fi

# 2. Run Database Migrations with retry logic
# This is critical for cloud platforms where DB might take a few seconds to accept connections
echo "[Entrypoint] Running database migrations..."

MAX_RETRIES=10
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if npx prisma migrate deploy; then
        echo "[Entrypoint] Migrations applied successfully."
        break
    else
        RETRY_COUNT=$((RETRY_COUNT + 1))
        if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
            echo "[Entrypoint] Migration attempt $RETRY_COUNT failed. Retrying in 5 seconds..."
            sleep 5
        else
            echo "ERROR: Database migrations failed after $MAX_RETRIES attempts!"
            exit 1
        fi
    fi
done

# 3. Start the application
echo "[Entrypoint] Starting application..."
exec "$@"
