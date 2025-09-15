-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('SingleFamily', 'Condo', 'Townhouse', 'MultiFamily', 'Land');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('New', 'Contacted', 'Showing', 'UnderContract', 'Closed', 'Lost');

-- CreateEnum
CREATE TYPE "LeadTimeline" AS ENUM ('ASAP', 'OneThreeMonths', 'ThreeSixMonths', 'SixPlusMonths');

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "city" TEXT NOT NULL,
    "propertyType" "PropertyType" NOT NULL,
    "status" "LeadStatus" NOT NULL,
    "timeline" "LeadTimeline" NOT NULL,
    "notes" TEXT,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Lead_email_key" ON "Lead"("email");
