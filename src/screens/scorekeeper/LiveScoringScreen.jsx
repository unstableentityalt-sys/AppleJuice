import { useMemo } from "react";
import { useData } from "../../context/DataContext";
import { replayGame } from "../../lib/gameEngine";
import { OUTCOMES, OUTCOME_LABELS } from "../../lib/rules";
import { findTeam, findRosterEntry } from "../../lib/helpers";
import BaseDiamond from "../../components/BaseDiamond";

export default function LiveScoringScreen({ game, teams }) {
  const { appendPlay, undoLastPlay, finalizeGame } = useData();
  const state = useMemo(() => replayGame(game), [game]);

  const home = findTeam(teams, game.homeTeamId);
  const away = findTeam(teams, game.awayTeamId);
  const battingTeamKey = state.half === "top" ? "away" : "home";
  const battingTeam = battingTeamKey === "home" ? home : away;
  const batterId = state.nextBatter[battingTeamKey];
  const { entry: batter } = findRosterEntry(teams, batterId);

  const maxInnings = Math.max(
    game.rules.innings,
    state.lineScore.home.length,
    state.lineScore.away.length,
  );

  const outcomesToShow = OUTCOMES.filter(
    (o) => o !== "Walk" || game.rules.walksEnabled,
  );

  function classFor(outcome) {
    if (outcome === "HomeRun") return "hr";
    if (["Strikeout", "Groundout", "Flyout", "FoulOut"].includes(outcome)) return "out";
    return "";
  }

  const canPlay = !state.gameOver;

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
            <BaseDiamond bases={game.rules.baseRunning === "traditional" ? state.bases : {}} />
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
                onClick={() => appendPlay(game.id, o)}
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
