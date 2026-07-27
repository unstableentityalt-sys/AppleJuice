import { NavLink } from "react-router-dom";

const NAV_BY_ROLE = {
  scorekeeper: [
    { to: "/games", label: "Games", icon: "📋" },
    { to: "/live", label: "Live Score", icon: "🔴" },
    { to: "/stats", label: "Stats", icon: "📊" },
    { to: "/teams", label: "Teams", icon: "👥" },
  ],
  player: [
    { to: "/my-team", label: "My Team", icon: "🏟️" },
    { to: "/my-stats", label: "My Stats", icon: "📈" },
    { to: "/news", label: "News", icon: "📰" },
    { to: "/profile", label: "Profile", icon: "🙂" },
  ],
  fan: [
    { to: "/games", label: "Games", icon: "📋" },
    { to: "/stats", label: "Stats", icon: "📊" },
    { to: "/teams", label: "Teams", icon: "👥" },
    { to: "/news", label: "News", icon: "📰" },
  ],
};

export default function BottomNav({ role }) {
  const items = NAV_BY_ROLE[role] || NAV_BY_ROLE.fan;
  return (
    <nav className="bottom-nav">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <span className="nav-icon">{item.icon}</span>
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
