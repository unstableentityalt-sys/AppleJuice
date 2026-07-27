import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "../../context/DataContext";
import TopBar from "../../components/TopBar";
import EmptyState from "../../components/EmptyState";
import { INNINGS_OPTIONS, OUTS_OPTIONS, PITCHES_OPTIONS, DEFAULT_RULES } from "../../lib/rules";

function LineupPicker({ team, selected, onToggle, onMove }) {
  if (!team) return null;
  return (
    <div className="card">
      <h3>{team.name} Lineup</h3>
      {team.roster.length === 0 ? (
        <p style={{ color: "var(--ink-soft)", fontSize: 13 }}>No players on this roster yet.</p>
      ) : (
        <div className="stack">
          {team.roster.map((p) => {
            const idx = selected.indexOf(p.id);
            const inLineup = idx !== -1;
            return (
              <div key={p.id} className="row between" style={{ padding: "4px 0" }}>
                <label className="row" style={{ cursor: "pointer" }}>
                  <input type="checkbox" checked={inLineup} onChange={() => onToggle(p.id)} />
                  <span>
                    {inLineup ? `${idx + 1}. ` : ""}
                    {p.name} {p.jerseyNumber && `#${p.jerseyNumber}`}
                  </span>
                </label>
                {inLineup && (
                  <div className="row">
                    <button type="button" className="btn ghost small" onClick={() => onMove(p.id, -1)}>
                      ↑
                    </button>
                    <button type="button" className="btn ghost small" onClick={() => onMove(p.id, 1)}>
                      ↓
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function GameSetupScreen() {
  const { teams, createGame } = useData();
  const navigate = useNavigate();

  const [homeTeamId, setHomeTeamId] = useState(teams[0]?.id || "");
  const [awayTeamId, setAwayTeamId] = useState(teams[1]?.id || teams[0]?.id || "");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [rules, setRules] = useState({ ...DEFAULT_RULES });
  const [homeLineup, setHomeLineup] = useState([]);
  const [awayLineup, setAwayLineup] = useState([]);

  const homeTeam = teams.find((t) => t.id === homeTeamId);
  const awayTeam = teams.find((t) => t.id === awayTeamId);

  if (teams.length < 2) {
    return (
      <>
        <TopBar title="New Game" showBack />
        <div className="app-main">
          <EmptyState
            emoji="👥"
            title="Need two teams"
            hint="Create at least two teams before starting a game."
          />
        </div>
      </>
    );
  }

  function toggleIn(list, setList, playerId) {
    setList((prev) =>
      prev.includes(playerId) ? prev.filter((id) => id !== playerId) : [...prev, playerId],
    );
  }

  function move(list, setList, playerId, dir) {
    setList((prev) => {
      const idx = prev.indexOf(playerId);
      const next = idx + dir;
      if (idx === -1 || next < 0 || next >= prev.length) return prev;
      const copy = [...prev];
      [copy[idx], copy[next]] = [copy[next], copy[idx]];
      return copy;
    });
  }

  function handleStart(e) {
    e.preventDefault();
    if (!homeTeamId || !awayTeamId || homeTeamId === awayTeamId) return;
    if (homeLineup.length === 0 || awayLineup.length === 0) return;
    const game = createGame({
      homeTeamId,
      awayTeamId,
      date,
      rules,
      lineups: { home: homeLineup, away: awayLineup },
    });
    navigate(`/games/${game.id}`);
  }

  const sameTeam = homeTeamId === awayTeamId;

  return (
    <>
      <TopBar title="New Game" showBack />
      <div className="app-main">
        <form onSubmit={handleStart}>
          <div className="card">
            <div className="field">
              <label htmlFor="game-date">Date</label>
              <input
                id="game-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="row">
              <div className="field" style={{ flex: 1 }}>
                <label htmlFor="away-team">Away Team</label>
                <select
                  id="away-team"
                  value={awayTeamId}
                  onChange={(e) => {
                    setAwayTeamId(e.target.value);
                    setAwayLineup([]);
                  }}
                >
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field" style={{ flex: 1 }}>
                <label htmlFor="home-team">Home Team</label>
                <select
                  id="home-team"
                  value={homeTeamId}
                  onChange={(e) => {
                    setHomeTeamId(e.target.value);
                    setHomeLineup([]);
                  }}
                >
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {sameTeam && <p className="error-text">Pick two different teams.</p>}
          </div>

          <div className="card">
            <h3>Game Rules</h3>
            <div className="field">
              <label>Innings</label>
              <div className="row">
                {INNINGS_OPTIONS.map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={`btn small ${rules.innings === n ? "" : "secondary"}`}
                    onClick={() => setRules((r) => ({ ...r, innings: n }))}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <div className="field">
              <label>Outs per inning</label>
              <div className="row">
                {OUTS_OPTIONS.map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={`btn small ${rules.outsPerInning === n ? "" : "secondary"}`}
                    onClick={() => setRules((r) => ({ ...r, outsPerInning: n }))}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <div className="field">
              <label>Baserunning</label>
              <div className="row">
                <button
                  type="button"
                  className={`btn small ${rules.baseRunning === "traditional" ? "" : "secondary"}`}
                  onClick={() => setRules((r) => ({ ...r, baseRunning: "traditional" }))}
                >
                  Traditional Bases
                </button>
                <button
                  type="button"
                  className={`btn small ${rules.baseRunning === "zone" ? "" : "secondary"}`}
                  onClick={() => setRules((r) => ({ ...r, baseRunning: "zone" }))}
                >
                  Zone (No Baserunning)
                </button>
              </div>
            </div>
            <div className="field row between">
              <label style={{ margin: 0 }}>Walks allowed</label>
              <input
                type="checkbox"
                checked={rules.walksEnabled}
                onChange={(e) => setRules((r) => ({ ...r, walksEnabled: e.target.checked }))}
              />
            </div>
            {!rules.walksEnabled && (
              <div className="field">
                <label>Batter is out after this many pitches</label>
                <div className="row" style={{ flexWrap: "wrap" }}>
                  {PITCHES_OPTIONS.map((n) => (
                    <button
                      key={n}
                      type="button"
                      className={`btn small ${rules.pitchesUntilOut === n ? "" : "secondary"}`}
                      onClick={() => setRules((r) => ({ ...r, pitchesUntilOut: n }))}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {rules.baseRunning === "traditional" && (
              <div className="field row between">
                <label style={{ margin: 0 }}>Ghost runners allowed</label>
                <input
                  type="checkbox"
                  checked={rules.ghostRunners}
                  onChange={(e) => setRules((r) => ({ ...r, ghostRunners: e.target.checked }))}
                />
              </div>
            )}
          </div>

          <LineupPicker
            team={awayTeam}
            selected={awayLineup}
            onToggle={(id) => toggleIn(awayLineup, setAwayLineup, id)}
            onMove={(id, dir) => move(awayLineup, setAwayLineup, id, dir)}
          />
          <LineupPicker
            team={homeTeam}
            selected={homeLineup}
            onToggle={(id) => toggleIn(homeLineup, setHomeLineup, id)}
            onMove={(id, dir) => move(homeLineup, setHomeLineup, id, dir)}
          />

          <button
            className="btn block"
            type="submit"
            disabled={sameTeam || homeLineup.length === 0 || awayLineup.length === 0}
          >
            ⚾ Start Game
          </button>
        </form>
      </div>
    </>
  );
}
