import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import TopBar from "../../components/TopBar";
import AccountButton from "../../components/AccountButton";
import EmptyState from "../../components/EmptyState";
import GameCard from "../../components/GameCard";

export default function GamesListScreen() {
  const { role } = useAuth();
  const { teams, games } = useData();
  const navigate = useNavigate();
  const isScorekeeper = role === "scorekeeper";

  const sorted = [...games].sort((a, b) => {
    if (a.status !== b.status) return a.status === "in_progress" ? -1 : 1;
    return b.createdAt - a.createdAt;
  });

  return (
    <>
      <TopBar
        title="Games"
        right={
          <div className="row">
            {isScorekeeper && (
              <button className="icon-btn" aria-label="New game" onClick={() => navigate("/games/new")}>
                ＋
              </button>
            )}
            <AccountButton />
          </div>
        }
      />
      <div className="app-main">
        {sorted.length === 0 ? (
          <EmptyState
            emoji="⚾"
            title="No games yet"
            hint={isScorekeeper ? "Start your first game to begin scorekeeping." : "Check back once a game is scheduled."}
            action={
              isScorekeeper && (
                <button className="btn" onClick={() => navigate("/games/new")}>
                  + New Game
                </button>
              )
            }
          />
        ) : (
          <div className="stack">
            {sorted.map((g) => (
              <GameCard key={g.id} game={g} teams={teams} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
