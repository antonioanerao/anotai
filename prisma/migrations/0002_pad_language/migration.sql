-- CreateEnum
CREATE TYPE "CodeLanguage" AS ENUM ('PYTHON', 'PHP', 'JAVASCRIPT');

-- AlterTable
ALTER TABLE "Pad"
ADD COLUMN "language" "CodeLanguage" NOT NULL DEFAULT 'JAVASCRIPT';
