-- CreateTable
CREATE TABLE "forms" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "discordTag" TEXT NOT NULL,
    "discordId" TEXT NOT NULL,
    "gameTag" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "competitive" BOOLEAN NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "guild" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "formsChannel" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "forms_discordTag_key" ON "forms"("discordTag");

-- CreateIndex
CREATE UNIQUE INDEX "forms_discordId_key" ON "forms"("discordId");

-- CreateIndex
CREATE UNIQUE INDEX "forms_gameId_key" ON "forms"("gameId");

-- CreateIndex
CREATE UNIQUE INDEX "guild_id_key" ON "guild"("id");
