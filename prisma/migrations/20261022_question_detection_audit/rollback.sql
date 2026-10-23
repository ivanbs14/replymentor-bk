ALTER TABLE "SuggestedResponse"
DROP CONSTRAINT IF EXISTS "SuggestedResponse_detectionId_fkey";

ALTER TABLE "SuggestedResponse"
DROP COLUMN IF EXISTS "detectionId";

DROP TABLE IF EXISTS "QuestionDetection";
DROP TYPE IF EXISTS "QuestionDetectionSource";
DROP TYPE IF EXISTS "QuestionDetectionStatus";
