/*
  Warnings:

  - A unique constraint covering the columns `[id_card]` on the table `aluno` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `aluno` ALTER COLUMN `id_card` DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX `aluno_id_card_key` ON `aluno`(`id_card`);
