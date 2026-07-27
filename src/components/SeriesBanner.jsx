import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import { computeSeriesRecord, SERIES_LENGTH_OPTIONS } from "../lib/series";
import { findTeam } from "../lib/helpers";

function SeriesSetupForm({ teams, onSave, onCancel, showCancel }) {
  const [teamAId, setTeamAId] = useState(teams[0]?.id || "");
  const [teamBId, setTeamBId] = useState(teams[1]?.id || teams[0]?.id || "");
  const [winsNeeded, setWinsNeeded] = useState(4);

  const sameTeam = teamAId === teamBId;

  return (
    <div className="card series-card">
      <h3>🏆 Set Up the Finals</h3>
      <div className="field">
        <label htmlFor="series-team-a">Team A</label>
        <select id="series-team-a" value={teamAId} onChange={(e) => setTeamAId(e.target.value)}>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="series-team-b">Team B</label>
        <select id="series-team-b" value={teamBId} onChange={(e) => setTeamBId(e.target.value)}>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>
      {sameTeam && <p className="error-text">Pick two different teams.</p>}
      <div className="field">
        <label>Series length</label>
        <div className="row" style={{ flexWrap: "wrap" }}>
          {SERIES_LENGTH_OPTIONS.map((opt) => (
            <button
              key={opt.winsNeeded}
              type="button"
              className={`btn small ${winsNeeded === opt.winsNeeded ? "" : "secondary"}`}
              onClick={() => setWinsNeeded(opt.winsNeeded)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <div className="row">
        <button
          className="btn block"
          disabled={sameTeam || !teamAId || !teamBId}
          onClick={() => onSave(teamAId, teamBId, winsNeeded)}
        >
          Start the Series
        </button>
        {showCancel && (
          <button className="btn ghost small" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

export default function SeriesBanner() {
  const { role } = useAuth();
  const { teams, games, series, setSeries, clearSeries } = useData();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const isScorekeeper = role === "scorekeeper";

  if (!series) {
    if (!isScorekeeper) return null;
    if (teams.length < 2) return null;
    return (
      <SeriesSetupForm
        teams={teams}
        onSave={(a, b, n) => setSeries(a, b, n)}
        showCancel={false}
      />
    );
  }

  if (editing) {
    return (
      <SeriesSetupForm
        teams={teams}
        onSave={(a, b, n) => {
          setSeries(a, b, n);
          setEditing(false);
        }}
        onCancel={() => setEditing(false)}
        showCancel
      />
    );
  }

  const teamA = findTeam(teams, series.teamAId);
  const teamB = findTeam(teams, series.teamBId);
  const record = computeSeriesRecord(games, series);
  const seriesLength = series.winsNeeded * 2 - 1;
  const clinchedTeam = record.clinchedTeamId ? findTeam(teams, record.clinchedTeamId) : null;

  return (
    <div className="card series-card">
      <div className="row between">
        <span className="pill sun">🏆 Best of {seriesLength} — Finals</span>
        {isScorekeeper && (
          <button className="btn ghost small" onClick={() => setEditing(true)}>
            Edit
          </button>
        )}
      </div>

      <div className="series-score">
        <div className="series-team">
          <span className="series-team-name">{teamA?.name || "Team A"}</span>
          <span className="series-team-wins">{record.wins[series.teamAId] || 0}</span>
        </div>
        <span className="series-dash">–</span>
        <div className="series-team">
          <span className="series-team-wins">{record.wins[series.teamBId] || 0}</span>
          <span className="series-team-name">{teamB?.name || "Team B"}</span>
        </div>
      </div>

      {clinchedTeam ? (
        <p className="series-status clinched">🎉 {clinchedTeam.name} win the series!</p>
      ) : record.games.length === 0 ? (
        <p className="series-status">No games played yet.</p>
      ) : (
        <p className="series-status">
          {record.wins[series.teamAId] === record.wins[series.teamBId]
            ? "Series tied"
            : `${
                record.wins[series.teamAId] > record.wins[series.teamBId] ? teamA?.name : teamB?.name
              } leads the series`}
        </p>
      )}

      {record.games.length > 0 && (
        <div className="series-games-row">
          {record.games.map((g, i) => (
            <button
              key={g.game.id}
              type="button"
              className={`series-game-pill ${
                g.winnerTeamId === series.teamAId
                  ? "a"
                  : g.winnerTeamId === series.teamBId
                    ? "b"
                    : "tie"
              }`}
              onClick={() => navigate(`/games/${g.game.id}`)}
              title={`Game ${i + 1}`}
            >
              G{i + 1}
            </button>
          ))}
        </div>
      )}

      {isScorekeeper && (
        <button
          className="btn ghost small"
          style={{ color: "var(--danger)", marginTop: 6 }}
          onClick={() => {
            if (window.confirm("Clear the configured Finals series?")) clearSeries();
          }}
        >
          Clear Series
        </button>
      )}
    </div>
  );
}
