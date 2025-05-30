/*
  Warnings:

  - You are about to drop the column `Indicacao` on the `remedios` table. All the data in the column will be lost.
  - Added the required column `indicacao` to the `Remedios` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `remedios` DROP COLUMN `Indicacao`,
    ADD COLUMN `indicacao` VARCHAR(191) NOT NULL;
