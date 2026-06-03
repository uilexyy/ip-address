-- DropForeignKey
ALTER TABLE "history" DROP CONSTRAINT "history_ip_address_id_fkey";

-- AddForeignKey
ALTER TABLE "history" ADD CONSTRAINT "history_ip_address_id_fkey" FOREIGN KEY ("ip_address_id") REFERENCES "ip_address"("id") ON DELETE CASCADE ON UPDATE CASCADE;
