-- AlterTable
ALTER TABLE "rides" ADD COLUMN     "fare" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "otpCode" TEXT,
ADD COLUMN     "otpExpiresAt" TIMESTAMP(3),
ADD COLUMN     "otpVerifiedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "goldBalance" DECIMAL(12,2) NOT NULL DEFAULT 0;
