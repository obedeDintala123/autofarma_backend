/*
  Warnings:

  - You are about to alter the column `phone` on the `students` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `BigInt`.
  - You are about to alter the column `classroom` on the `students` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Int`.

*/
-- AlterTable
ALTER TABLE `students` MODIFY `phone` BIGINT NOT NULL,
    MODIFY `classroom` INTEGER NOT NULL;
