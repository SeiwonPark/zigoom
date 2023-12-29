/*
  Warnings:

  - You are about to drop the column `family_name` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `given_name` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `google_id` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `User_google_id_key` ON `User`;

-- AlterTable
ALTER TABLE `Profile` DROP COLUMN `family_name`,
    DROP COLUMN `given_name`,
    ADD COLUMN `familyName` VARCHAR(191) NULL,
    ADD COLUMN `givenName` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `User` DROP COLUMN `google_id`;

-- CreateTable
CREATE TABLE `AuthProvider` (
    `id` VARCHAR(191) NOT NULL,
    `provider` VARCHAR(191) NOT NULL,
    `providerId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `AuthProvider_provider_providerId_key`(`provider`, `providerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AuthProvider` ADD CONSTRAINT `AuthProvider_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
