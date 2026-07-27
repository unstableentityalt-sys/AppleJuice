export function findTeam(teams, teamId) {
  return teams.find((t) => t.id === teamId) || null;
}

export function findRosterEntry(teams, rosterId) {
  for (const team of teams) {
    const entry = team.roster.find((r) => r.id === rosterId);
    if (entry) return { entry, team };
  }
  return { entry: null, team: null };
}

export function playerName(teams, rosterId) {
  const { entry } = findRosterEntry(teams, rosterId);
  return entry ? entry.name : "Unknown";
}

export function initials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export const TEAM_COLORS = {
  grass: "#3f7d3a",
  sun: "#d99f1f",
  sky: "#3a7fa6",
  dirt: "#8a5a2b",
  plum: "#7a4a8a",
  crimson: "#a53f3f",
};
