-- CreateTable
CREATE TABLE `player` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `player_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `player_meta` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `season` INTEGER NOT NULL DEFAULT 1,
    `playerId` INTEGER NOT NULL,
    `rating` DOUBLE NOT NULL DEFAULT 0,
    `totalMatches` INTEGER NOT NULL DEFAULT 0,
    `totalWins` INTEGER NOT NULL DEFAULT 0,
    `totalLosses` INTEGER NOT NULL DEFAULT 0,
    `totalWinRate` DOUBLE NOT NULL DEFAULT 0,
    `totalScore` INTEGER NOT NULL DEFAULT 0,
    `totalAvgScore` DOUBLE NOT NULL DEFAULT 0,
    `totalHighestRating` DOUBLE NOT NULL DEFAULT 0,
    `totalLowestRating` DOUBLE NOT NULL DEFAULT 0,
    `totalHighestWinStreak` INTEGER NOT NULL DEFAULT 0,
    `totalHighestLosingStreak` INTEGER NOT NULL DEFAULT 0,
    `dailyMatches` INTEGER NOT NULL DEFAULT 0,
    `dailyWins` INTEGER NOT NULL DEFAULT 0,
    `dailyLosses` INTEGER NOT NULL DEFAULT 0,
    `dailyWinRate` DOUBLE NOT NULL DEFAULT 0,
    `dailyScore` INTEGER NOT NULL DEFAULT 0,
    `dailyAvgScore` DOUBLE NOT NULL DEFAULT 0,
    `currentWinStreak` INTEGER NOT NULL DEFAULT 0,
    `currentLosingStreak` INTEGER NOT NULL DEFAULT 0,
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `player_meta_playerId_season_idx`(`playerId`, `season`),
    UNIQUE INDEX `player_meta_season_playerId_key`(`season`, `playerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `match_player` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `matchId` INTEGER NOT NULL,
    `playerId` INTEGER NOT NULL,
    `teamSide` INTEGER NOT NULL,
    `season` INTEGER NOT NULL DEFAULT 1,
    `ratingBefore` DOUBLE NOT NULL DEFAULT 0,
    `ratingAfter` DOUBLE NOT NULL DEFAULT 0,
    `ratingChange` DOUBLE NOT NULL DEFAULT 0,

    INDEX `match_player_matchId_playerId_idx`(`matchId`, `playerId`),
    INDEX `match_player_playerId_season_idx`(`playerId`, `season`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
