/*
  Warnings:

  - Added the required column `id_card` to the `Aluno` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `aluno` ADD COLUMN `id_card` INTEGER NOT NULL;
