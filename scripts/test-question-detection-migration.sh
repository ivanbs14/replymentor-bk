#!/usr/bin/env bash
set -euo pipefail

: "${DATABASE_URL_TEST:?DATABASE_URL_TEST is required}"

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
project_dir="$(cd "$script_dir/.." && pwd)"
test_schema="feat16_migration_test"
psql_url="$({
  DATABASE_URL_TEST="$DATABASE_URL_TEST" node -e '
    const url = new URL(process.env.DATABASE_URL_TEST);
    url.searchParams.delete("schema");
    process.stdout.write(url.toString());
  '
})"

cleanup() {
  PGOPTIONS='--search_path=public' psql "$psql_url" -v ON_ERROR_STOP=1 \
    -c "DROP SCHEMA IF EXISTS \"$test_schema\" CASCADE" >/dev/null
}
trap cleanup EXIT

cleanup
psql "$psql_url" -v ON_ERROR_STOP=1 \
  -c "CREATE SCHEMA \"$test_schema\"" >/dev/null
export PGOPTIONS="--search_path=$test_schema"

for migration in \
  20260515_init \
  20260516_add_ai_behavior_to_context \
  20260517_add_auth_user \
  20261021_session_integrity
do
  psql "$psql_url" -v ON_ERROR_STOP=1 \
    -f "$project_dir/prisma/migrations/$migration/migration.sql" >/dev/null
done

psql "$psql_url" -v ON_ERROR_STOP=1 >/dev/null <<'SQL'
INSERT INTO "InterviewContext" (
  "id", "userId", "resumeText", "interviewType", "jobLevel",
  "jobDescription", "companyName", "responsePreference", "createdAt", "updatedAt"
) VALUES (
  'context-legacy', 'legacy-user-auth', 'Legacy resume', 'Technical', 'Senior',
  'Legacy role', 'Legacy company', 'concise', '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z'
);

INSERT INTO "InterviewSession" (
  "id", "contextId", "createdAt", "updatedAt"
) VALUES (
  'session-legacy', 'context-legacy', '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z'
);

INSERT INTO "SuggestedResponse" (
  "id", "sessionId", "detectedQuestion", "suggestedAnswer", "shortVersion",
  "keyPoints", "strategicNote", "idempotencyKey", "requestFingerprint", "createdAt"
) VALUES (
  'response-legacy', 'session-legacy', 'Legacy question?', 'Legacy answer.', 'Legacy.',
  ARRAY['legacy'], 'Preserve me.', '11111111-1111-4111-8111-111111111111',
  'fingerprint-v1', '2026-01-02T03:04:05Z'
);
SQL

psql "$psql_url" -v ON_ERROR_STOP=1 \
  -f "$project_dir/prisma/migrations/20261022_question_detection_audit/migration.sql" >/dev/null

psql "$psql_url" -v ON_ERROR_STOP=1 >/dev/null <<'SQL'
DO $$
DECLARE
  detection_count INTEGER;
  linked_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO detection_count
  FROM "QuestionDetection"
  WHERE "id" = 'legacy_response-legacy'
    AND "sessionId" = 'session-legacy'
    AND "status" = 'DETECTED'
    AND "question" = 'Legacy question?'
    AND "confidence" IS NULL
    AND "source" = 'LEGACY'
    AND "detectorVersion" = 'legacy-v1'
    AND "evidence" = '[]'::jsonb
    AND "idempotencyKey" = '11111111-1111-4111-8111-111111111111'
    AND "requestFingerprint" = 'fingerprint-v1'
    AND "createdAt" = '2026-01-02T03:04:05Z';

  SELECT COUNT(*) INTO linked_count
  FROM "SuggestedResponse"
  WHERE "id" = 'response-legacy'
    AND "detectionId" = 'legacy_response-legacy'
    AND "suggestedAnswer" = 'Legacy answer.';

  IF detection_count <> 1 OR linked_count <> 1 THEN
    RAISE EXCEPTION 'FEAT-016 migration backfill did not preserve the legacy response';
  END IF;
END $$;
SQL

psql "$psql_url" -v ON_ERROR_STOP=1 \
  -f "$project_dir/prisma/migrations/20261022_question_detection_audit/rollback.sql" >/dev/null

psql "$psql_url" -v ON_ERROR_STOP=1 >/dev/null <<'SQL'
DO $$
DECLARE
  response_count INTEGER;
  detection_column_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO response_count
  FROM "SuggestedResponse"
  WHERE "id" = 'response-legacy'
    AND "suggestedAnswer" = 'Legacy answer.'
    AND "createdAt" = '2026-01-02T03:04:05Z';

  SELECT COUNT(*) INTO detection_column_count
  FROM information_schema.columns
  WHERE table_schema = current_schema()
    AND table_name = 'SuggestedResponse'
    AND column_name = 'detectionId';

  IF response_count <> 1 OR detection_column_count <> 0 OR
     to_regclass('"QuestionDetection"') IS NOT NULL THEN
    RAISE EXCEPTION 'FEAT-016 rollback did not preserve the legacy response';
  END IF;
END $$;
SQL
