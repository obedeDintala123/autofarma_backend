/*
  Warnings:

  - You are about to drop the column `categoria` on the `remedio` table. All the data in the column will be lost.
  - You are about to drop the `administrador` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `escolaId` to the `Aluno` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantidade` to the `Remedio` table without a default value. This is not possible if the table is not empty.
  - Added the required column `validade` to the `Remedio` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `aluno` ADD COLUMN `escolaId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `remedio` DROP COLUMN `categoria`,
    ADD COLUMN `quantidade` INTEGER NOT NULL,
    ADD COLUMN `validade` DATETIME(3) NOT NULL;

-- DropTable
DROP TABLE `administrador`;

-- CreateTable
CREATE TABLE `Escola` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `senha` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Transaction` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `hora` DATETIME(3) NOT NULL,
    `quantidade` INTEGER NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `alunoId` INTEGER NOT NULL,
    `remedioId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Aluno` ADD CONSTRAINT `Aluno_escolaId_fkey` FOREIGN KEY (`escolaId`) REFERENCES `Escola`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_alunoId_fkey` FOREIGN KEY (`alunoId`) REFERENCES `Aluno`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_remedioId_fkey` FOREIGN KEY (`remedioId`) REFERENCES `Remedio`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
