import { Navigate } from "react-router-dom";
import { useData } from "../../context/DataContext";

export default function LiveRedirect() {
  const { games } = useData();
  const active = games.find((g) => g.status === "in_progress");
  return <Navigate to={active ? `/games/${active.id}` : "/games/new"} replace />;
}
