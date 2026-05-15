ALTER TABLE "songs" DROP COLUMN IF EXISTS "coverUrl";
ALTER TABLE "songs" ADD COLUMN "coverImage" BYTEA;
ALTER TABLE "songs" ADD COLUMN "coverMimeType" TEXT;
