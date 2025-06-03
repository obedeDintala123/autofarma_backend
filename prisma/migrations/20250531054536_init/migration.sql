/*
  Warnings:

  - You are about to drop the `transaction` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `transaction` DROP FOREIGN KEY `Transaction_alunoId_fkey`;

-- DropForeignKey
ALTER TABLE `transaction` DROP FOREIGN KEY `Transaction_remedioId_fkey`;

-- DropTable
DROP TABLE `transaction`;

-- CreateTable
CREATE TABLE `Transacao` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `hora` DATETIME(3) NOT NULL,
    `quantidade` INTEGER NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `alunoId` INTEGER NOT NULL,
    `remedioId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Transacao` ADD CONSTRAINT `Transacao_alunoId_fkey` FOREIGN KEY (`alunoId`) REFERENCES `Aluno`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transacao` ADD CONSTRAINT `Transacao_remedioId_fkey` FOREIGN KEY (`remedioId`) REFERENCES `Remedio`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
