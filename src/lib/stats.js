import { computeGameBoxscore, replayGame } from "./gameEngine";

const BLANK = () => ({ AB: 0, H: 0, HR: 0, BB: 0, K: 0, RBI: 0 });

export function computeSeasonStats(games, { teamId = null, from = null, to = null } = {}) {
  const totals = {}; // rosterEntryId -> stat line

  for (const game of games) {
    if (game.status !== "final") continue;
    if (from && game.date < from) continue;
    if (to && game.date > to) continue;
    if (teamId && game.homeTeamId !== teamId && game.awayTeamId !== teamId) continue;

    const box = computeGameBoxscore(game);
    for (const [playerId, line] of Object.entries(box)) {
      if (!totals[playerId]) totals[playerId] = BLANK();
      const t = totals[playerId];
      t.AB += line.AB;
      t.H += line.H;
      t.HR += line.HR;
      t.BB += line.BB;
      t.K += line.K;
      t.RBI += line.RBI;
    }
  }

  return totals;
}

export function average(line) {
  if (!line || line.AB === 0) return 0;
  return line.H / line.AB;
}

export function formatAvg(avg) {
  if (avg === 0) return ".000";
  return avg.toFixed(3).replace(/^0/, "");
}

export function computeStandings(games, teams) {
  const table = {};
  for (const t of teams) {
    table[t.id] = { teamId: t.id, wins: 0, losses: 0, ties: 0, runsFor: 0, runsAgainst: 0 };
  }
  for (const game of games) {
    if (game.status !== "final") continue;
    const result = replayGame(game);
    const home = table[game.homeTeamId];
    const away = table[game.awayTeamId];
    if (!home || !away) continue;
    home.runsFor += result.totals.home;
    home.runsAgainst += result.totals.away;
    away.runsFor += result.totals.away;
    away.runsAgainst += result.totals.home;
    if (result.totals.home > result.totals.away) {
      home.wins += 1;
      away.losses += 1;
    } else if (result.totals.away > result.totals.home) {
      away.wins += 1;
      home.losses += 1;
    } else {
      home.ties += 1;
      away.ties += 1;
    }
  }
  return Object.values(table);
}
