-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "network" TEXT NOT NULL DEFAULT 'Testnet',
    "rating" INTEGER NOT NULL,
    "likedMost" TEXT NOT NULL,
    "missingFeature" TEXT NOT NULL,
    "issues" TEXT NOT NULL,
    "recommend" TEXT NOT NULL,
    "improvements" TEXT NOT NULL,
    "merchantId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);
