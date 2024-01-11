/*
  Warnings:

  - A unique constraint covering the columns `[s3Key]` on the table `Version` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `s3Key` to the `Version` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Version" ADD COLUMN     "s3Key" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Version_s3Key_key" ON "Version"("s3Key");
