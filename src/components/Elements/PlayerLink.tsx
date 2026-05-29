import { FunctionComponent } from "react";
import { Player } from "@prisma/client";
import Link from "next/link";

export const PlayerLink: FunctionComponent<{ player: Player | string }> = ({
  player,
}) => {
  if (typeof player === "object") {
    player = player.name;
  }
  return (
    <Link href={`/players/${player}`} className="hover:underline">
      {player}
    </Link>
  );
};
