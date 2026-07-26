/*
  Warnings:

  - You are about to drop the column `applied` on the `Bank` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Bank" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "savings" REAL NOT NULL,
    "currentBalance" REAL NOT NULL,
    "lastUpdated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "onboardingComplete" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Bank_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Bank" ("currentBalance", "id", "lastUpdated", "onboardingComplete", "savings", "userId") SELECT "currentBalance", "id", "lastUpdated", "onboardingComplete", "savings", "userId" FROM "Bank";
DROP TABLE "Bank";
ALTER TABLE "new_Bank" RENAME TO "Bank";
CREATE UNIQUE INDEX "Bank_userId_key" ON "Bank"("userId");
CREATE TABLE "new_Bills" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "date" DATETIME NOT NULL,
    "applied" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Bills_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Bills" ("amount", "date", "id", "name", "type", "userId") SELECT "amount", "date", "id", "name", "type", "userId" FROM "Bills";
DROP TABLE "Bills";
ALTER TABLE "new_Bills" RENAME TO "Bills";
CREATE INDEX "Bills_userId_idx" ON "Bills"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
