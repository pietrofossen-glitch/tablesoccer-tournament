import { backfillPlayersFromMatches } from "../src/server/model/player";

async function main() {
  const count = await backfillPlayersFromMatches();
  console.log(`Backfilled player ratings from ${count} matches.`);
}

main()
  .catch(error => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
