import { NextSeo } from "next-seo";
import { trpc } from "~/utils/trpc";
import { Card, LoadingIndicator, PlayerTable } from "~/components/Elements";

const Players = () => {
  const { data, isLoading } = trpc.players.list.useQuery();

  return (
    <>
      <NextSeo title="Players" />
      <Card>
        {isLoading || !data ? (
          <div className="flex justify-center">
            <LoadingIndicator />
          </div>
        ) : (
          <PlayerTable players={data} />
        )}
      </Card>
    </>
  );
};

export default Players;
