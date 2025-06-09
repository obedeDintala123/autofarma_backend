/*
  Warnings:

  - You are about to drop the column `uso` on the `remedio` table. All the data in the column will be lost.
  - Added the required column `categoria` to the `remedio` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `remedio` DROP COLUMN `uso`,
    ADD COLUMN `categoria` VARCHAR(191) NOT NULL;
