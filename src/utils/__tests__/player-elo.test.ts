import { averageRating, parsePlayers } from "~/model/player";
import { calculateRating, defaultRating, getExpectedRating } from "~/utils/elo";

describe("player elo", () => {
  it("parses team names into individual players", () => {
    expect(parsePlayers("pietro, mario")).toEqual(["pietro", "mario"]);
    expect(parsePlayers(" Luigi,Pietro ")).toEqual(["luigi", "pietro"]);
  });

  it("updates each player against the opponent team average", () => {
    const pietro = defaultRating;
    const mario = defaultRating + 100;
    const luigi = defaultRating - 50;
    const anna = defaultRating + 50;

    const team1Avg = averageRating([pietro, mario]);
    const team2Avg = averageRating([luigi, anna]);

    const pietroExpected = getExpectedRating(pietro, team2Avg);
    const pietroAfterWin = calculateRating(pietroExpected, 1, pietro);
    const luigiExpected = getExpectedRating(luigi, team1Avg);
    const luigiAfterLoss = calculateRating(luigiExpected, 0, luigi);

    expect(pietroAfterWin).toBeGreaterThan(pietro);
    expect(luigiAfterLoss).toBeLessThan(luigi);
    expect(team1Avg).toBe(1050);
    expect(team2Avg).toBe(1000);
  });
});
