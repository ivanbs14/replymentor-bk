#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${REDIS_URL_TEST:-}" ]]; then
  echo "REDIS_URL_TEST is required" >&2
  exit 1
fi

./node_modules/.bin/jest --config ./test/jest-rate-limit-redis.json --runInBand --no-watchman
