import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import TopBar from "../../components/TopBar";
import EmptyState from "../../components/EmptyState";
import { findTeam } from "../../lib/helpers";
import LiveScoringScreen from "../scorekeeper/LiveScoringScreen";
import CorrectionsPanel from "../scorekeeper/CorrectionsPanel";
import BoxscoreView from "./BoxscoreView";

export default function GameDetailScreen() {
  const { gameId } = useParams();
  const { role } = useAuth();
  const { teams, games, deleteGame } = useData();
  const navigate = useNavigate();
  const game = games.find((g) => g.id === gameId);

  if (!game) {
    return (
      <>
        <TopBar title="Game" showBack />
        <div className="app-main">
          <EmptyState emoji="🤷" title="Game not found" />
        </div>
      </>
    );
  }

  const home = findTeam(teams, game.homeTeamId);
  const away = findTeam(teams, game.awayTeamId);
  const isScorekeeper = role === "scorekeeper";

  return (
    <>
      <TopBar
        title={`${away?.name || "Away"} @ ${home?.name || "Home"}`}
        showBack
        right={
          isScorekeeper && (
            <button
              className="icon-btn"
              aria-label="Delete game"
              onClick={() => {
                if (window.confirm("Delete this game entirely?")) {
                  deleteGame(game.id);
                  navigate("/games");
                }
              }}
            >
              🗑️
            </button>
          )
        }
      />
      {isScorekeeper ? (
        <>
          <LiveScoringScreen game={game} teams={teams} />
          <div style={{ padding: "0 16px 24px" }}>
            <CorrectionsPanel game={game} teams={teams} />
          </div>
        </>
      ) : (
        <BoxscoreView game={game} teams={teams} />
      )}
    </>
  );
}
