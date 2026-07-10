/*
  Warnings:

  - Added the required column `name` to the `Bills` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Bills" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Bills_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Bills" ("date", "id", "type", "userId") SELECT "date", "id", "type", "userId" FROM "Bills";
DROP TABLE "Bills";
ALTER TABLE "new_Bills" RENAME TO "Bills";
CREATE INDEX "Bills_userId_idx" ON "Bills"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
