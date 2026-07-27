import { Link } from "react-router-dom";
import { findTeam, formatDate } from "../lib/helpers";
import { replayGame } from "../lib/gameEngine";

export default function GameCard({ game, teams }) {
  const home = findTeam(teams, game.homeTeamId);
  const away = findTeam(teams, game.awayTeamId);
  const state = replayGame(game);

  return (
    <Link to={`/games/${game.id}`} className="game-card card">
      <div className="row between">
        <span className="pill">{formatDate(game.date)}</span>
        {game.status === "in_progress" ? (
          <span className="pill sun">🔴 Live</span>
        ) : (
          <span className="pill">Final</span>
        )}
      </div>
      <div className="game-card-matchup">
        <div className="row between">
          <span>{away?.name || "Away"}</span>
          <strong>{state.totals.away}</strong>
        </div>
        <div className="row between">
          <span>{home?.name || "Home"}</span>
          <strong>{state.totals.home}</strong>
        </div>
      </div>
      {game.status === "in_progress" && (
        <p className="game-card-meta">
          {state.half === "top" ? "Top" : "Bot"} {state.inning} · {state.outs} out
          {state.outs === 1 ? "" : "s"}
        </p>
      )}
    </Link>
  );
}
