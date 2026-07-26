-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_Bills" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "date" DATETIME NOT NULL,
    "applied" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Bills_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "new_Bills" ("amount", "applied", "date", "id", "name", "type", "userId")
SELECT "amount", "applied", "date", "id", "name", "type", "userId" FROM "Bills";

DROP TABLE "Bills";
ALTER TABLE "new_Bills" RENAME TO "Bills";
CREATE INDEX "Bills_userId_idx" ON "Bills"("userId");

CREATE TABLE "new_Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "description" TEXT NOT NULL,
    "amount" REAL NOT NULL DEFAULT 0,
    "sendDate" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    "billId" TEXT,
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Notification_billId_fkey" FOREIGN KEY ("billId") REFERENCES "Bills" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "new_Notification" ("amount", "billId", "description", "id", "sendDate", "userId")
SELECT "amount", "billId", "description", "id", "sendDate", "userId" FROM "Notification";

DROP TABLE "Notification";
ALTER TABLE "new_Notification" RENAME TO "Notification";
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");
CREATE INDEX "Notification_billId_idx" ON "Notification"("billId");
CREATE INDEX "Notification_sendDate_idx" ON "Notification"("sendDate");

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
