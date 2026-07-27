import { createContext, useCallback, useContext, useEffect, useMemo } from "react";
import { useStorage } from "../lib/useStorage";
import { hashPassword, verifyPassword } from "../lib/hash";
import { makeId } from "../lib/id";

const AuthContext = createContext(null);

// Seeded on first load so this scorekeeper login works out of the box on any
// fresh browser, since there's no backend to provision it centrally.
const SEED_ACCOUNTS = [{ username: "JacobCole", password: "bwcmaine", role: "scorekeeper" }];

export function AuthProvider({ children }) {
  const [accounts, setAccounts] = useStorage("accounts", [], { shared: true });
  const [session, setSession] = useStorage(
    "session",
    { accountId: null, guest: false },
    { shared: false },
  );

  useEffect(() => {
    let cancelled = false;
    async function seed() {
      for (const seedAccount of SEED_ACCOUNTS) {
        const exists = accounts.some(
          (a) => a.username.toLowerCase() === seedAccount.username.toLowerCase(),
        );
        if (exists) continue;
        const passwordHash = await hashPassword(seedAccount.password);
        if (cancelled) return;
        const account = {
          id: makeId("acct"),
          username: seedAccount.username,
          passwordHash,
          role: seedAccount.role,
          createdAt: Date.now(),
        };
        setAccounts((prev) =>
          prev.some((a) => a.username.toLowerCase() === seedAccount.username.toLowerCase())
            ? prev
            : [...prev, account],
        );
      }
    }
    seed();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accounts.length]);

  const currentAccount = useMemo(
    () => accounts.find((a) => a.id === session.accountId) || null,
    [accounts, session.accountId],
  );

  const role = session.guest ? "fan" : currentAccount ? currentAccount.role : null;

  const register = useCallback(
    async (username, password, role) => {
      const clean = username.trim();
      if (!clean) return { ok: false, error: "Username is required." };
      if (password.length < 4)
        return { ok: false, error: "Password must be at least 4 characters." };
      const exists = accounts.some(
        (a) => a.username.toLowerCase() === clean.toLowerCase(),
      );
      if (exists) return { ok: false, error: "That username is already taken." };

      const passwordHash = await hashPassword(password);
      const account = {
        id: makeId("acct"),
        username: clean,
        passwordHash,
        role,
        createdAt: Date.now(),
      };
      setAccounts((prev) => [...prev, account]);
      setSession({ accountId: account.id, guest: false });
      return { ok: true, account };
    },
    [accounts, setAccounts, setSession],
  );

  const login = useCallback(
    async (username, password) => {
      const clean = username.trim();
      const account = accounts.find(
        (a) => a.username.toLowerCase() === clean.toLowerCase(),
      );
      if (!account) return { ok: false, error: "No account with that username." };
      const valid = await verifyPassword(password, account.passwordHash);
      if (!valid) return { ok: false, error: "Incorrect password." };
      setSession({ accountId: account.id, guest: false });
      return { ok: true, account };
    },
    [accounts, setSession],
  );

  const continueAsFan = useCallback(() => {
    setSession({ accountId: null, guest: true });
  }, [setSession]);

  const logout = useCallback(() => {
    setSession({ accountId: null, guest: false });
  }, [setSession]);

  const value = useMemo(
    () => ({
      accounts,
      account: currentAccount,
      role,
      isGuest: !!session.guest,
      isAuthed: !!currentAccount,
      register,
      login,
      logout,
      continueAsFan,
    }),
    [accounts, currentAccount, role, session.guest, register, login, logout, continueAsFan],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
