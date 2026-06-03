-- CreateEnum
CREATE TYPE "IpStatus" AS ENUM ('AKTIF', 'NONAKTIF', 'MAINTENANCE');

-- CreateTable
CREATE TABLE "lantai" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lantai_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departemen" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "lantai_id" TEXT NOT NULL,

    CONSTRAINT "departemen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ip_address" (
    "id" TEXT NOT NULL,
    "ip_address" TEXT NOT NULL,
    "hostname" TEXT NOT NULL,
    "mac_address" TEXT,
    "sub_departemen" TEXT,
    "tipe" TEXT NOT NULL,
    "pic" TEXT NOT NULL DEFAULT '',
    "status" "IpStatus" NOT NULL DEFAULT 'AKTIF',
    "keterangan" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "lantai_id" TEXT NOT NULL,
    "departemen_id" TEXT NOT NULL,

    CONSTRAINT "ip_address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "history" (
    "id" TEXT NOT NULL,
    "aksi" TEXT NOT NULL,
    "detail" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip_address_id" TEXT NOT NULL,

    CONSTRAINT "history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "lantai_nama_key" ON "lantai"("nama");

-- CreateIndex
CREATE UNIQUE INDEX "departemen_nama_key" ON "departemen"("nama");

-- CreateIndex
CREATE UNIQUE INDEX "ip_address_ip_address_key" ON "ip_address"("ip_address");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "departemen" ADD CONSTRAINT "departemen_lantai_id_fkey" FOREIGN KEY ("lantai_id") REFERENCES "lantai"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ip_address" ADD CONSTRAINT "ip_address_lantai_id_fkey" FOREIGN KEY ("lantai_id") REFERENCES "lantai"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ip_address" ADD CONSTRAINT "ip_address_departemen_id_fkey" FOREIGN KEY ("departemen_id") REFERENCES "departemen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "history" ADD CONSTRAINT "history_ip_address_id_fkey" FOREIGN KEY ("ip_address_id") REFERENCES "ip_address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
