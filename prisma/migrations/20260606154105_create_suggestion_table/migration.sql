/*
  Warnings:

  - Added the required column `askedByPlayerId` to the `Suggestion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Suggestion" ADD COLUMN     "askedByPlayerId" TEXT NOT NULL,
ALTER COLUMN "responderId" DROP NOT NULL;
