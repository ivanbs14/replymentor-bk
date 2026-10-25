CREATE TYPE "SessionSummaryStatus" AS ENUM ('PENDING', 'PROCESSING', 'READY', 'FAILED');

ALTER TABLE "SessionSummary"
ADD COLUMN "status" "SessionSummaryStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN "structuredContent" JSONB,
ADD COLUMN "fallbackContent" TEXT,
ADD COLUMN "provider" TEXT,
ADD COLUMN "model" TEXT,
ADD COLUMN "promptVersion" TEXT NOT NULL DEFAULT 'session-summary-v1',
ADD COLUMN "startedAt" TIMESTAMP(3),
ADD COLUMN "claimedAt" TIMESTAMP(3),
ADD COLUMN "providerCallStartedAt" TIMESTAMP(3),
ADD COLUMN "completedAt" TIMESTAMP(3),
ADD COLUMN "errorCode" TEXT,
ADD COLUMN "attemptCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "manualRetryUsed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "evidenceResponseIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

UPDATE "SessionSummary"
SET "fallbackContent" = "content",
    "status" = 'FAILED',
    "errorCode" = 'LEGACY_SUMMARY';

ALTER TABLE "SessionSummary" ALTER COLUMN "fallbackContent" SET NOT NULL;
ALTER TABLE "SessionSummary" DROP COLUMN "content";
ALTER TABLE "SessionSummary" RENAME COLUMN "structuredContent" TO "content";
ALTER TABLE "SessionSummary" DROP COLUMN "topics";

CREATE INDEX "SessionSummary_status_claimedAt_idx"
ON "SessionSummary"("status", "claimedAt");
