import { useEffect, useMemo, useState } from "react";
import { useData } from "../../context/DataContext";
import { replayGame } from "../../lib/gameEngine";
import { OUTCOMES, OUTCOME_LABELS } from "../../lib/rules";
import { findTeam, findRosterEntry, shortName } from "../../lib/helpers";
import BaseDiamond from "../../components/BaseDiamond";

export default function LiveScoringScreen({ game, teams }) {
  const { appendPlay, addGhostRunner, undoLastPlay, finalizeGame } = useData();
  const state = useMemo(() => replayGame(game), [game]);
  const rules = game.rules;

  const home = findTeam(teams, game.homeTeamId);
  const away = findTeam(teams, game.awayTeamId);
  const battingTeamKey = state.half === "top" ? "away" : "home";
  const battingTeam = battingTeamKey === "home" ? home : away;
  const batterId = state.nextBatter[battingTeamKey];
  const { entry: batter } = findRosterEntry(teams, batterId);

  const [balls, setBalls] = useState(0);
  const [strikes, setStrikes] = useState(0);

  // A new batter (or an undo that reverts to a previous one) starts fresh -
  // we only track the pitch count for display, not as part of the log.
  useEffect(() => {
    setBalls(0);
    setStrikes(0);
  }, [batterId, state.half, state.inning]);

  const maxInnings = Math.max(
    game.rules.innings,
    state.lineScore.home.length,
    state.lineScore.away.length,
  );

  const outcomesToShow = OUTCOMES.filter(
    (o) => o !== "Walk" || rules.walksEnabled,
  );

  function classFor(outcome) {
    if (outcome === "HomeRun") return "hr";
    if (["Strikeout", "Groundout", "Flyout", "FoulOut"].includes(outcome)) return "out";
    return "";
  }

  function logOutcome(outcome) {
    setBalls(0);
    setStrikes(0);
    appendPlay(game.id, outcome);
  }

  function handleBall() {
    const nextBalls = balls + 1;
    if (rules.walksEnabled) {
      if (nextBalls >= 4) return logOutcome("Walk");
      setBalls(nextBalls);
      return;
    }
    if (nextBalls + strikes >= rules.pitchesUntilOut) return logOutcome("Strikeout");
    setBalls(nextBalls);
  }

  function handleStrike() {
    const nextStrikes = strikes + 1;
    if (nextStrikes >= 3) return logOutcome("Strikeout");
    if (!rules.walksEnabled && balls + nextStrikes >= rules.pitchesUntilOut) {
      return logOutcome("Strikeout");
    }
    setStrikes(nextStrikes);
  }

  function handleFoul() {
    if (strikes >= 2) return; // foul with 2 strikes is a no-op, same as real baseball
    const nextStrikes = strikes + 1;
    if (!rules.walksEnabled && balls + nextStrikes >= rules.pitchesUntilOut) {
      return logOutcome("Strikeout");
    }
    setStrikes(nextStrikes);
  }

  const canPlay = !state.gameOver;
  const isTraditional = rules.baseRunning === "traditional";

  const baseLabels = isTraditional
    ? {
        first: shortName(findRosterEntry(teams, state.bases.first).entry?.name),
        second: shortName(findRosterEntry(teams, state.bases.second).entry?.name),
        third: shortName(findRosterEntry(teams, state.bases.third).entry?.name),
      }
    : {};

  return (
    <div className="app-main">
      <div className="card">
        <table className="linescore">
          <thead>
            <tr>
              <th></th>
              {Array.from({ length: maxInnings }, (_, i) => (
                <th key={i}>{i + 1}</th>
              ))}
              <th>R</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{away?.name || "Away"}</td>
              {Array.from({ length: maxInnings }, (_, i) => (
                <td key={i}>{state.lineScore.away[i] ?? ""}</td>
              ))}
              <td>
                <strong>{state.totals.away}</strong>
              </td>
            </tr>
            <tr>
              <td>{home?.name || "Home"}</td>
              {Array.from({ length: maxInnings }, (_, i) => (
                <td key={i}>{state.lineScore.home[i] ?? ""}</td>
              ))}
              <td>
                <strong>{state.totals.home}</strong>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {state.gameOver ? (
        <div className="card" style={{ textAlign: "center" }}>
          <h2>Game Over</h2>
          <p style={{ color: "var(--ink-soft)" }}>
            {state.totals.home === state.totals.away
              ? "It's a tie ballgame."
              : `${state.totals.home > state.totals.away ? home?.name : away?.name} wins!`}
          </p>
          {game.status === "in_progress" && (
            <button className="btn block sun" onClick={() => finalizeGame(game.id)}>
              💾 Save to History
            </button>
          )}
        </div>
      ) : (
        <div className="card" style={{ textAlign: "center" }}>
          <p className="pill">
            {state.half === "top" ? "Top" : "Bottom"} {state.inning} · {battingTeam?.name} batting
          </p>
          <div className="row" style={{ justifyContent: "center", margin: "12px 0" }}>
            {isTraditional ? (
              <BaseDiamond
                bases={state.bases}
                labels={baseLabels}
                onAddGhost={
                  canPlay && rules.ghostRunners
                    ? (base) => addGhostRunner(game.id, base)
                    : undefined
                }
              />
            ) : (
              <p style={{ color: "var(--ink-soft)", fontSize: 12 }}>
                Zone play — no baserunners tracked.
              </p>
            )}
          </div>
          <div className="outs-dots" style={{ justifyContent: "center", marginBottom: 10 }}>
            {Array.from({ length: game.rules.outsPerInning }, (_, i) => (
              <span key={i} className={`dot ${i < state.outs ? "filled" : ""}`} />
            ))}
          </div>
          <h3>
            At bat: {batter ? batter.name : "—"}
            {batter?.jerseyNumber ? ` #${batter.jerseyNumber}` : ""}
          </h3>

          {canPlay && batter && (
            <div className="count-row">
              <div className="count-group">
                <span className="count-label">Balls</span>
                <div className="outs-dots">
                  {Array.from({ length: 4 }, (_, i) => (
                    <span key={i} className={`dot ball ${i < balls ? "filled" : ""}`} />
                  ))}
                </div>
              </div>
              <div className="count-group">
                <span className="count-label">Strikes</span>
                <div className="outs-dots">
                  {Array.from({ length: 3 }, (_, i) => (
                    <span key={i} className={`dot strike ${i < strikes ? "filled" : ""}`} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {canPlay && batter && (
        <div className="pitch-buttons">
          <button type="button" className="btn secondary small" onClick={handleBall}>
            Ball
          </button>
          <button type="button" className="btn secondary small" onClick={handleStrike}>
            Strike
          </button>
          <button type="button" className="btn secondary small" onClick={handleFoul}>
            Foul Ball
          </button>
        </div>
      )}

      {canPlay && (
        <>
          <div className="section-title">
            <h2>Log the Play</h2>
          </div>
          <div className="outcome-grid">
            {outcomesToShow.map((o) => (
              <button
                key={o}
                type="button"
                className={classFor(o)}
                onClick={() => logOutcome(o)}
                disabled={!batter}
              >
                {OUTCOME_LABELS[o]}
              </button>
            ))}
          </div>
        </>
      )}

      <button
        className="btn secondary block"
        onClick={() => undoLastPlay(game.id)}
        disabled={game.log.length === 0}
      >
        ↩️ Undo Last Play
      </button>

      {game.status === "in_progress" && !state.gameOver && (
        <button
          className="btn ghost block"
          style={{ marginTop: 8 }}
          onClick={() => {
            if (window.confirm("End this game now and save it to history?")) {
              finalizeGame(game.id);
            }
          }}
        >
          End Game Early
        </button>
      )}

      <div className="section-title">
        <h2>Play-by-Play</h2>
      </div>
      <div className="card">
        {state.entries.length === 0 ? (
          <p style={{ color: "var(--ink-soft)" }}>No plays logged yet.</p>
        ) : (
          [...state.entries].reverse().map((e) => {
            if (e.type === "ghost") {
              return (
                <div className="play-log-item" key={e.id}>
                  <span>
                    {e.half === "top" ? "T" : "B"}
                    {e.inning} — 👻 Ghost runner
                  </span>
                  <span>added to {e.base} base</span>
                </div>
              );
            }
            const { entry } = findRosterEntry(teams, e.batterId);
            return (
              <div className="play-log-item" key={e.id}>
                <span>
                  {e.half === "top" ? "T" : "B"}
                  {e.inning} — {entry?.name || "?"}
                </span>
                <span>
                  {OUTCOME_LABELS[e.outcome]}
                  {e.runsScored > 0 ? ` (+${e.runsScored})` : ""}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
