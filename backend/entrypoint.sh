#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

echo "=== entrypoint.sh starting ==="
echo "NODE_ENV=${NODE_ENV:-production}"

# default postgres values; override via env if different
PGHOST="${POSTGRES_HOST:-${DB_HOST:-postgres}}"
PGPORT="${POSTGRES_PORT:-5432}"
PGUSER="${POSTGRES_USER:-postgres}"

# Wait for Postgres to be ready (use pg_isready if available; otherwise try TCP connect)
wait_for_postgres() {
  echo "Waiting for Postgres at ${PGHOST}:${PGPORT} ..."
  local retries=0
  until pg_isready -h "${PGHOST}" -p "${PGPORT}" -U "${PGUSER}" >/dev/null 2>&1; do
    retries=$((retries+1))
    if [ "${retries}" -gt 120 ]; then
      echo "Postgres did not become ready in time" >&2
      return 1
    fi
    sleep 1
  done
  echo "Postgres is ready"
  return 0
}

# If pg_isready not found, fallback to psql loop
if ! command -v pg_isready >/dev/null 2>&1; then
  echo "pg_isready not found, using psql loop"
  until PGPASSWORD="${POSTGRES_PASSWORD:-}" psql -h "${PGHOST}" -p "${PGPORT}" -U "${PGUSER}" -c '\l' >/dev/null 2>&1; do
    echo "Waiting for Postgres (tcp)..."
    sleep 1
  done
else
  wait_for_postgres
fi

# Generate Prisma client
echo "Running: npx prisma generate"
npx prisma generate --schema=./prisma/schema.prisma

# Deploy migrations
echo "Running: npx prisma migrate deploy"
npx prisma migrate deploy --schema=./prisma/schema.prisma

# Run compiled seed if present
if [ -f ./dist/prisma/seed.js ]; then
  echo "Running compiled seed: node ./dist/prisma/seed.js"
  node ./dist/prisma/seed.js || echo "Compiled seed failed (non-fatal)"
elif [ -f ./prisma/seed.js ]; then
  echo "Running plain JS seed at ./prisma/seed.js"
  node ./prisma/seed.js || echo "Seed failed (non-fatal)"
else
  echo "No seed found in dist or prisma/; skipping seed step."
fi

echo "Starting server: node dist/server.js"
exec node dist/server.js
