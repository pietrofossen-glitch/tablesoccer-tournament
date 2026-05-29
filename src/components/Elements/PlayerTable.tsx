import { FunctionComponent, useCallback, useMemo, useState } from "react";
import { getPlayerSeasonMeta } from "~/model";
import { PlayerLink } from "~/components/Elements/PlayerLink";
import { PlayerWithMeta } from "~/server/model/player";
import { useStore } from "~/utils/store";

type PlayerOrder =
  | "name"
  | "matches"
  | "wins"
  | "score"
  | "losses"
  | "winRate"
  | "rating";

export const PlayerTable: FunctionComponent<{ players: PlayerWithMeta[] }> = ({
  players,
}) => {
  const selectedSeason = useStore(state => state.season);
  const [orderBy, setOrderBy] = useState<PlayerOrder>("rating");
  const [order, setOrder] = useState<"asc" | "desc">("asc");

  const orderedPlayers = useMemo(() => {
    const ordered = players.sort((player1, player2) => {
      const meta1 = getPlayerSeasonMeta(player1, selectedSeason);
      const meta2 = getPlayerSeasonMeta(player2, selectedSeason);

      switch (orderBy) {
        case "name":
          return player1.name.localeCompare(player2.name);
        case "matches":
          return meta1.totalMatches - meta2.totalMatches;
        case "wins":
          return meta1.totalWins - meta2.totalWins;
        case "losses":
          return meta2.totalLosses - meta1.totalLosses;
        case "score":
          return meta2.totalScore - meta1.totalScore;
        case "winRate":
          return meta2.totalWinRate - meta1.totalWinRate;
        default:
        case "rating":
          return meta2.rating - meta1.rating;
      }
    });

    if (order === "desc") {
      ordered.reverse();
    }

    return ordered;
  }, [players, order, selectedSeason, orderBy]);

  const setOrdering = (nextOrderBy: PlayerOrder) => {
    setOrderBy(nextOrderBy);
    setOrder(order === "asc" ? "desc" : "asc");
  };

  const orderIcon = useCallback(
    header => {
      if (header !== orderBy) {
        return null;
      }
      return order === "asc" ? "▲" : "▼";
    },
    [order, orderBy],
  );

  return (
    <table className="w-full rounded-lg dark:bg-gray-700">
      <thead className="text-left">
        <tr className="bg-gray-200 dark:bg-gray-600 text-sm cursor-pointer">
          <th className="p-3" onClick={() => setOrdering("name")}>
            Name {orderIcon("name")}
          </th>
          <th className="p-3" onClick={() => setOrdering("matches")}>
            Matches {orderIcon("matches")}
          </th>
          <th className="p-3" onClick={() => setOrdering("wins")}>
            Wins {orderIcon("wins")}
          </th>
          <th className="p-3" onClick={() => setOrdering("losses")}>
            Losses {orderIcon("losses")}
          </th>
          <th className="p-3" onClick={() => setOrdering("score")}>
            Score {orderIcon("score")}
          </th>
          <th className="p-3" onClick={() => setOrdering("winRate")}>
            Winrate {orderIcon("winRate")}
          </th>
          <th className="p-3" onClick={() => setOrdering("rating")}>
            Rating {orderIcon("rating")}
          </th>
        </tr>
      </thead>
      <tbody>
        {orderedPlayers
          .map(p => ({ ...p, meta: getPlayerSeasonMeta(p, selectedSeason) }))
          .map((player, index) => (
            <tr
              key={player.id}
              className={`${
                index % 2 === 0 ? "bg-gray-50 dark:bg-gray-800" : ""
              } group`}
            >
              <td className="p-3">
                <PlayerLink player={player.name} />
              </td>
              <td className="p-3">{player.meta.totalMatches}</td>
              <td className="p-3">{player.meta.totalWins}</td>
              <td className="p-3">{player.meta.totalLosses}</td>
              <td className="p-3">
                {player.meta.totalScore}{" "}
                {player.meta.totalMatches > 0 && (
                  <span className="text-sm text-gray-500">
                    Ø {player.meta.totalAvgScore.toFixed(2)}
                  </span>
                )}
              </td>
              <td className="p-3">
                {player.meta.totalMatches > 0 && (
                  <>{(player.meta.totalWinRate * 100).toFixed(2)}%</>
                )}
              </td>
              <td className="p-3">{+player.meta.rating.toFixed(2)}</td>
            </tr>
          ))}
      </tbody>
    </table>
  );
};
