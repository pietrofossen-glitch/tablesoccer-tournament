import { publicProcedure, router } from "~/server/trpc";
import { z } from "zod";
import { prisma } from "~/server/prisma";
import { Leaderboards } from "~/model";
import { PlayerWithMeta } from "~/server/model/player";
import { TeamWithMeta } from "~/server/model/team";

type LeaderboardCategory = "wins" | "score" | "matches" | "winRate" | "rating";

export const leaderboardsRouter = router({
  forSeason: publicProcedure
    .input(
      z.object({
        season: z.number(),
      }),
    )
    .query(async ({ input }) => {
      const matches = await prisma.match.findMany({
        where: {
          season: input.season,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      const leaderboards: Leaderboards = {
        season: input.season,
        totalMatches: {
          total: matches.length,
          perDay: 0,
          days: 0,
        },
        places: [],
        playerPlaces: [],
      };

      if (matches.length === 0) {
        return leaderboards;
      }

      const firstMatch = matches[matches.length - 1];
      const lastMatch = matches[0];
      const days =
        (lastMatch.createdAt.getTime() - firstMatch.createdAt.getTime()) /
        1000 /
        60 /
        60 /
        24;

      leaderboards.totalMatches.perDay = Math.round(matches.length / days);
      leaderboards.totalMatches.days = days;

      const teams = await prisma.team.findMany({
        include: {
          meta: true,
        },
        where: {
          teamsize: {
            gte: 2,
          },
        },
      });

      const players = await prisma.player.findMany({
        include: {
          meta: true,
        },
      });

      leaderboards.places = buildTeamPlaces(teams as TeamWithMeta[], input.season);
      leaderboards.playerPlaces = buildPlayerPlaces(
        players as PlayerWithMeta[],
        input.season,
      );

      return leaderboards;
    }),
});

function buildTeamPlaces(teams: TeamWithMeta[], season: number) {
  return buildEntityPlaces(teams, season).map(entry => ({
    ...entry,
    team: entry.name,
  }));
}

function buildPlayerPlaces(players: PlayerWithMeta[], season: number) {
  return buildEntityPlaces(players, season).map(entry => ({
    ...entry,
    player: entry.name,
  }));
}

function buildEntityPlaces<
  T extends {
    name: string;
    meta: Array<{
      season: number;
      totalWins: number;
      totalScore: number;
      totalMatches: number;
      totalWinRate: number;
      rating: number;
    }>;
  },
>(entities: T[], season: number) {
  const withMeta = entities.filter(entity =>
    entity.meta.some(meta => meta.season === season),
  );

  const categories: Array<{
    category: LeaderboardCategory;
    value: (meta: T["meta"][number]) => number;
    sort: (metaA: T["meta"][number], metaB: T["meta"][number]) => number;
  }> = [
    {
      category: "wins",
      value: meta => meta.totalWins,
      sort: (metaA, metaB) => metaB.totalWins - metaA.totalWins,
    },
    {
      category: "score",
      value: meta => meta.totalScore,
      sort: (metaA, metaB) => metaB.totalScore - metaA.totalScore,
    },
    {
      category: "matches",
      value: meta => meta.totalMatches,
      sort: (metaA, metaB) => metaB.totalMatches - metaA.totalMatches,
    },
    {
      category: "winRate",
      value: meta => meta.totalWinRate,
      sort: (metaA, metaB) => metaB.totalWinRate - metaA.totalWinRate,
    },
    {
      category: "rating",
      value: meta => meta.rating,
      sort: (metaA, metaB) => metaB.rating - metaA.rating,
    },
  ];

  return categories.flatMap(({ category, value, sort }) =>
    [...withMeta]
      .sort((a, b) => {
        const metaA = a.meta.find(meta => meta.season === season);
        const metaB = b.meta.find(meta => meta.season === season);
        if (!metaA || !metaB) {
          return 0;
        }
        return sort(metaA, metaB);
      })
      .slice(0, 3)
      .map((entity, index) => {
        const meta = entity.meta.find(m => m.season === season)!;
        return {
          category,
          name: entity.name,
          value: value(meta),
          place: index + 1,
        };
      }),
  );
}
