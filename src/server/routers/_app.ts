import { router } from "../trpc";
import { matchesRouter } from "~/server/routers/matches";
import { teamsRouter } from "~/server/routers/teams";
import { playersRouter } from "~/server/routers/players";
import { leaderboardsRouter } from "~/server/routers/leaderboards";
import { seasonsRouter } from "~/server/routers/seasons";

export const appRouter = router({
  matches: matchesRouter,
  teams: teamsRouter,
  players: playersRouter,
  leaderboards: leaderboardsRouter,
  seasons: seasonsRouter,
});

export type AppRouter = typeof appRouter;
