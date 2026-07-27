import { createContext, useCallback, useContext, useMemo } from "react";
import { useStorage } from "../lib/useStorage";
import { makeId } from "../lib/id";
import { DEFAULT_RULES } from "../lib/rules";

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [teams, setTeams] = useStorage("teams", [], { shared: true });
  const [games, setGames] = useStorage("games", [], { shared: true });
  const [news, setNews] = useStorage("news", [], { shared: true });

  // --- Teams & rosters ---

  const createTeam = useCallback(
    (name, colorKey) => {
      const team = {
        id: makeId("team"),
        name,
        colorKey: colorKey || "grass",
        roster: [],
        rules: { ...DEFAULT_RULES },
        createdAt: Date.now(),
      };
      setTeams((prev) => [...prev, team]);
      return team;
    },
    [setTeams],
  );

  const updateTeam = useCallback(
    (teamId, patch) => {
      setTeams((prev) =>
        prev.map((t) => (t.id === teamId ? { ...t, ...patch } : t)),
      );
    },
    [setTeams],
  );

  const deleteTeam = useCallback(
    (teamId) => {
      setTeams((prev) => prev.filter((t) => t.id !== teamId));
    },
    [setTeams],
  );

  const addRosterEntry = useCallback(
    (teamId, entry) => {
      const rosterEntry = {
        name: entry.name,
        jerseyNumber: entry.jerseyNumber || "",
        position: entry.position || "",
        accountId: entry.accountId || null,
        ...entry,
        id: makeId("plyr"),
      };
      setTeams((prev) =>
        prev.map((t) =>
          t.id === teamId ? { ...t, roster: [...t.roster, rosterEntry] } : t,
        ),
      );
      return rosterEntry;
    },
    [setTeams],
  );

  const updateRosterEntry = useCallback(
    (teamId, entryId, patch) => {
      setTeams((prev) =>
        prev.map((t) =>
          t.id !== teamId
            ? t
            : {
                ...t,
                roster: t.roster.map((r) =>
                  r.id === entryId ? { ...r, ...patch } : r,
                ),
              },
        ),
      );
    },
    [setTeams],
  );

  const removeRosterEntry = useCallback(
    (teamId, entryId) => {
      setTeams((prev) =>
        prev.map((t) =>
          t.id !== teamId
            ? t
            : { ...t, roster: t.roster.filter((r) => r.id !== entryId) },
        ),
      );
    },
    [setTeams],
  );

  // Player self-service: link their account to a roster entry on a team,
  // creating the entry if they aren't already listed.
  const joinTeam = useCallback(
    (teamId, account, playerDetails = {}) => {
      setTeams((prev) =>
        prev.map((t) => {
          if (t.id !== teamId) return t;
          const already = t.roster.some((r) => r.accountId === account.id);
          if (already) return t;
          const entry = {
            id: makeId("plyr"),
            name: account.username,
            jerseyNumber: "",
            position: "",
            accountId: account.id,
            ...playerDetails,
          };
          return { ...t, roster: [...t.roster, entry] };
        }),
      );
    },
    [setTeams],
  );

  const leaveTeam = useCallback(
    (teamId, accountId) => {
      setTeams((prev) =>
        prev.map((t) =>
          t.id !== teamId
            ? t
            : { ...t, roster: t.roster.filter((r) => r.accountId !== accountId) },
        ),
      );
    },
    [setTeams],
  );

  // --- Games ---

  const createGame = useCallback(
    (config) => {
      const game = {
        id: makeId("game"),
        homeTeamId: config.homeTeamId,
        awayTeamId: config.awayTeamId,
        date: config.date || new Date().toISOString().slice(0, 10),
        rules: { ...DEFAULT_RULES, ...config.rules },
        lineups: { home: config.lineups.home, away: config.lineups.away },
        log: [],
        status: "in_progress",
        createdAt: Date.now(),
      };
      setGames((prev) => [...prev, game]);
      return game;
    },
    [setGames],
  );

  const appendPlay = useCallback(
    (gameId, outcome) => {
      setGames((prev) =>
        prev.map((g) =>
          g.id === gameId
            ? { ...g, log: [...g.log, { id: makeId("play"), outcome }] }
            : g,
        ),
      );
    },
    [setGames],
  );

  const addGhostRunner = useCallback(
    (gameId, base) => {
      setGames((prev) =>
        prev.map((g) =>
          g.id === gameId
            ? { ...g, log: [...g.log, { id: makeId("ghost"), type: "ghost", base }] }
            : g,
        ),
      );
    },
    [setGames],
  );

  const undoLastPlay = useCallback(
    (gameId) => {
      setGames((prev) =>
        prev.map((g) =>
          g.id === gameId ? { ...g, log: g.log.slice(0, -1) } : g,
        ),
      );
    },
    [setGames],
  );

  const updateLogEntry = useCallback(
    (gameId, entryId, patch) => {
      setGames((prev) =>
        prev.map((g) =>
          g.id !== gameId
            ? g
            : {
                ...g,
                log: g.log.map((e) => (e.id === entryId ? { ...e, ...patch } : e)),
              },
        ),
      );
    },
    [setGames],
  );

  const deleteLogEntry = useCallback(
    (gameId, entryId) => {
      setGames((prev) =>
        prev.map((g) =>
          g.id !== gameId
            ? g
            : { ...g, log: g.log.filter((e) => e.id !== entryId) },
        ),
      );
    },
    [setGames],
  );

  const finalizeGame = useCallback(
    (gameId) => {
      setGames((prev) =>
        prev.map((g) => (g.id === gameId ? { ...g, status: "final" } : g)),
      );
    },
    [setGames],
  );

  const reopenGame = useCallback(
    (gameId) => {
      setGames((prev) =>
        prev.map((g) => (g.id === gameId ? { ...g, status: "in_progress" } : g)),
      );
    },
    [setGames],
  );

  const deleteGame = useCallback(
    (gameId) => {
      setGames((prev) => prev.filter((g) => g.id !== gameId));
    },
    [setGames],
  );

  // --- News ---

  const postNews = useCallback(
    (teamId, authorAccountId, title, body) => {
      const post = {
        id: makeId("news"),
        teamId,
        authorAccountId,
        title,
        body,
        createdAt: Date.now(),
      };
      setNews((prev) => [post, ...prev]);
      return post;
    },
    [setNews],
  );

  const deleteNews = useCallback(
    (postId) => {
      setNews((prev) => prev.filter((n) => n.id !== postId));
    },
    [setNews],
  );

  const value = useMemo(
    () => ({
      teams,
      games,
      news,
      createTeam,
      updateTeam,
      deleteTeam,
      addRosterEntry,
      updateRosterEntry,
      removeRosterEntry,
      joinTeam,
      leaveTeam,
      createGame,
      appendPlay,
      addGhostRunner,
      undoLastPlay,
      updateLogEntry,
      deleteLogEntry,
      finalizeGame,
      reopenGame,
      deleteGame,
      postNews,
      deleteNews,
    }),
    [teams, games, news, createTeam, updateTeam, deleteTeam, addRosterEntry, updateRosterEntry, removeRosterEntry, joinTeam, leaveTeam, createGame, appendPlay, addGhostRunner, undoLastPlay, updateLogEntry, deleteLogEntry, finalizeGame, reopenGame, deleteGame, postNews, deleteNews],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
