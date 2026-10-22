ALTER TABLE "InterviewSession"
ADD COLUMN "nextTranscriptSequence" INTEGER NOT NULL DEFAULT 1;

ALTER TABLE "TranscriptChunk"
ADD COLUMN "idempotencyKey" TEXT,
ADD COLUMN "requestFingerprint" TEXT;

ALTER TABLE "SuggestedResponse"
ADD COLUMN "idempotencyKey" TEXT,
ADD COLUMN "requestFingerprint" TEXT;

UPDATE "InterviewSession" AS session
SET "nextTranscriptSequence" = chunks."nextSequence"
FROM (
  SELECT "sessionId", COALESCE(MAX("sequence"), 0) + 1 AS "nextSequence"
  FROM "TranscriptChunk"
  GROUP BY "sessionId"
) AS chunks
WHERE chunks."sessionId" = session."id";

DO $$
DECLARE
  duplicate_contexts TEXT;
BEGIN
  SELECT STRING_AGG(FORMAT('%s (%s)', duplicates."contextId", duplicates."activeCount"), ', ')
  INTO duplicate_contexts
  FROM (
    SELECT "contextId", COUNT(*) AS "activeCount"
    FROM "InterviewSession"
    WHERE "status" = 'ACTIVE'
    GROUP BY "contextId"
    HAVING COUNT(*) > 1
  ) AS duplicates;

  IF duplicate_contexts IS NOT NULL THEN
    RAISE EXCEPTION 'FEAT-010 preflight: multiple ACTIVE sessions: %', duplicate_contexts;
  END IF;
END $$;

CREATE UNIQUE INDEX "InterviewSession_one_active_per_context"
ON "InterviewSession" ("contextId")
WHERE "status" = 'ACTIVE';

CREATE UNIQUE INDEX "TranscriptChunk_session_idempotency_key"
ON "TranscriptChunk" ("sessionId", "idempotencyKey")
WHERE "idempotencyKey" IS NOT NULL;

CREATE UNIQUE INDEX "SuggestedResponse_session_idempotency_key"
ON "SuggestedResponse" ("sessionId", "idempotencyKey")
WHERE "idempotencyKey" IS NOT NULL;
