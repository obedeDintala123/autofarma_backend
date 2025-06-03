/*
  Warnings:

  - You are about to drop the column `escolaId` on the `aluno` table. All the data in the column will be lost.
  - You are about to drop the column `id_card` on the `aluno` table. All the data in the column will be lost.
  - You are about to drop the `escola` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `aluno` DROP FOREIGN KEY `Aluno_escolaId_fkey`;

-- DropIndex
DROP INDEX `Aluno_escolaId_fkey` ON `aluno`;

-- AlterTable
ALTER TABLE `aluno` DROP COLUMN `escolaId`,
    DROP COLUMN `id_card`;

-- DropTable
DROP TABLE `escola`;

-- CreateTable
CREATE TABLE `Administrador` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `senha` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
