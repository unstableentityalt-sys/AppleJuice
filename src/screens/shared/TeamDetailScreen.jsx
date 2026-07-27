import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import TopBar from "../../components/TopBar";
import EmptyState from "../../components/EmptyState";
import { initials, TEAM_COLORS } from "../../lib/helpers";
import { INNINGS_OPTIONS, OUTS_OPTIONS } from "../../lib/rules";

const POSITIONS = ["Pitcher", "Catcher", "1B", "2B", "3B", "SS", "LF", "CF", "RF", "Utility"];

export default function TeamDetailScreen() {
  const { teamId } = useParams();
  const { role } = useAuth();
  const { teams, news, updateTeam, deleteTeam, addRosterEntry, updateRosterEntry, removeRosterEntry } =
    useData();
  const navigate = useNavigate();
  const team = teams.find((t) => t.id === teamId);

  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newJersey, setNewJersey] = useState("");
  const [newPosition, setNewPosition] = useState("Utility");
  const [editingId, setEditingId] = useState(null);
  const [showRules, setShowRules] = useState(false);

  const isScorekeeper = role === "scorekeeper";

  if (!team) {
    return (
      <>
        <TopBar title="Team" showBack />
        <div className="app-main">
          <EmptyState emoji="🤷" title="Team not found" />
        </div>
      </>
    );
  }

  const teamNews = news.filter((n) => n.teamId === team.id).slice(0, 3);

  function handleAddPlayer(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    addRosterEntry(team.id, {
      name: newName.trim(),
      jerseyNumber: newJersey.trim(),
      position: newPosition,
    });
    setNewName("");
    setNewJersey("");
    setNewPosition("Utility");
    setShowAdd(false);
  }

  function handleDeleteTeam() {
    if (window.confirm(`Delete ${team.name}? This cannot be undone.`)) {
      deleteTeam(team.id);
      navigate("/teams");
    }
  }

  return (
    <>
      <TopBar title={team.name} showBack />
      <div className="app-main">
        <div className="card">
          <div className="row between">
            <div className="row">
              <div className="avatar" style={{ background: TEAM_COLORS[team.colorKey] || TEAM_COLORS.grass }}>
                {initials(team.name)}
              </div>
              <div>
                <h2>{team.name}</h2>
                <p style={{ color: "var(--ink-soft)", fontSize: 13 }}>
                  {team.roster.length} player{team.roster.length === 1 ? "" : "s"} ·{" "}
                  {team.rules.innings} inn · {team.rules.baseRunning === "zone" ? "Zone" : "Bases"}
                </p>
              </div>
            </div>
          </div>
          {isScorekeeper && (
            <div className="row" style={{ marginTop: 12 }}>
              <button className="btn small secondary" onClick={() => setShowRules((s) => !s)}>
                ⚙️ Game Rules
              </button>
              <button className="btn small danger" onClick={handleDeleteTeam}>
                Delete Team
              </button>
            </div>
          )}
        </div>

        {isScorekeeper && showRules && (
          <TeamRulesForm team={team} onSave={(rules) => updateTeam(team.id, { rules })} />
        )}

        <div className="section-title">
          <h2>Roster</h2>
          {isScorekeeper && (
            <button className="btn small" onClick={() => setShowAdd((s) => !s)}>
              {showAdd ? "Cancel" : "+ Add Player"}
            </button>
          )}
        </div>

        {isScorekeeper && showAdd && (
          <form className="card" onSubmit={handleAddPlayer}>
            <div className="field">
              <label htmlFor="player-name">Name</label>
              <input
                id="player-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
              />
            </div>
            <div className="row">
              <div className="field" style={{ flex: 1 }}>
                <label htmlFor="player-jersey">Jersey #</label>
                <input
                  id="player-jersey"
                  value={newJersey}
                  onChange={(e) => setNewJersey(e.target.value)}
                />
              </div>
              <div className="field" style={{ flex: 2 }}>
                <label htmlFor="player-pos">Position</label>
                <select
                  id="player-pos"
                  value={newPosition}
                  onChange={(e) => setNewPosition(e.target.value)}
                >
                  {POSITIONS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button className="btn block" type="submit">
              Add to Roster
            </button>
          </form>
        )}

        {team.roster.length === 0 ? (
          <EmptyState emoji="🧢" title="No players yet" />
        ) : (
          <div className="stack">
            {team.roster.map((p) =>
              editingId === p.id ? (
                <RosterEditRow
                  key={p.id}
                  entry={p}
                  onCancel={() => setEditingId(null)}
                  onSave={(patch) => {
                    updateRosterEntry(team.id, p.id, patch);
                    setEditingId(null);
                  }}
                />
              ) : (
                <div key={p.id} className="card row between">
                  <div className="row">
                    <div className="avatar">
                      {p.photo ? <img src={p.photo} alt="" /> : initials(p.name)}
                    </div>
                    <div>
                      <h3>
                        {p.name}{" "}
                        {p.jerseyNumber && (
                          <span className="jersey-number">#{p.jerseyNumber}</span>
                        )}
                      </h3>
                      <p style={{ color: "var(--ink-soft)", fontSize: 13 }}>{p.position}</p>
                    </div>
                  </div>
                  {isScorekeeper && (
                    <div className="row">
                      <button className="btn ghost small" onClick={() => setEditingId(p.id)}>
                        Edit
                      </button>
                      <button
                        className="btn ghost small"
                        style={{ color: "var(--danger)" }}
                        onClick={() => {
                          if (window.confirm(`Remove ${p.name} from roster?`)) {
                            removeRosterEntry(team.id, p.id);
                          }
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              ),
            )}
          </div>
        )}

        <div className="section-title">
          <h2>Team News</h2>
          <Link to="/news" className="btn ghost small">
            See all
          </Link>
        </div>
        {teamNews.length === 0 ? (
          <EmptyState emoji="📰" title="No news posted yet" />
        ) : (
          <div className="stack">
            {teamNews.map((n) => (
              <div className="card" key={n.id}>
                <h3>{n.title}</h3>
                <p>{n.body}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function RosterEditRow({ entry, onSave, onCancel }) {
  const [name, setName] = useState(entry.name);
  const [jerseyNumber, setJerseyNumber] = useState(entry.jerseyNumber);
  const [position, setPosition] = useState(entry.position);

  return (
    <form
      className="card"
      onSubmit={(e) => {
        e.preventDefault();
        onSave({ name, jerseyNumber, position });
      }}
    >
      <div className="field">
        <label>Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="row">
        <div className="field" style={{ flex: 1 }}>
          <label>Jersey #</label>
          <input value={jerseyNumber} onChange={(e) => setJerseyNumber(e.target.value)} />
        </div>
        <div className="field" style={{ flex: 2 }}>
          <label>Position</label>
          <select value={position} onChange={(e) => setPosition(e.target.value)}>
            {POSITIONS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="row">
        <button className="btn small" type="submit">
          Save
        </button>
        <button className="btn ghost small" type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

function TeamRulesForm({ team, onSave }) {
  const [rules, setRules] = useState(team.rules);

  function save() {
    onSave(rules);
  }

  return (
    <div className="card">
      <h3>Default Game Rules</h3>
      <p style={{ fontSize: 12, color: "var(--ink-soft)", marginBottom: 10 }}>
        House rules vary — set the defaults for new games with this team. You can still
        override per game at setup.
      </p>
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
      <button className="btn block" onClick={save} type="button">
        Save Rules
      </button>
    </div>
  );
}
