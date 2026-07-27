import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import TopBar from "../../components/TopBar";
import AccountButton from "../../components/AccountButton";
import EmptyState from "../../components/EmptyState";
import SeriesBanner from "../../components/SeriesBanner";
import { initials, TEAM_COLORS } from "../../lib/helpers";

export default function MyTeamScreen() {
  const { account } = useAuth();
  const { teams, joinTeam, leaveTeam } = useData();

  const myTeams = teams.filter((t) => t.roster.some((r) => r.accountId === account.id));
  const otherTeams = teams.filter((t) => !t.roster.some((r) => r.accountId === account.id));

  return (
    <>
      <TopBar title="My Team" right={<AccountButton />} />
      <div className="app-main">
        <SeriesBanner />
        <div className="section-title">
          <h2>My Teams</h2>
        </div>
        {myTeams.length === 0 ? (
          <EmptyState emoji="🏟️" title="Not on a team yet" hint="Join one below to get started." />
        ) : (
          <div className="stack">
            {myTeams.map((team) => (
              <div className="card" key={team.id}>
                <div className="row between">
                  <Link to={`/teams/${team.id}`} className="row" style={{ textDecoration: "none", color: "inherit" }}>
                    <div className="avatar" style={{ background: TEAM_COLORS[team.colorKey] || TEAM_COLORS.grass }}>
                      {initials(team.name)}
                    </div>
                    <div>
                      <h3>{team.name}</h3>
                      <p style={{ color: "var(--ink-soft)", fontSize: 13 }}>
                        {team.roster.length} player{team.roster.length === 1 ? "" : "s"}
                      </p>
                    </div>
                  </Link>
                  <button
                    className="btn ghost small"
                    style={{ color: "var(--danger)" }}
                    onClick={() => {
                      if (window.confirm(`Leave ${team.name}?`)) leaveTeam(team.id, account.id);
                    }}
                  >
                    Leave
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="section-title">
          <h2>Join a Team</h2>
        </div>
        {otherTeams.length === 0 ? (
          <EmptyState emoji="🔍" title="No other teams to join" />
        ) : (
          <div className="stack">
            {otherTeams.map((team) => (
              <div className="card row between" key={team.id}>
                <div className="row">
                  <div className="avatar" style={{ background: TEAM_COLORS[team.colorKey] || TEAM_COLORS.grass }}>
                    {initials(team.name)}
                  </div>
                  <div>
                    <h3>{team.name}</h3>
                    <p style={{ color: "var(--ink-soft)", fontSize: 13 }}>
                      {team.roster.length} player{team.roster.length === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>
                <button className="btn small" onClick={() => joinTeam(team.id, account)}>
                  Join
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
