export default function BaseDiamond({ bases }) {
  const on = (b) => !!bases[b];
  return (
    <svg viewBox="0 0 100 100" className="base-diamond" role="img" aria-label="Baserunners">
      <rect
        x="43" y="8" width="24" height="24"
        transform="rotate(45 55 20)"
        className={`base ${on("second") ? "on" : ""}`}
      />
      <rect
        x="78" y="43" width="24" height="24"
        transform="rotate(45 90 55)"
        className={`base ${on("first") ? "on" : ""}`}
      />
      <rect
        x="8" y="43" width="24" height="24"
        transform="rotate(45 20 55)"
        className={`base ${on("third") ? "on" : ""}`}
      />
      <rect
        x="43" y="78" width="18" height="18"
        transform="rotate(45 52 87)"
        className="base home"
      />
    </svg>
  );
}
