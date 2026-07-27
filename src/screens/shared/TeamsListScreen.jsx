import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import TopBar from "../../components/TopBar";
import AccountButton from "../../components/AccountButton";
import EmptyState from "../../components/EmptyState";
import { initials } from "../../lib/helpers";
import { TEAM_COLORS } from "../../lib/helpers";

export default function TeamsListScreen() {
  const { role } = useAuth();
  const { teams, createTeam } = useData();
  const navigate = useNavigate();
  const [showNew, setShowNew] = useState(false);
  const [name, setName] = useState("");
  const [colorKey, setColorKey] = useState("grass");

  const isScorekeeper = role === "scorekeeper";

  function handleCreate(e) {
    e.preventDefault();
    if (!name.trim()) return;
    const team = createTeam(name.trim(), colorKey);
    setName("");
    setShowNew(false);
    navigate(`/teams/${team.id}`);
  }

  return (
    <>
      <TopBar title="Teams" right={<AccountButton />} />
      <div className="app-main">
        {isScorekeeper && (
          <div className="section-title">
            <h2>All Teams</h2>
            <button className="btn small" onClick={() => setShowNew((s) => !s)}>
              {showNew ? "Cancel" : "+ New Team"}
            </button>
          </div>
        )}

        {showNew && (
          <form className="card" onSubmit={handleCreate}>
            <div className="field">
              <label htmlFor="team-name">Team name</label>
              <input
                id="team-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Porch Pirates"
                required
              />
            </div>
            <div className="field">
              <label>Color</label>
              <div className="row" style={{ flexWrap: "wrap" }}>
                {Object.keys(TEAM_COLORS).map((key) => (
                  <button
                    type="button"
                    key={key}
                    onClick={() => setColorKey(key)}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: TEAM_COLORS[key],
                      border: colorKey === key ? "3px solid var(--ink)" : "2px solid transparent",
                      cursor: "pointer",
                    }}
                    aria-label={key}
                  />
                ))}
              </div>
            </div>
            <button className="btn block" type="submit">
              Create Team
            </button>
          </form>
        )}

        {teams.length === 0 ? (
          <EmptyState
            emoji="🏟️"
            title="No teams yet"
            hint={
              isScorekeeper
                ? "Create your first team to start building rosters."
                : "Check back once a scorekeeper sets up some teams."
            }
          />
        ) : (
          <div className="stack">
            {teams.map((team) => (
              <button
                key={team.id}
                className="card team-list-row"
                onClick={() => navigate(`/teams/${team.id}`)}
                style={{ textAlign: "left", cursor: "pointer" }}
              >
                <div className="row between">
                  <div className="row">
                    <div
                      className="avatar"
                      style={{ background: TEAM_COLORS[team.colorKey] || TEAM_COLORS.grass }}
                    >
                      {initials(team.name)}
                    </div>
                    <div>
                      <h3>{team.name}</h3>
                      <p style={{ color: "var(--ink-soft)", fontSize: 13 }}>
                        {team.roster.length} player{team.roster.length === 1 ? "" : "s"}
                      </p>
                    </div>
                  </div>
                  <span>›</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
