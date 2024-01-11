-- DropForeignKey
ALTER TABLE "Version" DROP CONSTRAINT "Version_approverId_fkey";

-- AlterTable
ALTER TABLE "Version" ALTER COLUMN "approverId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Version" ADD CONSTRAINT "Version_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
