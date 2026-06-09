/*
  Warnings:

  - The `status` column on the `CardNote` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "public"."CardStatus" AS ENUM ('UNKNOWN', 'HAS', 'DOES_NOT_HAVE');

-- AlterTable
ALTER TABLE "public"."CardNote" ADD COLUMN     "observation" TEXT,
DROP COLUMN "status",
ADD COLUMN     "status" "public"."CardStatus" NOT NULL DEFAULT 'UNKNOWN';

-- DropEnum
DROP TYPE "public"."NoteStatus";
