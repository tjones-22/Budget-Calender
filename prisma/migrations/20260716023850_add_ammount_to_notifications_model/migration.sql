-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "description" TEXT NOT NULL,
    "amount" INTEGER NOT NULL DEFAULT 0,
    "sendDate" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    "billId" TEXT,
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Notification_billId_fkey" FOREIGN KEY ("billId") REFERENCES "Bills" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Notification" ("billId", "description", "id", "sendDate", "userId") SELECT "billId", "description", "id", "sendDate", "userId" FROM "Notification";
DROP TABLE "Notification";
ALTER TABLE "new_Notification" RENAME TO "Notification";
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");
CREATE INDEX "Notification_billId_idx" ON "Notification"("billId");
CREATE INDEX "Notification_sendDate_idx" ON "Notification"("sendDate");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
