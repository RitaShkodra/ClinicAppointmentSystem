/*
  Warnings:

  - You are about to drop the column `name` on the `Doctor` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `Doctor` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `firstName` to the `Doctor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `Doctor` table without a default value. This is not possible if the table is not empty.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[Doctor] DROP COLUMN [name];
ALTER TABLE [dbo].[Doctor] ADD [email] NVARCHAR(1000),
[firstName] NVARCHAR(1000) NOT NULL,
[lastName] NVARCHAR(1000) NOT NULL,
[phone] NVARCHAR(1000);

-- CreateIndex
ALTER TABLE [dbo].[Doctor] ADD CONSTRAINT [Doctor_email_key] UNIQUE NONCLUSTERED ([email]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
