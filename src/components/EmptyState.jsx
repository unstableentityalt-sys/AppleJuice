export default function EmptyState({ emoji = "🥎", title, hint, action }) {
  return (
    <div className="empty-state">
      <div className="emoji">{emoji}</div>
      <h3>{title}</h3>
      {hint && <p>{hint}</p>}
      {action}
    </div>
  );
}
