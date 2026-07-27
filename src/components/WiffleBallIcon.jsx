export default function WiffleBallIcon({ className, size }) {
  const style = size ? { width: size, height: size } : undefined;
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      style={style}
      role="img"
      aria-label="Wiffle ball"
    >
      <circle cx="50" cy="50" r="47" fill="var(--ball, #fefdf6)" stroke="var(--ink, #1e2b19)" strokeWidth="3" />
      <g fill="var(--ink, #1e2b19)">
        <ellipse cx="32" cy="30" rx="6" ry="8" />
        <ellipse cx="58" cy="24" rx="6" ry="8" />
        <ellipse cx="74" cy="42" rx="6" ry="8" transform="rotate(60 74 42)" />
        <ellipse cx="70" cy="66" rx="6" ry="8" transform="rotate(120 70 66)" />
        <ellipse cx="42" cy="76" rx="6" ry="8" transform="rotate(20 42 76)" />
        <ellipse cx="20" cy="58" rx="6" ry="8" transform="rotate(-30 20 58)" />
        <ellipse cx="50" cy="50" rx="6" ry="8" transform="rotate(45 50 50)" />
      </g>
    </svg>
  );
}
