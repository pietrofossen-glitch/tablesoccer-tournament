-- CreateTable
CREATE TABLE "match" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "team1" TEXT NOT NULL,
    "team2" TEXT NOT NULL,
    "score1" INTEGER NOT NULL,
    "score2" INTEGER NOT NULL,
    "team1RatingChange" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "team2RatingChange" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "team1Rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "team2Rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "comment" TEXT NOT NULL,
    "game" TEXT NOT NULL,
    "teamsize" INTEGER NOT NULL,
    "season" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "teamsize" INTEGER NOT NULL,

    CONSTRAINT "team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_meta" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "season" INTEGER NOT NULL DEFAULT 1,
    "teamId" INTEGER NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "achievementPoints" INTEGER NOT NULL DEFAULT 0,
    "totalMatches" INTEGER NOT NULL DEFAULT 0,
    "totalWins" INTEGER NOT NULL DEFAULT 0,
    "totalLosses" INTEGER NOT NULL DEFAULT 0,
    "totalWinRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalScore" INTEGER NOT NULL DEFAULT 0,
    "totalAvgScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalHighestRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalLowestRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalHighestWinStreak" INTEGER NOT NULL DEFAULT 0,
    "totalHighestLosingStreak" INTEGER NOT NULL DEFAULT 0,
    "dailyMatches" INTEGER NOT NULL DEFAULT 0,
    "dailyWins" INTEGER NOT NULL DEFAULT 0,
    "dailyLosses" INTEGER NOT NULL DEFAULT 0,
    "dailyWinRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "dailyScore" INTEGER NOT NULL DEFAULT 0,
    "dailyAvgScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currentWinStreak" INTEGER NOT NULL DEFAULT 0,
    "currentLosingStreak" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "team_meta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_achievement" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "teamName" TEXT NOT NULL,
    "teamId" INTEGER NOT NULL,
    "achievement" TEXT NOT NULL,
    "season" INTEGER NOT NULL DEFAULT 1,
    "matchId" INTEGER NOT NULL,

    CONSTRAINT "team_achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "season" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "number" INTEGER NOT NULL,
    "current" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "season_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "player" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,

    CONSTRAINT "player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "player_meta" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "season" INTEGER NOT NULL DEFAULT 1,
    "playerId" INTEGER NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalMatches" INTEGER NOT NULL DEFAULT 0,
    "totalWins" INTEGER NOT NULL DEFAULT 0,
    "totalLosses" INTEGER NOT NULL DEFAULT 0,
    "totalWinRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalScore" INTEGER NOT NULL DEFAULT 0,
    "totalAvgScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalHighestRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalLowestRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalHighestWinStreak" INTEGER NOT NULL DEFAULT 0,
    "totalHighestLosingStreak" INTEGER NOT NULL DEFAULT 0,
    "dailyMatches" INTEGER NOT NULL DEFAULT 0,
    "dailyWins" INTEGER NOT NULL DEFAULT 0,
    "dailyLosses" INTEGER NOT NULL DEFAULT 0,
    "dailyWinRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "dailyScore" INTEGER NOT NULL DEFAULT 0,
    "dailyAvgScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currentWinStreak" INTEGER NOT NULL DEFAULT 0,
    "currentLosingStreak" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "player_meta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_player" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "matchId" INTEGER NOT NULL,
    "playerId" INTEGER NOT NULL,
    "teamSide" INTEGER NOT NULL,
    "season" INTEGER NOT NULL DEFAULT 1,
    "ratingBefore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ratingAfter" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ratingChange" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "match_player_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "match_season_idx" ON "match"("season");

-- CreateIndex
CREATE UNIQUE INDEX "team_name_key" ON "team"("name");

-- CreateIndex
CREATE INDEX "team_meta_teamId_season_idx" ON "team_meta"("teamId", "season");

-- CreateIndex
CREATE UNIQUE INDEX "team_meta_season_teamId_key" ON "team_meta"("season", "teamId");

-- CreateIndex
CREATE INDEX "team_achievement_matchId_teamId_idx" ON "team_achievement"("matchId", "teamId");

-- CreateIndex
CREATE UNIQUE INDEX "season_number_key" ON "season"("number");

-- CreateIndex
CREATE INDEX "season_number_idx" ON "season"("number");

-- CreateIndex
CREATE UNIQUE INDEX "player_name_key" ON "player"("name");

-- CreateIndex
CREATE INDEX "player_meta_playerId_season_idx" ON "player_meta"("playerId", "season");

-- CreateIndex
CREATE UNIQUE INDEX "player_meta_season_playerId_key" ON "player_meta"("season", "playerId");

-- CreateIndex
CREATE INDEX "match_player_matchId_playerId_idx" ON "match_player"("matchId", "playerId");

-- CreateIndex
CREATE INDEX "match_player_playerId_season_idx" ON "match_player"("playerId", "season");

-- AddForeignKey
ALTER TABLE "team_meta" ADD CONSTRAINT "team_meta_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_achievement" ADD CONSTRAINT "team_achievement_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_achievement" ADD CONSTRAINT "team_achievement_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_meta" ADD CONSTRAINT "player_meta_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_player" ADD CONSTRAINT "match_player_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_player" ADD CONSTRAINT "match_player_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "player"("id") ON DELETE CASCADE ON UPDATE CASCADE;
