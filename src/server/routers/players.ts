import { publicProcedure, router } from "~/server/trpc";
import { z } from "zod";
import { prisma } from "~/server/prisma";
import { createPlayerMeta } from "~/server/model/player";

export const playersRouter = router({
  list: publicProcedure.query(async () => {
    return await prisma.player.findMany({
      include: {
        meta: true,
      },
    });
  }),

  byId: publicProcedure
    .input(
      z.object({
        name: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const player = await prisma.player.findUnique({
        include: {
          meta: true,
        },
        where: {
          name: input.name.toLowerCase().trim(),
        },
      });

      if (!player) {
        return null;
      }

      if (player.meta.length === 0) {
        player.meta = [await createPlayerMeta(player)];
      }

      return player;
    }),

  matches: publicProcedure
    .input(
      z.object({
        name: z.string(),
        season: z.number().optional(),
        limit: z.number().min(0).max(500).default(0),
      }),
    )
    .query(async ({ input }) => {
      const player = await prisma.player.findUnique({
        where: {
          name: input.name.toLowerCase().trim(),
        },
      });

      if (!player) {
        return [];
      }

      const matchPlayers = await prisma.matchPlayer.findMany({
        where: {
          playerId: player.id,
          season: input.season ? input.season : 1,
        },
        include: {
          match: true,
          player: true,
        },
        orderBy: {
          match: {
            createdAt: "asc",
          },
        },
        take: input.limit > 0 ? input.limit : undefined,
      });

      return matchPlayers;
    }),
});
