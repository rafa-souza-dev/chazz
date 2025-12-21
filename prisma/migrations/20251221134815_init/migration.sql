-- CreateTable
CREATE TABLE "Device" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "external_id" TEXT NOT NULL,
    "cents_per_cycle" INTEGER NOT NULL,
    "seconds_per_cycle" INTEGER NOT NULL,
    "turn_off_at" DATETIME
);

-- CreateIndex
CREATE UNIQUE INDEX "Device_external_id_key" ON "Device"("external_id");
