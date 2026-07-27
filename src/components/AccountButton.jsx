import { useAuth } from "../context/AuthContext";

export default function AccountButton() {
  const { isGuest, isAuthed, logout } = useAuth();

  const handleClick = () => {
    if (isAuthed) {
      if (window.confirm("Log out?")) logout();
    } else if (isGuest) {
      logout();
    }
  };

  return (
    <button className="icon-btn" onClick={handleClick} aria-label={isAuthed ? "Log out" : "Log in"}>
      {isAuthed ? "🚪" : "🔑"}
    </button>
  );
}
