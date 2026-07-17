# Build Log: Snake Royale
**Date:** 2026-07-15
**Status:** deployed

## Idea Source
IDEAS.md (first item), quoted: "Snake Royale — classic snake but 2–6 snakes share one arena over P2P; eat, grow, cut others off." Removed from the queue on pickup.

## Game Details
- **Name / repo:** Snake Royale / ben-gy/snake-royale
- **Genre:** arcade
- **Core loop:** Steer a constantly-moving snake, eat pellets to grow + score, avoid walls/other snakes/your own tail. Solo = endless score-attack with a speed ramp; Royale = last-snake-standing for 2–6.
- **Multiplayer:** live P2P — host-authoritative star, up to 6 players. Host runs the grid sim on a fixed `setInterval` tick and broadcasts a full state snapshot each tick; clients send only direction intent. Automatic host transfer.
- **Stack / render:** vanilla-ts / canvas
- **Engine modules used:** loop (rAF render), input (keyboard + touch D-pad), net, lobby (+ room-entry), rng, sound, storage

## Juice
Interpolated snake motion between grid ticks, gold pellet pop particles, full-body burst + screen shake + noise on death, procedural SFX (eat rises in pitch with combo, crash/die, countdown beeps, win/lose), 3-2-1 "Go!" countdown, pulsing border glow, Okabe–Ito colour-blind-safe snake hues with per-seat head/tail glyph. Honours prefers-reduced-motion (no shake, fewer particles).

## Test Results
- Tests written / passed / failed: 31 / 31 / 0
- P2P-sync determinism test: pass (two peers build identical boards + food from one seed)
- Host-transfer takeover test: pass (a client does not advance the sim; once promoted it drives the round to game-over)
- Room-code normalization test: pass
- Snapshot serialization round-trip: pass

## Build Status
- npm install: pass
- npm test: pass (31/31)
- npm run build: pass (tsc + vite, ~62 KB JS / 24 KB gzip)
- local play (solo): pass — steered, ate a pellet (score 1 / length 4), crash → results, best-score persisted; 375px mobile layout fits with no horizontal overflow
- multiplayer smoke (two tabs, live public relay): pass — typed lower-case code "e2wf" → normalized to same room E2WF; roster + ready + host-start synced; both peers saw both snakes; **host tab closed mid-countdown → survivor promoted, countdown + round played out to a valid "Koi wins" game-over (no freeze)**; the departed peer's snake kept being simulated (peer-leave grace)

## Deployment
- Repo created: ben-gy/snake-royale (public)
- Pages enabled (Actions workflow); deploy run: success
- Cloudflare DNS CNAME snake-royale → ben-gy.github.io created; Pages CNAME set + cycled for TLS
- PR: https://github.com/ben-gy/snake-royale/pull/1

## Errors & Resolutions
- `tsc` failed on the copied `net.ts`: Trystero 0.21 constrains `makeAction` payloads to its `DataPayload` union, incompatible with the generic `<T>`. Resolved by casting `makeAction` to a permissive local signature (runtime unaffected — payloads are JSON-safe).
- `tsc` flagged a narrowed `u.phase !== 'count'` comparison as always-true inside the else-branch. Removed the redundant guard.
- Temporal-dead-zone bug: the `NetRoyale` constructor emits synchronously and referenced `driver` before init. Refactored `MpDriver` to an `attach(ng)` pattern (as hexbloom does).
