-- CreateTable
CREATE TABLE "processed_events" (
    "id" SERIAL NOT NULL,
    "eventId" INTEGER NOT NULL,
    "consumer" TEXT NOT NULL,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "processed_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "processed_events_eventId_key" ON "processed_events"("eventId");
