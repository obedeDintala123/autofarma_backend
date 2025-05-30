/*
  Warnings:

  - You are about to drop the column `escola` on the `administrador` table. All the data in the column will be lost.
  - You are about to drop the column `escola` on the `aluno` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `administrador` DROP COLUMN `escola`;

-- AlterTable
ALTER TABLE `aluno` DROP COLUMN `escola`;
