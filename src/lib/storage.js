// Lightweight window.storage abstraction used throughout the app.
// `shared` groups data that represents the "league" dataset (teams, games,
// news, accounts). `local` groups per-device data (session, profile edits).
// Both live in localStorage under this demo build - there is no backend -
// the flag only records intent so the data model matches the product spec.

const EVENT_NAME = "wiffle-storage-update";

function fullKey(key, shared) {
  return `${shared ? "shared" : "local"}:${key}`;
}

function safeParse(raw, fallback) {
  if (raw == null) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function get(key, { shared = true, fallback = undefined } = {}) {
  const raw = window.localStorage.getItem(fullKey(key, shared));
  return safeParse(raw, fallback);
}

function set(key, value, { shared = true } = {}) {
  const fk = fullKey(key, shared);
  window.localStorage.setItem(fk, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { key: fk } }));
}

function remove(key, { shared = true } = {}) {
  const fk = fullKey(key, shared);
  window.localStorage.removeItem(fk);
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { key: fk } }));
}

function subscribe(key, { shared = true } = {}, callback) {
  const fk = fullKey(key, shared);
  const handler = (e) => {
    if (!e.detail || e.detail.key === fk) callback();
  };
  const storageHandler = (e) => {
    if (e.key === fk) callback();
  };
  window.addEventListener(EVENT_NAME, handler);
  window.addEventListener("storage", storageHandler);
  return () => {
    window.removeEventListener(EVENT_NAME, handler);
    window.removeEventListener("storage", storageHandler);
  };
}

if (typeof window !== "undefined" && !window.storage) {
  window.storage = { get, set, remove, subscribe };
}

export const storage = { get, set, remove, subscribe };
