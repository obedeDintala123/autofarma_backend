/*
  Warnings:

  - You are about to alter the column `phone` on the `students` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `BigInt`.

*/
-- AlterTable
ALTER TABLE `students` MODIFY `phone` BIGINT NOT NULL;
