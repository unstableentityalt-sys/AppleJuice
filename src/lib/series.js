import { replayGame } from "./gameEngine";

export const SERIES_LENGTH_OPTIONS = [
  { label: "Best of 3", winsNeeded: 2 },
  { label: "Best of 5", winsNeeded: 3 },
  { label: "Best of 7", winsNeeded: 4 },
];

function isSeriesGame(game, series) {
  const pair = [game.homeTeamId, game.awayTeamId].sort();
  const seriesPair = [series.teamAId, series.teamBId].sort();
  return pair[0] === seriesPair[0] && pair[1] === seriesPair[1];
}

// Walks the finalized games between the two series teams in play order and
// tallies wins until someone reaches winsNeeded. Ties (only possible if a
// game is finalized early) don't move the series forward.
export function computeSeriesRecord(games, series) {
  const results = { [series.teamAId]: 0, [series.teamBId]: 0 };
  const gameResults = [];
  let clinchedTeamId = null;

  const seriesGames = games
    .filter((g) => g.status === "final" && isSeriesGame(g, series))
    .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));

  for (const game of seriesGames) {
    const { totals } = replayGame(game);
    let winnerTeamId = null;
    if (totals.home > totals.away) winnerTeamId = game.homeTeamId;
    else if (totals.away > totals.home) winnerTeamId = game.awayTeamId;

    if (winnerTeamId && !clinchedTeamId) {
      results[winnerTeamId] += 1;
      if (results[winnerTeamId] >= series.winsNeeded) clinchedTeamId = winnerTeamId;
    }

    gameResults.push({ game, winnerTeamId });
  }

  return {
    wins: results,
    games: gameResults,
    clinchedTeamId,
    isComplete: !!clinchedTeamId,
  };
}
