/*
  Warnings:

  - A unique constraint covering the columns `[nome]` on the table `Escola` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `aluno` MODIFY `id_card` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Escola_nome_key` ON `Escola`(`nome`);
