-- CreateTable
CREATE TABLE "shop_handoff_consumes" (
    "jti" TEXT NOT NULL PRIMARY KEY,
    "consumed_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
