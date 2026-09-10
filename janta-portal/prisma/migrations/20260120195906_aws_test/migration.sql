/*
  Warnings:

  - You are about to drop the column `address` on the `customers` table. All the data in the column will be lost.
  - You are about to drop the column `first_name` on the `customers` table. All the data in the column will be lost.
  - You are about to drop the column `last_name` on the `customers` table. All the data in the column will be lost.
  - Added the required column `address_id` to the `customers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `country_code` to the `customers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customer_type` to the `customers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `customers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "customers" DROP COLUMN "address",
DROP COLUMN "first_name",
DROP COLUMN "last_name",
ADD COLUMN     "address_id" INTEGER NOT NULL,
ADD COLUMN     "country_code" INTEGER NOT NULL,
ADD COLUMN     "customer_type" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ALTER COLUMN "phone_number" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "settings" ALTER COLUMN "last_login_device" SET DEFAULT 'N/A';

-- CreateTable
CREATE TABLE "systems" (
    "id" SERIAL NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "inverter_type" TEXT NOT NULL DEFAULT 'Fronius',
    "system_name" TEXT NOT NULL DEFAULT 'System',
    "timezone" TEXT NOT NULL DEFAULT 'America/Chicago',
    "max_pv_kw" INTEGER,
    "api_key" TEXT,

    CONSTRAINT "systems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "towers" (
    "id" SERIAL NOT NULL,
    "model" INTEGER NOT NULL DEFAULT 0,
    "current_angle" DECIMAL(5,2) NOT NULL,
    "latitude" DECIMAL(65,30) NOT NULL,
    "longitude" DECIMAL(65,30) NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "order_id" INTEGER NOT NULL,
    "state" INTEGER NOT NULL,
    "software_version" TEXT NOT NULL,

    CONSTRAINT "towers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "telemetry" (
    "id" SERIAL NOT NULL,
    "date_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tower_id" INTEGER NOT NULL,
    "humidity" DOUBLE PRECISION NOT NULL,
    "temperature" DOUBLE PRECISION NOT NULL,
    "pressure" DOUBLE PRECISION NOT NULL DEFAULT 335.75,
    "status" INTEGER NOT NULL,
    "power_output" INTEGER NOT NULL,
    "clouds" BOOLEAN NOT NULL DEFAULT false,
    "solar_flux" INTEGER NOT NULL,
    "angle" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "telemetry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "systems_customer_id_key" ON "systems"("customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "towers_customer_id_key" ON "towers"("customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "towers_order_id_key" ON "towers"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "telemetry_tower_id_key" ON "telemetry"("tower_id");

-- AddForeignKey
ALTER TABLE "systems" ADD CONSTRAINT "systems_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "towers" ADD CONSTRAINT "towers_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "telemetry" ADD CONSTRAINT "telemetry_tower_id_fkey" FOREIGN KEY ("tower_id") REFERENCES "towers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
