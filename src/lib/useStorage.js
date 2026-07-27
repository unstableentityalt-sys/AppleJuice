import { useCallback, useSyncExternalStore } from "react";
import { storage } from "./storage";

// React binding over window.storage so components re-render when the
// underlying key changes (same tab or another tab).
export function useStorage(key, defaultValue, { shared = true } = {}) {
  const getSnapshot = useCallback(
    () => JSON.stringify(storage.get(key, { shared, fallback: defaultValue })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key, shared],
  );

  const subscribeFn = useCallback(
    (onChange) => storage.subscribe(key, { shared }, onChange),
    [key, shared],
  );

  const snapshot = useSyncExternalStore(subscribeFn, getSnapshot, getSnapshot);
  const value = JSON.parse(snapshot);

  const setValue = useCallback(
    (next) => {
      const resolved =
        typeof next === "function"
          ? next(storage.get(key, { shared, fallback: defaultValue }))
          : next;
      storage.set(key, resolved, { shared });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key, shared],
  );

  return [value, setValue];
}
