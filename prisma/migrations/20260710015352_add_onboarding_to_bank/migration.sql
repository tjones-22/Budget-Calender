/*
  Warnings:

  - You are about to drop the `VerificationToken` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `emailVerified` on the `User` table. All the data in the column will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "VerificationToken";
PRAGMA foreign_keys=on;

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
INSERT INTO "new_Bank" ("currentBalance", "id", "lastUpdated", "savings", "userId") SELECT "currentBalance", "id", "lastUpdated", "savings", "userId" FROM "Bank";
DROP TABLE "Bank";
ALTER TABLE "new_Bank" RENAME TO "Bank";
CREATE UNIQUE INDEX "Bank_userId_key" ON "Bank"("userId");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT,
    "image" TEXT,
    "username" TEXT,
    "password" TEXT
);
INSERT INTO "new_User" ("email", "id", "image", "name", "password", "username") SELECT "email", "id", "image", "name", "password", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
