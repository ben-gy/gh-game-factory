# gh-game-factory

Autonomous factory that researches, invents, builds, tests, and ships **one
web-based game per day** to GitHub Pages under the `ben-gy` org — with
**zero-backend peer-to-peer multiplayer** for the games that want it.

Sibling to [`gh-site-factory`](https://github.com/ben-gy/gh-site-factory) (data
sites) and [`gh-tool-factory`](https://github.com/ben-gy/gh-tool-factory)
(browser tools). Every game appears automatically in the **Games** section of
[sites.benrichardson.dev](https://sites.benrichardson.dev).

## What it builds

- **Instantly playable** browser games — single-player first, always. No login,
  no install, works on phone and desktop.
- **Original games AND well-made classics** (no trademarked IP or assets).
- **Peer-to-peer multiplayer** where it fits, hosted entirely between players'
  browsers over WebRTC — **no game server**. One player hosts a room, shares a
  link, friends join. Powered by [Trystero](https://github.com/dmotz/trystero)
  (public Nostr/BitTorrent signaling) + the shared engine in [`patterns/`](./patterns).

## How the daily run works

The routine lives in `~/.claude/scheduled-tasks/gh-game-factory/SKILL.md` and runs
daily at **13:10 local**. Each run:

1. Takes the first idea from `IDEAS.md` (or researches/invents one).
2. Designs it, scaffolds a Vite + TypeScript project, and builds it — copying the
   proven `patterns/` engine for loop, input, netcode, RNG, and sound.
3. Writes Vitest tests (including the P2P-sync determinism test for multiplayer).
4. Deploys to `ben-gy/<slug>` on GitHub Pages at `https://<slug>.benrichardson.dev`.
5. Opens a review PR, updates `registry.json` + `index/games.json`, and writes a
   build log. The directory picks it up on its next page load — no redeploy needed.

## Layout

```
IDEAS.md            # queue of game ideas (first one is built next)
EXPANSION_IDEAS.md  # enhancements to existing games (manual review, not new builds)
registry.json       # every game built — the dedupe source of truth
index/games.json    # public index the directory fetches (type: "game")
index/games.txt     # human-readable mirror
patterns/           # the shared P2P game engine — copied into each game
logs/               # per-build logs
games/              # built games (gitignored; each becomes its own ben-gy repo)
```

## Multiplayer, briefly

Host-authoritative star topology by default: `net.ts` elects a host (smallest
peer id, auto re-elects), the host owns authoritative state and broadcasts
snapshots, clients send inputs, and a host-broadcast seed keeps all randomness in
sync via `rng.ts`. See [`patterns/README.md`](./patterns/README.md) for the full
model. No server, no accounts, no data leaves the mesh beyond the public
signaling relay.

## License

MIT
