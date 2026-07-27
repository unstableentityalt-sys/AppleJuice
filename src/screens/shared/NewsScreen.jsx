import { useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import TopBar from "../../components/TopBar";
import AccountButton from "../../components/AccountButton";
import EmptyState from "../../components/EmptyState";
import { findTeam } from "../../lib/helpers";

export default function NewsScreen() {
  const { role, account } = useAuth();
  const { teams, news, postNews, deleteNews } = useData();
  const [filterTeam, setFilterTeam] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [postTeamId, setPostTeamId] = useState(teams[0]?.id || "");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const isScorekeeper = role === "scorekeeper";

  const filtered = useMemo(
    () => (filterTeam === "all" ? news : news.filter((n) => n.teamId === filterTeam)),
    [news, filterTeam],
  );

  function handlePost(e) {
    e.preventDefault();
    if (!title.trim() || !postTeamId) return;
    postNews(postTeamId, account.id, title.trim(), body.trim());
    setTitle("");
    setBody("");
    setShowForm(false);
  }

  return (
    <>
      <TopBar title="Team News" right={<AccountButton />} />
      <div className="app-main">
        {isScorekeeper && (
          <div className="section-title">
            <h2>Announcements</h2>
            <button className="btn small" onClick={() => setShowForm((s) => !s)}>
              {showForm ? "Cancel" : "+ Post News"}
            </button>
          </div>
        )}

        {isScorekeeper && showForm && (
          <form className="card" onSubmit={handlePost}>
            <div className="field">
              <label htmlFor="news-team">Team</label>
              <select
                id="news-team"
                value={postTeamId}
                onChange={(e) => setPostTeamId(e.target.value)}
              >
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="news-title">Title</label>
              <input
                id="news-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="news-body">Message</label>
              <textarea
                id="news-body"
                rows={4}
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
            </div>
            <button className="btn block" type="submit">
              Post
            </button>
          </form>
        )}

        <div className="field">
          <label htmlFor="news-filter">Filter by team</label>
          <select
            id="news-filter"
            value={filterTeam}
            onChange={(e) => setFilterTeam(e.target.value)}
          >
            <option value="all">All Teams</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        {filtered.length === 0 ? (
          <EmptyState emoji="📰" title="No news yet" hint="Check back after the next game." />
        ) : (
          <div className="stack">
            {filtered.map((n) => {
              const team = findTeam(teams, n.teamId);
              return (
                <div className="card" key={n.id}>
                  <div className="row between">
                    <span className="pill">{team?.name || "Team"}</span>
                    <span style={{ fontSize: 12, color: "var(--ink-soft)" }}>
                      {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 style={{ marginTop: 8 }}>{n.title}</h3>
                  {n.body && <p>{n.body}</p>}
                  {isScorekeeper && (
                    <button
                      className="btn ghost small"
                      style={{ color: "var(--danger)", marginTop: 8 }}
                      onClick={() => deleteNews(n.id)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
