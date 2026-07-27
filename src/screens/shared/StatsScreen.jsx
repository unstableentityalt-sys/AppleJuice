import { useMemo, useState } from "react";
import { useData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";
import TopBar from "../../components/TopBar";
import AccountButton from "../../components/AccountButton";
import EmptyState from "../../components/EmptyState";
import StatsTable from "../../components/StatsTable";
import { computeSeasonStats, computeStandings } from "../../lib/stats";

export default function StatsScreen() {
  const { teams, games } = useData();
  const { role } = useAuth();
  const [teamId, setTeamId] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const rows = useMemo(() => {
    const totals = computeSeasonStats(games, {
      teamId: teamId === "all" ? null : teamId,
      from: from || null,
      to: to || null,
    });
    const out = [];
    for (const team of teams) {
      if (teamId !== "all" && team.id !== teamId) continue;
      for (const p of team.roster) {
        if (totals[p.id]) {
          out.push({ id: p.id, name: p.name, teamName: team.name, ...totals[p.id] });
        }
      }
    }
    return out;
  }, [games, teams, teamId, from, to]);

  const standings = useMemo(() => computeStandings(games, teams), [games, teams]);

  return (
    <>
      <TopBar title="Stats & Standings" right={<AccountButton />} />
      <div className="app-main">
        <div className="card">
          <div className="field">
            <label htmlFor="stats-team">Team</label>
            <select id="stats-team" value={teamId} onChange={(e) => setTeamId(e.target.value)}>
              <option value="all">All Teams</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <div className="row">
            <div className="field" style={{ flex: 1 }}>
              <label htmlFor="stats-from">From</label>
              <input id="stats-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label htmlFor="stats-to">To</label>
              <input id="stats-to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="section-title">
          <h2>Standings</h2>
        </div>
        {standings.length === 0 ? (
          <EmptyState emoji="🏆" title="No finished games yet" />
        ) : (
          <div className="card">
            <table className="stat-table">
              <thead>
                <tr>
                  <th>Team</th>
                  <th>W</th>
                  <th>L</th>
                  <th>T</th>
                  <th>RF</th>
                  <th>RA</th>
                </tr>
              </thead>
              <tbody>
                {standings
                  .slice()
                  .sort((a, b) => b.wins - a.wins || a.losses - b.losses)
                  .map((s) => {
                    const team = teams.find((t) => t.id === s.teamId);
                    return (
                      <tr key={s.teamId}>
                        <td>{team?.name}</td>
                        <td>{s.wins}</td>
                        <td>{s.losses}</td>
                        <td>{s.ties}</td>
                        <td>{s.runsFor}</td>
                        <td>{s.runsAgainst}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}

        <div className="section-title">
          <h2>Leaderboard</h2>
        </div>
        {rows.length === 0 ? (
          <EmptyState
            emoji="📊"
            title="No stats yet"
            hint={
              role === "scorekeeper"
                ? "Finish a scored game to populate stats."
                : "Stats appear once games are scored and finalized."
            }
          />
        ) : (
          <div className="card">
            <StatsTable rows={rows} />
          </div>
        )}
      </div>
    </>
  );
}
