-- AlterTable
ALTER TABLE "admins" ADD COLUMN     "resetPasswordExpires" TIMESTAMP(3),
ADD COLUMN     "resetPasswordToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "admins_resetPasswordToken_key" ON "admins"("resetPasswordToken");
