import { NextSeo } from "next-seo";
import { trpc } from "~/utils/trpc";
import { useRouter } from "next/router";
import { LoadingIndicator } from "~/components/Elements";
import { PlayerProfile } from "~/components/Elements/PlayerProfile";
import { useState } from "react";
import { useStore } from "~/utils/store";

const Player = () => {
  const playerName = useRouter().query.name as string;
  const [versus, setVersus] = useState<string | null>(null);
  const { data: player, isLoading } = trpc.players.byId.useQuery({
    name: playerName,
  });
  const { data: players } = trpc.players.list.useQuery();
  const { data: versusPlayer } = trpc.players.byId.useQuery(
    {
      name: versus || "",
    },
    {
      keepPreviousData: true,
      enabled: !!versus && versus !== "",
    },
  );
  const selectedSeason = useStore(state => state.season);
  const { data: matchPlayers } = trpc.players.matches.useQuery({
    name: playerName,
    limit: 0,
    season: selectedSeason,
  });
  const { data: versusMatchPlayers } = trpc.players.matches.useQuery(
    {
      name: versus || "",
      limit: 0,
      season: selectedSeason,
    },
    {
      enabled: !!versus && versus !== "",
    },
  );

  if (!player || isLoading) {
    return (
      <div className="h-32 flex items-center justify-center">
        <LoadingIndicator />
      </div>
    );
  }

  const combinedMatchPlayers = [
    ...(matchPlayers || []),
    ...(versusMatchPlayers || []),
  ].filter(
    (matchPlayer, index, all) =>
      all.findIndex(item => item.id === matchPlayer.id) === index,
  );

  return (
    <>
      <NextSeo title={player.name} />
      <PlayerProfile
        player={player}
        versus={versus ? versusPlayer : undefined}
        matchPlayers={combinedMatchPlayers}
        onVersusSelect={setVersus}
        versusOptions={players || []}
      />
    </>
  );
};

export default Player;
