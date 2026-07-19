# gh-game-factory

Autonomous factory that researches, invents, builds, tests, and ships **one
web-based game per day** to GitHub Pages under the `ben-gy` org — with
**zero-backend peer-to-peer multiplayer** for the games that want it.

Sibling to [`gh-site-factory`](https://github.com/ben-gy/gh-site-factory) (data
sites) and [`gh-tool-factory`](https://github.com/ben-gy/gh-tool-factory)
(browser tools). Every game appears automatically in the **Games** section of
[hub.benrichardson.dev](https://hub.benrichardson.dev).

## What it builds

- **Instantly playable** browser games — single-player first, always. No login,
  no install, works on phone and desktop.
- **Original games AND well-made classics** (no trademarked IP or assets).
- **Peer-to-peer multiplayer** where it fits, hosted entirely between players'
  browsers over WebRTC — **no per-game backend**. One player hosts a room, shares
  a link, friends join. Powered by [Trystero](https://github.com/dmotz/trystero)
  (public Nostr signaling) + the shared engine package
  [`ben-gy/gh-game-engine`](https://github.com/ben-gy/gh-game-engine). One shared
  first-party Worker ([`gh-game-infra`](https://github.com/ben-gy/gh-game-infra))
  mints TURN credentials so peers behind carrier NAT can connect at all; it
  carries no gameplay state.

## How the daily run works

The routine lives in `~/.claude/scheduled-tasks/gh-game-factory/SKILL.md` and runs
daily at **13:10 local**. Each run:

1. Takes the first idea from `IDEAS.md` (or researches/invents one).
2. Designs it, scaffolds a Vite + TypeScript project, and builds it — depending on
   the `@ben-gy/game-engine` package for loop, input, netcode, RNG, and sound.
3. Writes Vitest tests (including the P2P-sync determinism test for multiplayer).
4. Deploys to `ben-gy/<slug>` on GitHub Pages at `https://<slug>.benrichardson.dev`.
5. Opens a review PR, updates `registry.json` + `index/games.json`, and writes a
   build log. The hub picks it up on its next page load — no hub redeploy needed.

## Layout

```
IDEAS.md            # queue of game ideas (first one is built next)
EXPANSION_IDEAS.md  # enhancements to existing games (manual review, not new builds)
registry.json       # every game built — the dedupe source of truth
index/games.json    # public index the hub fetches (type: "game")
index/games.txt     # human-readable mirror
patterns/           # DEPRECATED — the engine moved to ben-gy/gh-game-engine
logs/               # per-build logs
games/              # built games (gitignored; each becomes its own ben-gy repo)
```

## Multiplayer, briefly

Host-authoritative star topology by default. The host owns authoritative state
and broadcasts snapshots, clients send inputs, and a host-broadcast seed keeps all
randomness in sync via the engine's `rng`.

The host is decided by **incumbency with terms**, not by an election on every
join: announcements carry `{host, epoch}`, the host announces and everyone else
adopts, and the role moves only when the host **leaves** (survivors elect min-id
at `epoch + 1`). A peer never self-elects while alone, because silence on a
roster of one is evidence of no mesh — not of an empty room.

> The old model — "smallest peer id, auto re-elects on every join" — is retired.
> It handed a live room to whoever arrived next if their random id sorted lower,
> with the new host holding none of the game state.

Rounds only start once the roster has been quiet for 4s, the host re-broadcasts
the start to anyone who connects mid-round, and `RoundInfo.seated` tells a peer
whether it is actually playing. Append `?netdebug=1` to any game for an overlay
showing host/epoch/settled, peers, TURN state and relay sockets.

See the [engine README](https://github.com/ben-gy/gh-game-engine) for the full
model. No accounts, and no gameplay data leaves the mesh — the signaling relay
and TURN only broker the WebRTC handshake.

## License

MIT
