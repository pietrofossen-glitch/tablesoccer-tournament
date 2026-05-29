import { prisma } from "~/server/prisma";
import { Match, MatchPlayer, Player, PlayerMeta, Prisma } from "@prisma/client";
import {
  averageRating,
  getDefaultPlayerMeta,
  getPlayerSeasonMeta,
  parsePlayers,
} from "~/model/player";
import { calculateRating, defaultRating, getExpectedRating } from "~/utils/elo";
import { format } from "date-fns";
import { getCurrentSeason } from "~/server/model/season";

export const playerWithMeta = Prisma.validator<Prisma.PlayerArgs>()({
  include: {
    meta: true,
  },
});

export type PlayerWithMeta = Prisma.PlayerGetPayload<typeof playerWithMeta>;

export async function getOrCreatePlayer(name: string) {
  const currentSeason = await getCurrentSeason();
  return await prisma.player.upsert({
    where: {
      name,
    },
    include: {
      meta: true,
    },
    update: {},
    create: {
      name,
      createdAt: new Date(),
      meta: {
        create: {
          ...getDefaultPlayerMeta(currentSeason),
          season: currentSeason,
        },
      },
    },
  });
}

export async function getOrCreatePlayers(teamName: string) {
  const players = parsePlayers(teamName);
  return Promise.all(players.map(player => getOrCreatePlayer(player)));
}

export async function createPlayerMeta(
  player: Player,
  season: number | null = null,
) {
  if (!season) {
    season = await getCurrentSeason();
  }
  const { id, ...defaultMeta } = getDefaultPlayerMeta(season);
  return prisma.playerMeta.upsert({
    where: {
      season_playerId: {
        season,
        playerId: player.id,
      },
    },
    update: {},
    create: {
      ...defaultMeta,
      season,
      player: {
        connect: {
          id: player.id,
        },
      },
    },
  });
}

export async function addMatchToPlayer(
  player: PlayerWithMeta,
  opponentTeamAvgRating: number,
  win: boolean,
  score: number,
  date: Date,
  season: number | null = null,
) {
  if (!season) {
    season = await getCurrentSeason();
  }

  let playerSeasonMeta = getPlayerSeasonMeta(player, season);
  if (playerSeasonMeta.id === 0) {
    await createPlayerMeta(player, season);
    const refreshed = await prisma.player.findUnique({
      include: { meta: true },
      where: { id: player.id },
    });
    if (refreshed) {
      player.meta = refreshed.meta;
      playerSeasonMeta = getPlayerSeasonMeta(player, season);
    }
  }

  const currentRating = playerSeasonMeta.rating;
  const newDaily =
    !playerSeasonMeta.updatedAt ||
    format(date, "yyyy-MM-dd") >
      format(new Date(playerSeasonMeta.updatedAt), "yyyy-MM-dd");

  const expectedRating = getExpectedRating(currentRating, opponentTeamAvgRating);
  const rating = calculateRating(expectedRating, win ? 1 : 0, currentRating);

  const meta = {
    updatedAt: date,
    rating,
    totalMatches: playerSeasonMeta.totalMatches + 1,
    totalWins: playerSeasonMeta.totalWins + (win ? 1 : 0),
    totalWinRate:
      (playerSeasonMeta.totalWins + (win ? 1 : 0)) /
      (playerSeasonMeta.totalMatches + 1),
    totalHighestWinStreak: win
      ? Math.max(
          playerSeasonMeta.totalHighestWinStreak,
          playerSeasonMeta.currentWinStreak + 1,
        )
      : playerSeasonMeta.totalHighestWinStreak,
    totalLosses: playerSeasonMeta.totalLosses + (win ? 0 : 1),
    totalHighestLosingStreak: !win
      ? Math.max(
          playerSeasonMeta.totalHighestLosingStreak,
          playerSeasonMeta.currentLosingStreak + 1,
        )
      : playerSeasonMeta.totalHighestLosingStreak,
    totalScore: playerSeasonMeta.totalScore + score,
    totalAvgScore:
      (playerSeasonMeta.totalScore + score) /
      (playerSeasonMeta.totalMatches + 1),
    totalHighestRating: Math.max(playerSeasonMeta.totalHighestRating, rating),
    totalLowestRating: Math.min(playerSeasonMeta.totalLowestRating, rating),
    ...(newDaily
      ? {
          dailyMatches: 1,
          dailyWins: win ? 1 : 0,
          dailyWinRate: win ? 1 : 0,
          dailyLosses: win ? 0 : 1,
          dailyScore: score,
          dailyAvgScore: score,
        }
      : {
          dailyMatches: playerSeasonMeta.dailyMatches + 1,
          dailyWins: playerSeasonMeta.dailyWins + (win ? 1 : 0),
          dailyWinRate:
            (playerSeasonMeta.dailyWins + (win ? 1 : 0)) /
            (playerSeasonMeta.dailyMatches + 1),
          dailyLosses: playerSeasonMeta.dailyLosses + (win ? 0 : 1),
          dailyScore: playerSeasonMeta.dailyScore + score,
          dailyAvgScore:
            (playerSeasonMeta.dailyScore + score) /
            (playerSeasonMeta.dailyMatches + 1),
        }),
    currentWinStreak: win ? playerSeasonMeta.currentWinStreak + 1 : 0,
    currentLosingStreak: !win ? playerSeasonMeta.currentLosingStreak + 1 : 0,
  };

  const updatedMeta = await prisma.playerMeta.upsert({
    create: {
      ...meta,
      playerId: player.id,
      season,
    },
    update: {
      ...meta,
    },
    where: {
      season_playerId: {
        season,
        playerId: player.id,
      },
    },
  });

  if (player.meta.find(m => m.id === updatedMeta.id)) {
    player.meta = player.meta.map(m =>
      m.id === updatedMeta.id ? updatedMeta : m,
    );
  } else {
    player.meta.push(updatedMeta);
  }

  return {
    player,
    ratingBefore: currentRating,
    ratingAfter: rating,
    ratingChange: rating - currentRating,
  };
}

export async function updatePlayersForMatch(
  team1Name: string,
  team2Name: string,
  score1: number,
  score2: number,
  date: Date,
  season: number,
  matchId: number,
) {
  const team1Players = await getOrCreatePlayers(team1Name);
  const team2Players = await getOrCreatePlayers(team2Name);
  const team1Won = score1 > score2;

  const team1Ratings = team1Players.map(
    player => getPlayerSeasonMeta(player, season).rating,
  );
  const team2Ratings = team2Players.map(
    player => getPlayerSeasonMeta(player, season).rating,
  );
  const team1Avg = averageRating(team1Ratings);
  const team2Avg = averageRating(team2Ratings);

  const matchPlayers: MatchPlayer[] = [];

  for (const player of team1Players) {
    const result = await addMatchToPlayer(
      player,
      team2Avg,
      team1Won,
      score1,
      date,
      season,
    );
    matchPlayers.push(
      await prisma.matchPlayer.create({
        data: {
          matchId,
          playerId: player.id,
          teamSide: 1,
          season,
          ratingBefore: result.ratingBefore,
          ratingAfter: result.ratingAfter,
          ratingChange: result.ratingChange,
        },
      }),
    );
  }

  for (const player of team2Players) {
    const result = await addMatchToPlayer(
      player,
      team1Avg,
      !team1Won,
      score2,
      date,
      season,
    );
    matchPlayers.push(
      await prisma.matchPlayer.create({
        data: {
          matchId,
          playerId: player.id,
          teamSide: 2,
          season,
          ratingBefore: result.ratingBefore,
          ratingAfter: result.ratingAfter,
          ratingChange: result.ratingChange,
        },
      }),
    );
  }

  return matchPlayers;
}

export async function deleteMatchFromPlayer(
  player: PlayerWithMeta,
  matchPlayer: MatchPlayer,
  match: Match,
) {
  const playerSeasonMeta = getPlayerSeasonMeta(player, matchPlayer.season);
  const matches = playerSeasonMeta.totalMatches - 1;

  if (matches === 0) {
    const { id, ...meta } = getDefaultPlayerMeta(matchPlayer.season);
    return await prisma.playerMeta.update({
      data: {
        ...meta,
      },
      where: {
        id: playerSeasonMeta.id,
      },
    });
  }

  const onTeam1 = matchPlayer.teamSide === 1;
  const win = onTeam1 ? match.score1 > match.score2 : match.score2 > match.score1;
  const score = onTeam1 ? match.score1 : match.score2;

  const data: Partial<PlayerMeta> = {
    updatedAt: new Date(),
    rating: playerSeasonMeta.rating - matchPlayer.ratingChange,
    totalMatches: matches,
    totalWins: playerSeasonMeta.totalWins - (win ? 1 : 0),
    totalHighestRating: Math.max(
      playerSeasonMeta.totalHighestRating,
      playerSeasonMeta.rating - matchPlayer.ratingChange,
    ),
    totalWinRate:
      matches >= 1
        ? (playerSeasonMeta.totalWins - (win ? 1 : 0)) /
          (playerSeasonMeta.totalMatches - 1)
        : 0,
    totalLosses: playerSeasonMeta.totalLosses - (win ? 0 : 1),
    totalScore: playerSeasonMeta.totalScore - score,
    totalAvgScore:
      matches >= 1
        ? (playerSeasonMeta.totalScore - score) /
          (playerSeasonMeta.totalMatches - 1)
        : 0,
  };

  return await prisma.playerMeta.update({
    data,
    where: {
      id: playerSeasonMeta.id,
    },
  });
}

export async function rollbackPlayersForMatch(match: Match) {
  const matchPlayers = await prisma.matchPlayer.findMany({
    where: {
      matchId: match.id,
    },
  });

  for (const matchPlayer of matchPlayers) {
    const player = await prisma.player.findUnique({
      include: {
        meta: true,
      },
      where: {
        id: matchPlayer.playerId,
      },
    });
    if (player) {
      await deleteMatchFromPlayer(player, matchPlayer, match);
    }
  }

  await prisma.matchPlayer.deleteMany({
    where: {
      matchId: match.id,
    },
  });
}

export async function backfillPlayersFromMatches() {
  await prisma.matchPlayer.deleteMany();
  await prisma.playerMeta.deleteMany();
  await prisma.player.deleteMany();

  const matches = await prisma.match.findMany({
    orderBy: {
      createdAt: "asc",
    },
  });

  for (const match of matches) {
    await updatePlayersForMatch(
      match.team1,
      match.team2,
      match.score1,
      match.score2,
      match.createdAt,
      match.season,
      match.id,
    );
  }

  return matches.length;
}
