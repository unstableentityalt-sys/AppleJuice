# Backyard Boxscore

A mobile-first wiffleball scorekeeping app — "GameChanger for wiffleball." Built with
React + Vite, installable as a Home Screen app on iOS Safari.

## Access tiers

- **Scorekeeper** (login required) — creates/manages teams and rosters, runs live
  scorekeeping, corrects past games, posts team news.
- **Player** (login required) — joins teams, views a read-only personal stats
  dashboard, edits their own profile, views news.
- **Fan** ("Continue as Fan", no login) — read-only games, live scores, team pages,
  standings, leaderboards, and news.

Only the Scorekeeper role can log at-bats. Every stat anywhere in the app is derived
by replaying scorekeeper-entered game logs — players and fans can never edit stats
directly.

## Wiffleball rules (configurable per game)

- Innings (3/5/7) and outs per inning
- Traditional bases with runner advancement, or a zone/no-baserunning mode
- Walks can be disabled entirely
- Outcomes: Single, Double, Triple, Home Run, Walk, Strikeout, Groundout, Flyout,
  Foul Out

## Development

```bash
npm install
npm run dev      # start the dev server
npm run build    # production build to dist/
npm run lint     # oxlint
```

## Data & auth

Everything is stored client-side via a small `window.storage` wrapper over
`localStorage` (see `src/lib/storage.js`) — there is no backend. Teams, games, and
news are namespaced as "shared" league data; sessions and profile edits are
namespaced "local". Passwords are hashed client-side (SHA-256 + salt) before
storage — this is lightweight demo auth, not production-grade security.

## Icons

`scripts/icon-source.svg` is the master icon; `scripts/gen-icons.mjs` (via `sharp`)
rasterizes it into the PWA icons and apple-touch-icon in `public/`. Regenerate with:

```bash
node scripts/gen-icons.mjs
```
