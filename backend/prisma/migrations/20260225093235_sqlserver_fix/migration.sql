/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `Doctor` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `Patient` will be added. If there are existing duplicate values, this will fail.

*/
BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[Appointment] DROP CONSTRAINT [Appointment_doctorId_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[Appointment] DROP CONSTRAINT [Appointment_patientId_fkey];

-- AlterTable
ALTER TABLE [dbo].[Appointment] ADD [deletedAt] DATETIME2,
[duration] INT NOT NULL CONSTRAINT [Appointment_duration_df] DEFAULT 30;

-- AlterTable
ALTER TABLE [dbo].[Doctor] ADD [deletedAt] DATETIME2,
[userId] INT;

-- AlterTable
ALTER TABLE [dbo].[Patient] ADD [deletedAt] DATETIME2,
[userId] INT;

-- AlterTable
ALTER TABLE [dbo].[User] DROP CONSTRAINT [User_role_df];
ALTER TABLE [dbo].[User] ADD CONSTRAINT [User_role_df] DEFAULT 'RECEPTIONIST' FOR [role];
ALTER TABLE [dbo].[User] ADD [deletedAt] DATETIME2;

-- CreateIndex
ALTER TABLE [dbo].[Doctor] ADD CONSTRAINT [Doctor_userId_key] UNIQUE NONCLUSTERED ([userId]);

-- CreateIndex
ALTER TABLE [dbo].[Patient] ADD CONSTRAINT [Patient_userId_key] UNIQUE NONCLUSTERED ([userId]);

-- AddForeignKey
ALTER TABLE [dbo].[Patient] ADD CONSTRAINT [Patient_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Doctor] ADD CONSTRAINT [Doctor_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Appointment] ADD CONSTRAINT [Appointment_patientId_fkey] FOREIGN KEY ([patientId]) REFERENCES [dbo].[Patient]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Appointment] ADD CONSTRAINT [Appointment_doctorId_fkey] FOREIGN KEY ([doctorId]) REFERENCES [dbo].[Doctor]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
