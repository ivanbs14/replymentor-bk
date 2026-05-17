-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddColumn
ALTER TABLE "InterviewContext" ADD COLUMN "userId" TEXT;

-- Backfill legacy records
INSERT INTO "User" ("id", "email", "passwordHash", "createdAt", "updatedAt")
VALUES ('legacy-user-auth', 'legacy@replymentor.local', 'legacy-import-no-login', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("email") DO NOTHING;

UPDATE "InterviewContext"
SET "userId" = 'legacy-user-auth'
WHERE "userId" IS NULL;

-- SetNotNull
ALTER TABLE "InterviewContext" ALTER COLUMN "userId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "InterviewContext" ADD CONSTRAINT "InterviewContext_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
