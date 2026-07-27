import { useMemo } from "react";
import { replayGame, computeGameBoxscore } from "../../lib/gameEngine";
import { findTeam, findRosterEntry, shortName } from "../../lib/helpers";
import { average, formatAvg } from "../../lib/stats";
import BaseDiamond from "../../components/BaseDiamond";

function TeamBox({ team, box }) {
  const rows = team.roster.filter((p) => box[p.id]);
  if (rows.length === 0) return null;
  return (
    <div className="card">
      <h3>{team.name}</h3>
      <div style={{ overflowX: "auto" }}>
        <table className="stat-table">
          <thead>
            <tr>
              <th>Player</th>
              <th>AB</th>
              <th>H</th>
              <th>HR</th>
              <th>RBI</th>
              <th>BB</th>
              <th>K</th>
              <th>AVG</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => {
              const line = box[p.id];
              return (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{line.AB}</td>
                  <td>{line.H}</td>
                  <td>{line.HR}</td>
                  <td>{line.RBI}</td>
                  <td>{line.BB}</td>
                  <td>{line.K}</td>
                  <td>{formatAvg(average(line))}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function BoxscoreView({ game, teams }) {
  const state = useMemo(() => replayGame(game), [game]);
  const box = useMemo(() => computeGameBoxscore(game), [game]);
  const home = findTeam(teams, game.homeTeamId);
  const away = findTeam(teams, game.awayTeamId);

  const maxInnings = Math.max(
    game.rules.innings,
    state.lineScore.home.length,
    state.lineScore.away.length,
  );

  return (
    <div className="app-main">
      <div className="card">
        <div className="row between">
          <span className="pill">{game.status === "final" ? "Final" : "🔴 Live"}</span>
          {game.status === "in_progress" && !state.gameOver && (
            <span className="pill sun">
              {state.half === "top" ? "Top" : "Bot"} {state.inning}
            </span>
          )}
        </div>
        <table className="linescore" style={{ marginTop: 10 }}>
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
        {game.status === "in_progress" && !state.gameOver && game.rules.baseRunning === "traditional" && (
          <div className="row" style={{ justifyContent: "center", marginTop: 10 }}>
            <BaseDiamond
              bases={state.bases}
              labels={{
                first: shortName(findRosterEntry(teams, state.bases.first).entry?.name),
                second: shortName(findRosterEntry(teams, state.bases.second).entry?.name),
                third: shortName(findRosterEntry(teams, state.bases.third).entry?.name),
              }}
            />
          </div>
        )}
      </div>

      {away && <TeamBox team={away} box={box} />}
      {home && <TeamBox team={home} box={box} />}
    </div>
  );
}
