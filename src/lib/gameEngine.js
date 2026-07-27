import { OUT_OUTCOMES, HIT_OUTCOMES, GHOST_RUNNER } from "./rules";

const EMPTY_BASES = { first: null, second: null, third: null };

const HIT_BASES = { Single: 1, Double: 2, Triple: 3, HomeRun: 4 };

// Advance existing baserunners by `n` bases on a batted-ball hit, then place
// the batter. Runners further along are processed first so they never
// collide (their target base is always strictly greater).
function advanceOnHit(bases, n, batterId) {
  let runsScored = 0;
  const next = { ...EMPTY_BASES };
  const place = (startBase, runnerId) => {
    const target = startBase + n;
    if (target >= 4) runsScored += 1;
    else if (target === 3) next.third = runnerId;
    else if (target === 2) next.second = runnerId;
    else if (target === 1) next.first = runnerId;
  };
  if (bases.third) place(3, bases.third);
  if (bases.second) place(2, bases.second);
  if (bases.first) place(1, bases.first);
  place(0, batterId);
  return { bases: next, runsScored };
}

// Force-advancement on a walk: a runner only moves if the base behind them
// is occupied (forced), same as real baseball's walk/HBP rule.
function advanceOnWalk(bases, batterId) {
  let runsScored = 0;
  const next = { ...bases };
  next.first = batterId;
  if (bases.first) {
    next.second = bases.first;
    if (bases.second) {
      next.third = bases.second;
      if (bases.third) {
        runsScored += 1;
      }
    } else {
      next.third = bases.third;
    }
  } else {
    next.second = bases.second;
    next.third = bases.third;
  }
  return { bases: next, runsScored };
}

function resolvePlay(outcome, bases, rules, outsBefore, batterId) {
  if (rules.baseRunning === "zone") {
    if (outcome === "HomeRun") {
      return { outsRecorded: 0, runsScored: 1, bases: EMPTY_BASES };
    }
    const outsRecorded = OUT_OUTCOMES.has(outcome) ? 1 : 0;
    return { outsRecorded, runsScored: 0, bases: EMPTY_BASES };
  }

  // Traditional bases mode.
  if (outcome === "Walk") {
    const { bases: newBases, runsScored } = advanceOnWalk(bases, batterId);
    return { outsRecorded: 0, runsScored, bases: newBases };
  }
  if (HIT_OUTCOMES.has(outcome)) {
    const n = HIT_BASES[outcome];
    const { bases: newBases, runsScored } = advanceOnHit(bases, n, batterId);
    return { outsRecorded: 0, runsScored, bases: newBases };
  }
  if (outcome === "Flyout") {
    // Sac fly: runner on third scores if this isn't the inning-ending out.
    const isLastOut = outsBefore + 1 >= rules.outsPerInning;
    if (bases.third && !isLastOut) {
      return {
        outsRecorded: 1,
        runsScored: 1,
        bases: { ...bases, third: null },
      };
    }
    return { outsRecorded: 1, runsScored: 0, bases };
  }
  // Strikeout, Groundout, FoulOut: batter out, runners hold.
  return { outsRecorded: 1, runsScored: 0, bases };
}

function blankLineScore() {
  return [];
}

function addRuns(lineScore, inningIndex, runs) {
  while (lineScore.length <= inningIndex) lineScore.push(0);
  lineScore[inningIndex] += runs;
}

// Replays a game's at-bat log against its rules + lineups to derive the
// full current state. This is the single source of truth: undo/edit/delete
// on the log just mutates the array and everything recomputes here, so
// there's never a separate mutable "current state" to desync.
export function replayGame(game) {
  const rules = game.rules;
  const lineups = game.lineups;
  const log = game.log || [];

  let inning = 1;
  let half = "top"; // 'top' = away batting, 'bottom' = home batting
  let outs = 0;
  let bases = { ...EMPTY_BASES };
  const battingCount = { home: 0, away: 0 };
  const lineScore = { home: blankLineScore(), away: blankLineScore() };
  const totals = { home: 0, away: 0 };
  const entries = [];
  let gameOver = false;
  let endReason = null;

  for (const logEntry of log) {
    if (gameOver) break;

    const teamKey = half === "top" ? "away" : "home";

    // Ghost-runner placement: a direct base edit, not a plate appearance.
    if (logEntry.type === "ghost") {
      bases = { ...bases, [logEntry.base]: GHOST_RUNNER };
      entries.push({ ...logEntry, inning, half, teamKey, batterId: null });
      continue;
    }

    const lineup = lineups[teamKey] || [];
    const idx = lineup.length ? battingCount[teamKey] % lineup.length : 0;
    const batterId = lineup[idx] || null;
    battingCount[teamKey] += 1;

    // A batter can't simultaneously be on base and at the plate - this only
    // comes up with very short lineups where the order wraps quickly.
    // Auto-promote them to a ghost runner so the at-bat can proceed.
    if (batterId) {
      for (const base of ["first", "second", "third"]) {
        if (bases[base] === batterId) bases = { ...bases, [base]: GHOST_RUNNER };
      }
    }

    const result = resolvePlay(logEntry.outcome, bases, rules, outs, batterId);
    outs += result.outsRecorded;
    bases = result.bases;

    if (result.runsScored > 0) {
      addRuns(lineScore[teamKey], inning - 1, result.runsScored);
      totals[teamKey] += result.runsScored;
    }

    entries.push({
      ...logEntry,
      inning,
      half,
      teamKey,
      batterId,
      runsScored: result.runsScored,
      outsRecorded: result.outsRecorded,
    });

    // Walk-off: home team takes the lead in the bottom of (or after)
    // the final scheduled inning.
    if (
      teamKey === "home" &&
      inning >= rules.innings &&
      totals.home > totals.away
    ) {
      gameOver = true;
      endReason = "walkoff";
      continue;
    }

    if (outs >= rules.outsPerInning) {
      outs = 0;
      bases = { ...EMPTY_BASES };
      if (half === "top") {
        // Skip the bottom half if the home team is already ahead and this
        // was the final scheduled inning.
        if (inning >= rules.innings && totals.home > totals.away) {
          gameOver = true;
          endReason = "regulation";
        } else {
          half = "bottom";
        }
      } else {
        if (inning >= rules.innings) {
          gameOver = true;
          endReason = "regulation";
        } else {
          half = "top";
          inning += 1;
        }
      }
    }
  }

  const battingIndex = {
    home: (lineups.home || []).length
      ? battingCount.home % lineups.home.length
      : 0,
    away: (lineups.away || []).length
      ? battingCount.away % lineups.away.length
      : 0,
  };

  const nextBatter = {
    home: (lineups.home || [])[battingIndex.home] || null,
    away: (lineups.away || [])[battingIndex.away] || null,
  };

  return {
    inning,
    half,
    outs,
    bases,
    lineScore,
    totals,
    entries,
    gameOver,
    endReason,
    nextBatter,
    battingCount,
  };
}

// Per-player stat line derived from a single game's replayed entries.
export function computeGameBoxscore(game) {
  const { entries } = replayGame(game);
  const byPlayer = {};

  const ensure = (id) => {
    if (!byPlayer[id]) {
      byPlayer[id] = { AB: 0, H: 0, HR: 0, BB: 0, K: 0, RBI: 0 };
    }
    return byPlayer[id];
  };

  for (const e of entries) {
    if (!e.batterId) continue;
    const line = ensure(e.batterId);
    if (e.outcome === "Walk") {
      line.BB += 1;
    } else {
      line.AB += 1;
      if (e.outcome === "Strikeout") line.K += 1;
      if (["Single", "Double", "Triple", "HomeRun"].includes(e.outcome)) {
        line.H += 1;
        if (e.outcome === "HomeRun") line.HR += 1;
      }
    }
    if (e.runsScored > 0) line.RBI += e.runsScored;
  }

  return byPlayer;
}
