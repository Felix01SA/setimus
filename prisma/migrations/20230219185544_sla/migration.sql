-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lastInteraction" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_forms" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "discordTag" TEXT NOT NULL,
    "discordId" TEXT,
    "gameTag" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "competitive" BOOLEAN NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_forms" ("competitive", "createdAt", "discordId", "discordTag", "gameId", "gameTag", "id", "name", "phoneNumber", "updatedAt") SELECT "competitive", "createdAt", "discordId", "discordTag", "gameId", "gameTag", "id", "name", "phoneNumber", "updatedAt" FROM "forms";
DROP TABLE "forms";
ALTER TABLE "new_forms" RENAME TO "forms";
CREATE UNIQUE INDEX "forms_discordTag_key" ON "forms"("discordTag");
CREATE UNIQUE INDEX "forms_discordId_key" ON "forms"("discordId");
CREATE UNIQUE INDEX "forms_gameId_key" ON "forms"("gameId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "user_id_key" ON "user"("id");
