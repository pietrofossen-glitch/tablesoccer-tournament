import type { FunctionComponent } from "react";
import { useMemo } from "react";
import { ResponsiveLine, Serie } from "@nivo/line";
import { MatchPlayer, Player } from "@prisma/client";
import { useTheme } from "next-themes";

type MatchPlayerWithMatch = MatchPlayer & {
  match: {
    id: number;
    createdAt: Date;
  };
  player: Player;
};

export const PlayerEloHistory: FunctionComponent<{
  matchPlayers: MatchPlayerWithMatch[];
  players: string[];
}> = ({ players, matchPlayers }) => {
  const data: Serie[] = useMemo(
    () =>
      players.map(playerName => ({
        id: playerName,
        data: matchPlayers
          .filter(mp => mp.player.name === playerName)
          .sort((a, b) => (a.match.createdAt > b.match.createdAt ? 1 : -1))
          .map(mp => ({
            x: mp.match.id,
            y: mp.ratingAfter,
          })),
      })),
    [players, matchPlayers],
  );
  const { theme } = useTheme();

  return (
    <div className="h-full">
      <ResponsiveLine
        data={data}
        margin={{ top: 1, right: 5, bottom: 1, left: 50 }}
        yScale={{
          type: "linear",
          min: "auto",
        }}
        tooltip={({ point }) => {
          return (
            <div className="bg-gray-200 dark:bg-gray-800 p-2 text-sm shadow rounded">
              <b>{point.serieId}</b>: {(point.data.y as number).toFixed(2)}
            </div>
          );
        }}
        animate={false}
        colors={["#65a30d", "#0891b2"]}
        theme={
          theme === "dark"
            ? {
                axis: {
                  ticks: {
                    text: {
                      fill: "#9ca3af",
                    },
                  },
                },
                grid: {
                  line: {
                    stroke: "#4b5563",
                    strokeWidth: 1,
                  },
                },
              }
            : {}
        }
        curve="linear"
        axisTop={null}
        axisRight={null}
        enablePoints={matchPlayers.length < 100}
        axisBottom={null}
        useMesh={true}
        enableGridX={matchPlayers.length < 100}
      />
    </div>
  );
};
