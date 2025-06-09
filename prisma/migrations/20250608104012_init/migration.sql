/*
  Warnings:

  - Added the required column `slot` to the `transacao` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `transacao` DROP FOREIGN KEY `Transacao_alunoId_fkey`;

-- DropForeignKey
ALTER TABLE `transacao` DROP FOREIGN KEY `Transacao_remedioId_fkey`;

-- AlterTable
ALTER TABLE `transacao` ADD COLUMN `slot` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `transacao` ADD CONSTRAINT `transacao_alunoId_fkey` FOREIGN KEY (`alunoId`) REFERENCES `aluno`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transacao` ADD CONSTRAINT `transacao_remedioId_fkey` FOREIGN KEY (`remedioId`) REFERENCES `remedio`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- RedefineIndex
CREATE INDEX `transacao_alunoId_idx` ON `transacao`(`alunoId`);

-- RedefineIndex
CREATE INDEX `transacao_remedioId_idx` ON `transacao`(`remedioId`);
