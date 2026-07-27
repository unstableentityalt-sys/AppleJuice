import { useMemo, useState } from "react";
import { useData } from "../../context/DataContext";
import { replayGame } from "../../lib/gameEngine";
import { OUTCOMES, OUTCOME_LABELS } from "../../lib/rules";
import { findRosterEntry } from "../../lib/helpers";

export default function CorrectionsPanel({ game, teams }) {
  const { updateLogEntry, deleteLogEntry, reopenGame } = useData();
  const [open, setOpen] = useState(false);
  const state = useMemo(() => replayGame(game), [game]);

  return (
    <div className="card">
      <div className="row between">
        <h3>Correct This Game</h3>
        <button className="btn ghost small" onClick={() => setOpen((o) => !o)}>
          {open ? "Hide" : "Show"}
        </button>
      </div>
      {open && (
        <>
          <p style={{ fontSize: 12, color: "var(--ink-soft)", marginBottom: 8 }}>
            Change or remove any at-bat below — score, stats, and leaderboards recalculate
            automatically.
          </p>
          {game.status === "final" && (
            <button
              className="btn secondary small"
              style={{ marginBottom: 10 }}
              onClick={() => reopenGame(game.id)}
            >
              Reopen for Live Editing
            </button>
          )}
          <div className="stack">
            {state.entries.length === 0 && (
              <p style={{ color: "var(--ink-soft)" }}>No plays logged.</p>
            )}
            {state.entries.map((e) => {
              const { entry } = findRosterEntry(teams, e.batterId);
              return (
                <div key={e.id} className="row between" style={{ padding: "6px 0", borderBottom: "1px solid var(--line)" }}>
                  <span style={{ fontSize: 13 }}>
                    {e.half === "top" ? "T" : "B"}
                    {e.inning} — {entry?.name || "?"}
                  </span>
                  <div className="row">
                    <select
                      value={e.outcome}
                      onChange={(ev) => updateLogEntry(game.id, e.id, { outcome: ev.target.value })}
                    >
                      {OUTCOMES.map((o) => (
                        <option key={o} value={o}>
                          {OUTCOME_LABELS[o]}
                        </option>
                      ))}
                    </select>
                    <button
                      className="btn ghost small"
                      style={{ color: "var(--danger)" }}
                      onClick={() => {
                        if (window.confirm("Delete this play?")) deleteLogEntry(game.id, e.id);
                      }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
