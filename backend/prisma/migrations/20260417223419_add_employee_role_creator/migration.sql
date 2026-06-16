-- AlterTable
ALTER TABLE `ticket` ADD COLUMN `comment` TEXT NULL,
    ADD COLUMN `creatorId` INTEGER NULL;

-- AlterTable
ALTER TABLE `user` MODIFY `role` VARCHAR(191) NOT NULL DEFAULT 'EMPLOYEE';

-- AddForeignKey
ALTER TABLE `Ticket` ADD CONSTRAINT `Ticket_creatorId_fkey` FOREIGN KEY (`creatorId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
