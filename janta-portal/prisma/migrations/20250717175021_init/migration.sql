/*
  Warnings:

  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "users";

-- CreateTable
CREATE TABLE "customers" (
    "id" SERIAL NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "address" TEXT,
    "phone_number" INTEGER,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settings" (
    "settings_id" SERIAL NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "theme" TEXT NOT NULL DEFAULT 'Light',
    "time_zone" TEXT NOT NULL DEFAULT 'Central Time (CT)',
    "text_size" TEXT NOT NULL DEFAULT 'Medium',
    "bold_text" BOOLEAN NOT NULL DEFAULT false,
    "update_frequency" TEXT NOT NULL DEFAULT '15 minutes',
    "region" TEXT NOT NULL DEFAULT 'North America',
    "language" TEXT NOT NULL DEFAULT 'en',
    "twentyfourhourtime" BOOLEAN NOT NULL DEFAULT false,
    "last_login_device" TEXT NOT NULL DEFAULT ' ',
    "last_login" TIMESTAMP(3),
    "email_recovery" TEXT,
    "phone_recovery" TEXT,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("settings_id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "notifications_id" SERIAL NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "push_notifications_enabled" BOOLEAN NOT NULL DEFAULT false,
    "push_notify_login" BOOLEAN NOT NULL DEFAULT false,
    "notification_tone" TEXT NOT NULL DEFAULT 'Chime',
    "email_marketing" BOOLEAN NOT NULL DEFAULT false,
    "email_account_activity" BOOLEAN NOT NULL DEFAULT false,
    "email_newsletter" BOOLEAN NOT NULL DEFAULT false,
    "sms_password_changes" BOOLEAN NOT NULL DEFAULT false,
    "sms_login_attempts" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("notifications_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "customers_email_key" ON "customers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "customers_phone_number_key" ON "customers"("phone_number");

-- CreateIndex
CREATE UNIQUE INDEX "settings_customer_id_key" ON "settings"("customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "notifications_customer_id_key" ON "notifications"("customer_id");

-- AddForeignKey
ALTER TABLE "settings" ADD CONSTRAINT "settings_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
