import { GHOST_RUNNER } from "../lib/rules";

const POSITIONS = {
  second: { top: "6%", left: "50%" },
  first: { top: "42%", left: "84%" },
  third: { top: "42%", left: "16%" },
};

export default function BaseDiamond({ bases, labels = {}, onAddGhost }) {
  const on = (b) => !!bases[b];

  return (
    <div className="base-diamond-wrap">
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
      {["first", "second", "third"].map((base) => {
        const occupant = bases[base];
        const isGhost = occupant === GHOST_RUNNER;
        return (
          <div key={base} className="base-label-slot" style={POSITIONS[base]}>
            {occupant ? (
              <span className={`base-chip ${isGhost ? "ghost" : ""}`}>
                {isGhost ? "👻 Ghost" : labels[base] || "On base"}
              </span>
            ) : (
              onAddGhost && (
                <button
                  type="button"
                  className="base-add-ghost"
                  onClick={() => onAddGhost(base)}
                  aria-label={`Add ghost runner to ${base} base`}
                >
                  + 👻
                </button>
              )
            )}
          </div>
        );
      })}
    </div>
  );
}
