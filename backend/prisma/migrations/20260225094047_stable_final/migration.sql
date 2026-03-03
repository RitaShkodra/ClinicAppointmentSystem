/*
  Warnings:

  - You are about to drop the column `userId` on the `Doctor` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Patient` table. All the data in the column will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[Doctor] DROP CONSTRAINT [Doctor_userId_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[Patient] DROP CONSTRAINT [Patient_userId_fkey];

-- DropIndex
ALTER TABLE [dbo].[Doctor] DROP CONSTRAINT [Doctor_userId_key];

-- DropIndex
ALTER TABLE [dbo].[Patient] DROP CONSTRAINT [Patient_userId_key];

-- AlterTable
ALTER TABLE [dbo].[Doctor] DROP COLUMN [userId];

-- AlterTable
ALTER TABLE [dbo].[Patient] DROP COLUMN [userId];

-- AlterTable
ALTER TABLE [dbo].[User] ADD [doctorId] INT,
[patientId] INT;

-- AddForeignKey
ALTER TABLE [dbo].[User] ADD CONSTRAINT [User_doctorId_fkey] FOREIGN KEY ([doctorId]) REFERENCES [dbo].[Doctor]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[User] ADD CONSTRAINT [User_patientId_fkey] FOREIGN KEY ([patientId]) REFERENCES [dbo].[Patient]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
