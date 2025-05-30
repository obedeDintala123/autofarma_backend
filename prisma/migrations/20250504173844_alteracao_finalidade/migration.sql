/*
  Warnings:

  - Added the required column `escola` to the `Administrador` table without a default value. This is not possible if the table is not empty.
  - Added the required column `escola` to the `Aluno` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `administrador` ADD COLUMN `escola` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `aluno` ADD COLUMN `escola` VARCHAR(191) NOT NULL;
