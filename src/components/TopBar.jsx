import { useNavigate } from "react-router-dom";
import WiffleBallIcon from "./WiffleBallIcon";

export default function TopBar({ title, showBack = false, right = null }) {
  const navigate = useNavigate();
  return (
    <header className="topbar">
      {showBack ? (
        <button className="back-btn" onClick={() => navigate(-1)} aria-label="Back">
          ‹
        </button>
      ) : (
        <WiffleBallIcon className="ball-logo" />
      )}
      <h1>{title}</h1>
      {right}
    </header>
  );
}
