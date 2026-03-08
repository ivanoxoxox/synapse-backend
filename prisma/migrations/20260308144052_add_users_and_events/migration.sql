-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "venue" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Upcoming',
    "bannerColor" TEXT NOT NULL DEFAULT '#38bdf8',
    "capacityGeneral" INTEGER NOT NULL DEFAULT 100,
    "capacityVIP" INTEGER NOT NULL DEFAULT 20,
    "capacityStudent" INTEGER NOT NULL DEFAULT 50,
    "priceGeneral" REAL NOT NULL DEFAULT 1500,
    "priceVIP" REAL NOT NULL DEFAULT 3500,
    "priceStudent" REAL NOT NULL DEFAULT 750,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Registration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "org" TEXT,
    "designation" TEXT,
    "session" TEXT,
    "dietary" TEXT,
    "notes" TEXT,
    "studentId" TEXT,
    "type" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Registered',
    "registeredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checkedInAt" DATETIME,
    "userId" TEXT,
    "eventId" TEXT,
    CONSTRAINT "Registration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Registration_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Registration" ("checkedInAt", "designation", "dietary", "email", "firstName", "fullName", "id", "lastName", "notes", "org", "phone", "price", "registeredAt", "session", "status", "studentId", "type") SELECT "checkedInAt", "designation", "dietary", "email", "firstName", "fullName", "id", "lastName", "notes", "org", "phone", "price", "registeredAt", "session", "status", "studentId", "type" FROM "Registration";
DROP TABLE "Registration";
ALTER TABLE "new_Registration" RENAME TO "Registration";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
