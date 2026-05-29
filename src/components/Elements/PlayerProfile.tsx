import { FunctionComponent, useMemo } from "react";
import { Card } from "~/components/Elements/Card";
import { PlayerEloHistory } from "~/components/Elements/PlayerEloHistory";
import { MatchPlayer, Player, PlayerMeta } from "@prisma/client";
import { PlayerWithMeta } from "~/server/model/player";
import { getPlayerSeasonMeta } from "~/model";
import { useStore } from "~/utils/store";

type MatchPlayerWithMatch = MatchPlayer & {
  match: {
    id: number;
    createdAt: Date;
    team1: string;
    team2: string;
    score1: number;
    score2: number;
  };
  player: Player;
};

export const PlayerProfile: FunctionComponent<{
  player: PlayerWithMeta;
  versus?: PlayerWithMeta | null;
  matchPlayers?: MatchPlayerWithMatch[];
  onVersusSelect: (playerName: string) => void;
  versusOptions: Player[];
}> = ({ player, versus, matchPlayers, onVersusSelect, versusOptions }) => {
  const selectedSeason = useStore(state => state.season);
  const meta = getPlayerSeasonMeta(player, selectedSeason);
  const vsMeta = versus ? getPlayerSeasonMeta(versus, selectedSeason) : undefined;

  const versusStats = useMemo((): Partial<PlayerMeta> | null => {
    if (!matchPlayers || !versus) {
      return null;
    }

    const versusMatchIds = new Set(
      matchPlayers
        .filter(mp => mp.playerId === versus.id)
        .map(mp => mp.matchId),
    );
    const headToHead = matchPlayers.filter(
      mp => mp.playerId === player.id && versusMatchIds.has(mp.matchId),
    );

    const wins = headToHead.filter(mp => {
      const onTeam1 = mp.teamSide === 1;
      return onTeam1
        ? mp.match.score1 > mp.match.score2
        : mp.match.score2 > mp.match.score1;
    }).length;

    const score = headToHead.reduce((acc, mp) => {
      return acc + (mp.teamSide === 1 ? mp.match.score1 : mp.match.score2);
    }, 0);

    return {
      totalMatches: headToHead.length,
      totalWins: wins,
      totalWinRate: headToHead.length === 0 ? 0 : wins / headToHead.length,
      totalLosses: headToHead.length - wins,
      totalScore: score,
      totalAvgScore: headToHead.length === 0 ? 0 : score / headToHead.length,
    };
  }, [player, versus, matchPlayers]);

  const stat = (stat: keyof PlayerMeta, float = false) => {
    let value = versus && versusStats ? versusStats[stat] : meta[stat];
    if (!value) {
      return 0;
    }
    if (stat === "totalWinRate") {
      value *= 100;
    }
    if (float) {
      value = +value.toFixed(2);
    }
    if (versus) {
      return <i>{value}</i>;
    }
    return value;
  };

  const chartData = useMemo(() => {
    if (!matchPlayers) {
      return [];
    }
    if (!versus) {
      return matchPlayers.filter(mp => mp.playerId === player.id);
    }
    return matchPlayers.filter(
      mp => mp.playerId === player.id || mp.playerId === versus.id,
    );
  }, [matchPlayers, player.id, versus]);

  if (!meta) {
    return null;
  }

  return (
    <Card>
      <div className="grid grid-cols-6 relative">
        <div className="col-span-6 bg-gray-100 dark:bg-gray-600 flex items-center justify-between rounded-t px-3 sticky top-0 z-50">
          <h2 className="bg-white px-2 font-semibold text-2xl my-5 text-gray-800 rounded-lg block capitalize">
            {player.name}
          </h2>
          <div>
            {versus && "vs."}
            <select
              className="p-2 text-gray-800 bg-gray-300 dark:bg-gray-800 dark:text-gray-400 rounded-lg"
              onChange={e => onVersusSelect(e.target.value)}
              value={versus?.name}
            >
              <option value="">Versus...</option>
              {versusOptions
                .filter(p => p.name !== player.name)
                .map(p => (
                  <option key={p.id} value={p.name}>
                    {p.name}
                  </option>
                ))}
            </select>
          </div>
        </div>
        <div className="col-span-6 border-b dark:border-gray-600 pb-3">
          <div className="grid grid-cols-3 gap-3 p-3">
            <div>
              <h3 className="font-semibold">
                {meta.rating.toFixed(2)}
                <small className="opacity-50 ml-1">
                  {vsMeta?.rating.toFixed(2)}
                </small>
              </h3>
              <p className="text-sm">Current Rating</p>
            </div>
            <div>
              <h3 className="font-semibold">
                {meta.totalHighestRating.toFixed(2)}
                <small className="opacity-50 ml-1">
                  {vsMeta?.totalHighestRating.toFixed(2)}
                </small>
              </h3>
              <p className="text-sm">Highest Rating</p>
            </div>
            <div>
              <h3 className="font-semibold">
                {meta.totalLowestRating.toFixed(2)}
                <small className="opacity-50 ml-1">
                  {vsMeta?.totalLowestRating.toFixed(2)}
                </small>
              </h3>
              <p className="text-sm">Lowest Rating</p>
            </div>
            <div className="col-span-3 border-b -m-3 my-2 dark:border-gray-600" />
            <div>
              <h3 className="font-semibold">{stat("totalMatches")}</h3>
              <p className="text-sm">Matches</p>
            </div>
            <div>
              <h3 className="font-semibold">{stat("totalWins")}</h3>
              <p className="text-sm">Wins</p>
            </div>
            <div>
              <h3 className="font-semibold">{stat("totalLosses")}</h3>
              <p className="text-sm">Losses</p>
            </div>
            <div>
              <h3 className="font-semibold">{stat("totalScore")}</h3>
              <p className="text-sm">Total score</p>
            </div>
            <div>
              <h3 className="font-semibold">{stat("totalAvgScore", true)}</h3>
              <p className="text-sm">Average score</p>
            </div>
            <div>
              <h3 className="font-semibold">{stat("totalWinRate", true)}%</h3>
              <p className="text-sm">Winrate</p>
            </div>
            <div className="col-span-3 border-b -mx-3 my-2 dark:border-gray-600" />
            <div>
              <h3 className="font-semibold">
                {meta.currentWinStreak}
                <small className="opacity-50 ml-1">
                  {vsMeta?.currentWinStreak}
                </small>
              </h3>
              <p className="text-sm">Current winstreak</p>
            </div>
            <div>
              <h3 className="font-semibold">
                {meta.totalHighestWinStreak}
                <small className="opacity-50 ml-1">
                  {vsMeta?.totalHighestWinStreak}
                </small>
              </h3>
              <p className="text-sm">Highest winstreak</p>
            </div>
            <div>
              <h3 className="font-semibold">
                {meta.totalHighestLosingStreak}
                <small className="opacity-50 ml-1">
                  {vsMeta?.totalHighestLosingStreak}
                </small>
              </h3>
              <p className="text-sm">Highest losing streak</p>
            </div>
          </div>
        </div>
        <div className="col-span-6 h-52 border-t border-b dark:border-gray-600">
          {chartData.length > 0 ? (
            <PlayerEloHistory
              matchPlayers={chartData}
              players={[player.name, ...(versus ? [versus.name] : [])]}
            />
          ) : (
            <div className="h-52 flex justify-center items-center italic opacity-50">
              No matches found
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
