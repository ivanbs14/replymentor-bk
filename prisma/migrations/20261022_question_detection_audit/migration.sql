CREATE TYPE "QuestionDetectionStatus" AS ENUM ('DETECTED', 'NOT_FOUND');
CREATE TYPE "QuestionDetectionSource" AS ENUM ('LEGACY', 'DETERMINISTIC', 'LLM', 'MANUAL');

CREATE TABLE "QuestionDetection" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "status" "QuestionDetectionStatus" NOT NULL,
    "question" TEXT,
    "confidence" DOUBLE PRECISION,
    "source" "QuestionDetectionSource" NOT NULL,
    "detectorVersion" TEXT NOT NULL,
    "evidence" JSONB NOT NULL,
    "provider" TEXT,
    "model" TEXT,
    "idempotencyKey" TEXT,
    "requestFingerprint" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "QuestionDetection_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "QuestionDetection_confidence_range" CHECK (
      "confidence" IS NULL OR ("confidence" >= 0 AND "confidence" <= 1)
    ),
    CONSTRAINT "QuestionDetection_question_status" CHECK (
      ("status" = 'DETECTED' AND "question" IS NOT NULL) OR
      ("status" = 'NOT_FOUND' AND "question" IS NULL)
    )
);

ALTER TABLE "SuggestedResponse" ADD COLUMN "detectionId" TEXT;

INSERT INTO "QuestionDetection" (
  "id",
  "sessionId",
  "status",
  "question",
  "confidence",
  "source",
  "detectorVersion",
  "evidence",
  "idempotencyKey",
  "requestFingerprint",
  "createdAt"
)
SELECT
  'legacy_' || response."id",
  response."sessionId",
  'DETECTED'::"QuestionDetectionStatus",
  response."detectedQuestion",
  NULL,
  'LEGACY'::"QuestionDetectionSource",
  'legacy-v1',
  '[]'::jsonb,
  response."idempotencyKey",
  response."requestFingerprint",
  response."createdAt"
FROM "SuggestedResponse" AS response;

UPDATE "SuggestedResponse" AS response
SET "detectionId" = 'legacy_' || response."id";

ALTER TABLE "SuggestedResponse" ALTER COLUMN "detectionId" SET NOT NULL;

CREATE UNIQUE INDEX "QuestionDetection_session_idempotency_key"
ON "QuestionDetection" ("sessionId", "idempotencyKey")
WHERE "idempotencyKey" IS NOT NULL;

CREATE UNIQUE INDEX "QuestionDetection_sessionId_id_key"
ON "QuestionDetection"("sessionId", "id");

CREATE UNIQUE INDEX "SuggestedResponse_detectionId_key"
ON "SuggestedResponse"("detectionId");

CREATE UNIQUE INDEX "SuggestedResponse_sessionId_detectionId_key"
ON "SuggestedResponse"("sessionId", "detectionId");

ALTER TABLE "QuestionDetection"
ADD CONSTRAINT "QuestionDetection_sessionId_fkey"
FOREIGN KEY ("sessionId") REFERENCES "InterviewSession"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SuggestedResponse"
ADD CONSTRAINT "SuggestedResponse_detectionId_fkey"
FOREIGN KEY ("sessionId", "detectionId")
REFERENCES "QuestionDetection"("sessionId", "id")
ON DELETE RESTRICT ON UPDATE CASCADE;

