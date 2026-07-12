# patterns/ — the shared P2P game engine

Proven, production-tested building blocks. **Copy the files you need into a
game's `src/` and adapt them — do NOT re-roll the netcode, the game loop, or the
RNG.** Hand-rolled variants are how desyncs and frame-rate bugs ship.

Every file is dependency-light vanilla TypeScript (the only npm dependency is
`trystero`, used by `net.ts`).

| File | What it gives you | When to copy |
|------|-------------------|--------------|
| `net.ts` | Zero-backend P2P mesh (Trystero/WebRTC). Peer roster, deterministic host election, typed channels, latency ping. | Every multiplayer game. |
| `lobby.ts` | Drop-in lobby UI: room code, invite link + Web Share, player roster, ready states, host-only Start, shared-seed broadcast. | Every multiplayer game. |
| `rng.ts` | Seedable deterministic PRNG (mulberry32) + shuffle/pick/randInt. Keeps peers in sync. | Any game with shared randomness (decks, spawns, boards). |
| `loop.ts` | Fixed-timestep loop with render interpolation. Frame-rate-independent physics, no spiral-of-death. | Any real-time / animated game. |
| `input.ts` | Unified keyboard + touch (auto virtual D-pad) + pointer, polled + edge-triggered. | Every game (mobile support is mandatory). |
| `sound.ts` | Procedural Web Audio SFX — zero asset files, works offline. | Any game wanting juice. |
| `storage.ts` | Namespaced, quota-safe localStorage for settings + local high-score boards. | Most games. |
| `tests/rng.test.ts` | Template proving the P2P-sync determinism invariant. | Copy + extend for any game with shared randomness. |

## The netcode model (read before building multiplayer)

**Host-authoritative star** is the default and fits almost every casual game:

1. Everyone joins the same Trystero room (`appId` = repo slug, `roomId` = the
   shareable room code). Trystero does the WebRTC handshake over free public
   Nostr relays — **no server of ours**, which is exactly what GitHub Pages needs.
2. `net.ts` elects a **host** = the lexicographically smallest peer id. Every peer
   computes this independently from the same sorted roster, so they all agree with
   no handshake, and it **re-elects automatically** if the host leaves.
3. The **host owns authoritative state**, advances the simulation, and broadcasts
   snapshots on a channel (e.g. `'snap'`). **Clients send inputs** to the host
   (e.g. `'in'`) and render the snapshots they receive (interpolating with
   `loop.ts`'s `alpha`).
4. Shared randomness comes from a **seed the host broadcasts at start** (the lobby
   does this) fed into `rng.ts`, so no random outcome ever needs syncing.

For deterministic **lockstep** games (RTS-style, puzzle races), skip snapshots:
every peer runs the same `rng.ts` seed + the same fixed `loop.ts` step and
exchanges only inputs. Determinism does the rest.

### Channel budget

Trystero action (channel) names must be **≤ 12 bytes**. Keep them terse: `snap`,
`in`, `mv`, `chat`. `net.ts` throws in dev if you exceed it.

### Signaling strategy fallback

`net.ts` imports Trystero's default `nostr` strategy (public relays, no keys). If
connections are flaky, switch the import to `trystero/torrent` (BitTorrent
trackers) or `trystero/mqtt` (public brokers) — the wrapper API is identical.
Pass a `password` to `createNet` to end-to-end-encrypt a private room.

## Non-negotiables for every game

- **Single-player playable instantly.** Multiplayer is an *option* behind a room
  link — never a requirement to see the game. A dead lobby must never be a dead site.
- **Mobile + desktop.** Touch controls (via `input.ts`) and a responsive canvas
  are mandatory. Test at ~375px.
- **Offline-capable.** No CDN assets, no third-party fonts, procedural audio.
- **Respects `prefers-reduced-motion`** and is colour-blind-friendly.
- **The Cloudflare Web Analytics beacon is the only network call** the base game
  makes; multiplayer adds only the P2P signaling relay. Both are disclosed.
