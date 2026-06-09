-- CreateEnum
CREATE TYPE "public"."NoteStatus" AS ENUM ('UNKNOWN', 'HAS', 'DOES_NOT_HAVE');

-- CreateTable
CREATE TABLE "public"."Game" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "playerCount" INTEGER NOT NULL,
    "isSetupComplete" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Player" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isMe" BOOLEAN NOT NULL,
    "cardCount" INTEGER NOT NULL,
    "gameId" TEXT NOT NULL,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CardNote" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "status" "public"."NoteStatus" NOT NULL,

    CONSTRAINT "CardNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Theory" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "suspectCardId" TEXT,
    "weaponCardId" TEXT,
    "roomCardId" TEXT,

    CONSTRAINT "Theory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CardNote_playerId_cardId_key" ON "public"."CardNote"("playerId", "cardId");

-- CreateIndex
CREATE UNIQUE INDEX "Theory_gameId_key" ON "public"."Theory"("gameId");

-- AddForeignKey
ALTER TABLE "public"."Player" ADD CONSTRAINT "Player_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "public"."Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CardNote" ADD CONSTRAINT "CardNote_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "public"."Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CardNote" ADD CONSTRAINT "CardNote_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "public"."Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Theory" ADD CONSTRAINT "Theory_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "public"."Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
