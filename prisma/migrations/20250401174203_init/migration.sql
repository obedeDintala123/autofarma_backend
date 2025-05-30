/*
  Warnings:

  - You are about to drop the column `sala` on the `alunos` table. All the data in the column will be lost.
  - You are about to drop the column `turno` on the `alunos` table. All the data in the column will be lost.
  - You are about to drop the column `categoria` on the `remedios` table. All the data in the column will be lost.
  - You are about to drop the column `indicacao` on the `remedios` table. All the data in the column will be lost.
  - Added the required column `classroom` to the `Alunos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `Alunos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shift` to the `Alunos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `category` to the `Remedios` table without a default value. This is not possible if the table is not empty.
  - Added the required column `indication` to the `Remedios` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `alunos` DROP COLUMN `sala`,
    DROP COLUMN `turno`,
    ADD COLUMN `classroom` DECIMAL(65, 30) NOT NULL,
    ADD COLUMN `phone` DECIMAL(65, 30) NOT NULL,
    ADD COLUMN `shift` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `remedios` DROP COLUMN `categoria`,
    DROP COLUMN `indicacao`,
    ADD COLUMN `category` VARCHAR(191) NOT NULL,
    ADD COLUMN `indication` VARCHAR(191) NOT NULL;
