-- CreateTable
CREATE TABLE "RideSession" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "hostId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "RideSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RideSessionParticipant" (
    "id" SERIAL NOT NULL,
    "sessionId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RideSessionParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RideLocation" (
    "id" SERIAL NOT NULL,
    "sessionId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "RideLocation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RideSession_code_key" ON "RideSession"("code");

-- AddForeignKey
ALTER TABLE "RideSession" ADD CONSTRAINT "RideSession_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RideSessionParticipant" ADD CONSTRAINT "RideSessionParticipant_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "RideSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RideSessionParticipant" ADD CONSTRAINT "RideSessionParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RideLocation" ADD CONSTRAINT "RideLocation_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "RideSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RideLocation" ADD CONSTRAINT "RideLocation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
