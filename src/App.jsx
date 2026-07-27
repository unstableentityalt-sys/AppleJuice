import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";
import BottomNav from "./components/BottomNav";
import LandingScreen from "./screens/auth/LandingScreen";
import GamesListScreen from "./screens/shared/GamesListScreen";
import GameDetailScreen from "./screens/shared/GameDetailScreen";
import GameSetupScreen from "./screens/scorekeeper/GameSetupScreen";
import LiveRedirect from "./screens/scorekeeper/LiveRedirect";
import TeamsListScreen from "./screens/shared/TeamsListScreen";
import TeamDetailScreen from "./screens/shared/TeamDetailScreen";
import StatsScreen from "./screens/shared/StatsScreen";
import NewsScreen from "./screens/shared/NewsScreen";
import MyTeamScreen from "./screens/player/MyTeamScreen";
import MyStatsScreen from "./screens/player/MyStatsScreen";
import ProfileScreen from "./screens/player/ProfileScreen";

function DefaultRoute() {
  const { role } = useAuth();
  if (role === "player") return <Navigate to="/my-team" replace />;
  return <Navigate to="/games" replace />;
}

function AppRoutes() {
  const { role } = useAuth();

  if (!role) return <LandingScreen />;

  return (
    <div className="app-shell">
      <Routes>
        <Route path="/" element={<DefaultRoute />} />
        <Route path="/games" element={<GamesListScreen />} />
        <Route
          path="/games/new"
          element={role === "scorekeeper" ? <GameSetupScreen /> : <Navigate to="/games" replace />}
        />
        <Route path="/games/:gameId" element={<GameDetailScreen />} />
        <Route
          path="/live"
          element={role === "scorekeeper" ? <LiveRedirect /> : <Navigate to="/games" replace />}
        />
        <Route path="/teams" element={<TeamsListScreen />} />
        <Route path="/teams/:teamId" element={<TeamDetailScreen />} />
        <Route path="/stats" element={<StatsScreen />} />
        <Route path="/news" element={<NewsScreen />} />
        {role === "player" && (
          <>
            <Route path="/my-team" element={<MyTeamScreen />} />
            <Route path="/my-stats" element={<MyStatsScreen />} />
            <Route path="/profile" element={<ProfileScreen />} />
          </>
        )}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <BottomNav role={role} />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <AppRoutes />
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
