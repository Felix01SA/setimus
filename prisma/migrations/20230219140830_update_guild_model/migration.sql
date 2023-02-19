-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_guild" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "prefix" TEXT,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "lastInteraction" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "formsChannel" TEXT
);
INSERT INTO "new_guild" ("formsChannel", "id") SELECT "formsChannel", "id" FROM "guild";
DROP TABLE "guild";
ALTER TABLE "new_guild" RENAME TO "guild";
CREATE UNIQUE INDEX "guild_id_key" ON "guild"("id");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
