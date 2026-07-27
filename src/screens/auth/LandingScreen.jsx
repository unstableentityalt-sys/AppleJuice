import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import WiffleBallIcon from "../../components/WiffleBallIcon";
import "./LandingScreen.css";

export default function LandingScreen() {
  const { login, register, continueAsFan } = useAuth();
  const [mode, setMode] = useState("login"); // 'login' | 'register'
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("player");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const result =
      mode === "login"
        ? await login(username, password)
        : await register(username, password, role);
    setBusy(false);
    if (!result.ok) setError(result.error);
  }

  return (
    <div className="landing">
      <div className="landing-hero">
        <WiffleBallIcon className="landing-ball" />
        <h1>Backyard Boxscore</h1>
        <p className="tagline">Wiffleball scorekeeping, dugout to porch.</p>
      </div>

      <div className="landing-card">
        <div className="mode-toggle">
          <button
            className={mode === "login" ? "active" : ""}
            onClick={() => setMode("login")}
            type="button"
          >
            Log In
          </button>
          <button
            className={mode === "register" ? "active" : ""}
            onClick={() => setMode("register")}
            type="button"
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              placeholder="e.g. sluggerdad"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              placeholder="At least 4 characters"
              required
            />
          </div>

          {mode === "register" && (
            <div className="field">
              <label>I am a...</label>
              <div className="role-pick">
                <button
                  type="button"
                  className={role === "player" ? "active" : ""}
                  onClick={() => setRole("player")}
                >
                  🙂 Player
                </button>
                <button
                  type="button"
                  className={role === "scorekeeper" ? "active" : ""}
                  onClick={() => setRole("scorekeeper")}
                >
                  📋 Scorekeeper
                </button>
              </div>
            </div>
          )}

          {error && <p className="error-text">{error}</p>}

          <button className="btn block" type="submit" disabled={busy}>
            {mode === "login" ? "Log In" : "Create Account"}
          </button>
        </form>

        <div className="or-divider">
          <span>or</span>
        </div>

        <button className="btn secondary block" onClick={continueAsFan} type="button">
          ⚾ Continue as Fan
        </button>
        <p className="fan-hint">
          Fans get read-only access to games, standings, and news — no account needed.
        </p>
      </div>
    </div>
  );
}
