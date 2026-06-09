-- CreateTable
CREATE TABLE "public"."SuggestionCheck" (
    "id" TEXT NOT NULL,
    "suggestionId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "responded" BOOLEAN NOT NULL,

    CONSTRAINT "SuggestionCheck_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."SuggestionCheck" ADD CONSTRAINT "SuggestionCheck_suggestionId_fkey" FOREIGN KEY ("suggestionId") REFERENCES "public"."Suggestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
