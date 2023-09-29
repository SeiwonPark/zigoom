/*
  Warnings:

  - You are about to drop the column `private` on the `Session` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Session` DROP COLUMN `private`,
    ADD COLUMN `isPrivate` BOOLEAN NOT NULL DEFAULT false;
