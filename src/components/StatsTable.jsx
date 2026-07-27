import { useState, useMemo } from "react";
import { average, formatAvg } from "../lib/stats";

const COLUMNS = [
  { key: "name", label: "Player" },
  { key: "AB", label: "AB" },
  { key: "H", label: "H" },
  { key: "HR", label: "HR" },
  { key: "RBI", label: "RBI" },
  { key: "BB", label: "BB" },
  { key: "K", label: "K" },
  { key: "AVG", label: "AVG" },
];

export default function StatsTable({ rows }) {
  const [sortKey, setSortKey] = useState("AVG");
  const [sortDir, setSortDir] = useState("desc");

  const enriched = useMemo(
    () => rows.map((r) => ({ ...r, AVG: average(r) })),
    [rows],
  );

  const sorted = useMemo(() => {
    const copy = [...enriched];
    copy.sort((a, b) => {
      let av = a[sortKey];
      let bv = b[sortKey];
      if (typeof av === "string") {
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return sortDir === "asc" ? av - bv : bv - av;
    });
    return copy;
  }, [enriched, sortKey, sortDir]);

  function toggleSort(key) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table className="stat-table">
        <thead>
          <tr>
            {COLUMNS.map((col) => (
              <th key={col.key} onClick={() => toggleSort(col.key)}>
                {col.label}
                {sortKey === col.key ? (sortDir === "asc" ? " ▲" : " ▼") : ""}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((r) => (
            <tr key={r.id}>
              <td>{r.name}</td>
              <td>{r.AB}</td>
              <td>{r.H}</td>
              <td>{r.HR}</td>
              <td>{r.RBI}</td>
              <td>{r.BB}</td>
              <td>{r.K}</td>
              <td>{formatAvg(r.AVG)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
