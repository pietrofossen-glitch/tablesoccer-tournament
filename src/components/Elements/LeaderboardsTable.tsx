import { FunctionComponent, ReactElement } from "react";
import { Leaderboards } from "~/model";
import { Card } from "~/components/Elements";

const PlaceIcon: FunctionComponent<{ place: number }> = ({ place }) => {
  switch (place) {
    case 1:
      return <span className="text-3xl">🥇</span>;
    case 2:
      return <span className="text-3xl">🥈</span>;
    case 3:
      return <span className="text-3xl">🥉</span>;
  }
  return null;
};

const LeaderboardsSection: FunctionComponent<{
  title: string;
  places: Array<{
    category: string;
    value: number;
    place: number;
    name: string;
  }>;
}> = ({ title, places }) => {
  return (
    <Card>
      <div className="px-4 py-3 text-sm font-semibold">{title}</div>
      <hr />
      <table className="table w-full">
        <thead>
          <tr className="bg-gray-200 dark:bg-gray-600 text-sm">
            <th className="w-1/6"></th>
            <th className="w-1/6 py-2">Wins</th>
            <th className="w-1/6 py-2">Score</th>
            <th className="w-1/6 py-2">Matches</th>
            <th className="w-1/6 py-2">Winrate</th>
            <th className="w-1/6 py-2">Rating</th>
          </tr>
        </thead>
        <tbody>
          {[1, 2, 3].map(place => (
            <tr
              key={place}
              className="border-b dark:border-b-gray-600 last:border-b-0"
            >
              <td className="text-center py-6">
                <PlaceIcon place={place} />
              </td>
              {["wins", "score", "matches", "winRate", "rating"].map(
                category => {
                  const entry = places.find(
                    p => p.place === place && p.category === category,
                  );
                  if (!entry) {
                    return <td key={category} className="text-center" />;
                  }
                  return (
                    <td key={category} className="text-center">
                      <div className="font-bold text-lg capitalize">
                        {entry.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {category === "winRate"
                          ? `${(entry.value * 100).toFixed(2)}%`
                          : category === "rating"
                          ? entry.value.toFixed(2)
                          : entry.value}
                      </div>
                    </td>
                  );
                },
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
};

export const LeaderboardsTable: FunctionComponent<{
  leaderboards: Leaderboards;
}> = ({ leaderboards }) => {
  if (leaderboards.totalMatches.total === 0) {
    return <div>No matches played yet</div>;
  }

  const teamPlaces = leaderboards.places.map(place => ({
    ...place,
    name: place.team,
  }));
  const playerPlaces = leaderboards.playerPlaces.map(place => ({
    ...place,
    name: place.player,
  }));

  return (
    <div className="space-y-6">
      <Card>
        <div className="px-4 py-3 text-sm flex justify-between">
          <div>
            Total Matches: <b>{leaderboards.totalMatches.total}</b>
          </div>
        </div>
      </Card>
      <LeaderboardsSection title="Teams (pairs)" places={teamPlaces} />
      <LeaderboardsSection title="Players (individual)" places={playerPlaces} />
    </div>
  );
};
