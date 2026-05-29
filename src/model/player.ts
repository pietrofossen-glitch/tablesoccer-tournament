import { defaultRating } from "~/utils/elo";
import { PlayerWithMeta } from "~/server/model/player";

export function getDefaultPlayerMeta(season: number) {
  return {
    id: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    season,
    rating: defaultRating,
    totalMatches: 0,
    totalWins: 0,
    totalLosses: 0,
    totalScore: 0,
    totalAvgScore: 0,
    totalWinRate: 0,
    totalHighestRating: defaultRating,
    totalLowestRating: defaultRating,
    totalHighestWinStreak: 0,
    totalHighestLosingStreak: 0,
    dailyMatches: 0,
    dailyWins: 0,
    dailyLosses: 0,
    dailyScore: 0,
    dailyAvgScore: 0,
    dailyWinRate: 0,
    currentLosingStreak: 0,
    currentWinStreak: 0,
  };
}

export function getPlayerSeasonMeta(player: PlayerWithMeta, season: number) {
  return (
    player.meta.find(m => m.season === season) || getDefaultPlayerMeta(season)
  );
}

export function normalizePlayerName(name: string) {
  return name.toLowerCase().trim();
}

export function parsePlayers(teamName: string) {
  return teamName
    .split(",")
    .map(normalizePlayerName)
    .filter(Boolean);
}

export function averageRating(ratings: number[]) {
  if (ratings.length === 0) {
    return defaultRating;
  }
  return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
}
