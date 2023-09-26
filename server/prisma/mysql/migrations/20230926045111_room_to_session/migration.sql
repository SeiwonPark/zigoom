/*
  Warnings:

  - You are about to drop the column `videoRoomId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `VideoRoom` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `User` DROP FOREIGN KEY `User_videoRoomId_fkey`;

-- AlterTable
ALTER TABLE `User` DROP COLUMN `videoRoomId`,
    ADD COLUMN `sessionId` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `VideoRoom`;

-- CreateTable
CREATE TABLE `Session` (
    `id` VARCHAR(191) NOT NULL,
    `private` BOOLEAN NOT NULL DEFAULT false,
    `host` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `modifiedAt` DATETIME(3) NOT NULL,
    `endedAt` DATETIME(3) NULL,

    UNIQUE INDEX `Session_id_key`(`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_sessionId_fkey` FOREIGN KEY (`sessionId`) REFERENCES `Session`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
