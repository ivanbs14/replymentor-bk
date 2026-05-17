-- Add optional behavior/persona instruction for interview context.
ALTER TABLE "InterviewContext"
ADD COLUMN "aiBehavior" TEXT;
