#!/usr/bin/env bash
set -euo pipefail

: "${DATABASE_URL_TEST:?DATABASE_URL_TEST is required}"

database_name="$({
  DATABASE_URL_TEST="$DATABASE_URL_TEST" node -e '
    const url = new URL(process.env.DATABASE_URL_TEST);
    process.stdout.write(url.pathname.replace(/^\//, ""));
  '
})"

if [[ "$database_name" != *"_test"* ]]; then
  echo "Refusing to run integration tests against non-test database: $database_name" >&2
  exit 1
fi

export DATABASE_URL="$DATABASE_URL_TEST"
npx prisma migrate deploy
npm run test:e2e -- --runInBand --no-watchman \
  test/session-integrity.e2e-spec.ts test/contracts.e2e-spec.ts
