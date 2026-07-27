import { useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import TopBar from "../../components/TopBar";
import AccountButton from "../../components/AccountButton";
import EmptyState from "../../components/EmptyState";
import { computeSeasonStats, average, formatAvg } from "../../lib/stats";

export default function MyStatsScreen() {
  const { account } = useAuth();
  const { teams, games } = useData();

  const totals = useMemo(() => computeSeasonStats(games), [games]);

  const myLines = teams
    .map((team) => {
      const entry = team.roster.find((r) => r.accountId === account.id);
      if (!entry) return null;
      const line = totals[entry.id];
      return { team, entry, line: line || { AB: 0, H: 0, HR: 0, BB: 0, K: 0, RBI: 0 } };
    })
    .filter(Boolean);

  return (
    <>
      <TopBar title="My Stats" right={<AccountButton />} />
      <div className="app-main">
        {myLines.length === 0 ? (
          <EmptyState
            emoji="📈"
            title="No stats yet"
            hint="Join a team and play in a scored game — your stats are calculated automatically from the scorekeeper's game log."
          />
        ) : (
          <div className="stack">
            {myLines.map(({ team, line }) => (
              <div className="card" key={team.id}>
                <h3>{team.name}</h3>
                <div style={{ overflowX: "auto" }}>
                  <table className="stat-table">
                    <thead>
                      <tr>
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
                      <tr>
                        <td>{line.AB}</td>
                        <td>{line.H}</td>
                        <td>{line.HR}</td>
                        <td>{line.RBI}</td>
                        <td>{line.BB}</td>
                        <td>{line.K}</td>
                        <td>{formatAvg(average(line))}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
            <p style={{ fontSize: 12, color: "var(--ink-soft)", textAlign: "center" }}>
              Stats are calculated automatically from scorekeeper game logs and can't be
              edited here.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
