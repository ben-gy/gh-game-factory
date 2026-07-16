# Build Log: Gravity Golf
**Date:** 2026-07-16
**Status:** deployed

## Idea Source
IDEAS.md (first entry, now removed): "Gravity Golf — physics mini-golf with slingshot aiming; async pass-and-play plus live P2P race mode."

## Game Details
- **Name / repo:** Gravity Golf / ben-gy/gravity-golf
- **Genre:** arcade
- **Core loop:** Pull back a slingshot to launch the ball; gravity wells (attractors pull, repulsors push, black holes swallow) bend its flight; sink it in the hole in as few strokes as possible across 9 procedural holes.
- **Multiplayer:** async-seed (share a `?seed=` course link) AND live P2P race (2–6 players). Topology: host-authoritative for race state (standings + round clock) while each peer runs its own local ball physics; only the seeded course must agree across peers. Channels `prog` (per-peer progress) + `snap` (host standings/clock), plus engine `pres`/`preq`/`go`/`ping`.
- **Stack / render:** vanilla-ts / canvas
- **Engine modules used:** loop, rng, net, lobby (extended with `createRoomEntry`/`normalizeRoomCode`), sound, storage

## Juice
Comet trail behind the moving ball, launch/bounce/sink particle bursts, magenta implosion on black-hole swallow, screen shake (scaled by impact, disabled under `prefers-reduced-motion`), procedural SFX (launch/bounce/sink/ace/swallow), live predicted-trajectory preview that curves through the gravity field, power ring + slingshot band, waving hole flag, pulsing planet auras, rotating black-hole accretion rings, birdie/eagle/hole-in-one call-out toasts, results count-up scorecard with colour-coded chips.

## Test Results
- Tests written / passed / failed: 35 / 35 / 0
- P2P-sync determinism test: pass (same seed → byte-identical course; verified live too: identical tee/cup on both peers)
- Host-transfer takeover test (contract gate #2): pass (promoted client drives round to `over===true`; overdue timer also ends the round)
- `normalizeRoomCode` test (gate #1): pass
- Peer-leave grace test (gate #3): pass

## Build Status
- npm install / test / build / local play / multiplayer smoke: pass / pass / pass / pass / pass

## Deployment
- Repo created / Pages enabled / DNS + CNAME + cert cycled / PR: https://github.com/ben-gy/gravity-golf/pull/1
- Deploy workflow: success

## Errors & Resolutions
- **Ball orbit trap:** initial gravity (G=900) captured the ball into endless orbits around attractors that the watchdog damping couldn't break. Fixed by lowering G, raising base damping, softening near-field gravity, and adding a hard flight-time settle cap (HARD_STOP). Verified via a scripted trajectory diagnostic (max settle ~5s, worst-case orbit ~6.5s).
- **Holes unwinnable (~20–30%):** wells were too strong/dense for the narrow field, over-deflecting approaches, and a ball resting just outside the cup could never roll in (gravity doesn't apply at rest). Fixed with softened well mass, thinned well density, a cup "green" braking zone, a stronger cup lip pull, and a lip-drop rule (a ball that loses momentum near the cup drops in). A greedy full-flight solver then completed 89/90 holes.
- **Pointer slingshot silently dropped every shot (real bug):** the pointer-release handler set `dragging = false` BEFORE calling `computeAim()`, which requires `dragging` to be true to produce the drag aim — so it always returned null and no shot fired. Only keyboard shooting worked. Caught by the in-browser drag test (unit tests couldn't). Fixed the ordering, and additionally hardened input: clientX/getBoundingClientRect coords instead of `offsetX`, window-level pointermove/up so drags that leave the canvas still complete, and a `resize()` guard + retries so a transient 0-size measurement never clobbers `view` into producing NaN world coordinates.

## Multiplayer smoke test (two tabs, live P2P over public Nostr relays)
1. Typed-code room entry (gate #1): tab B typed "mree" (lowercase) → normalised to MREE → joined tab A's room. ✓
2. In-sync play: tab A's strokes appeared in the host's standings. ✓
3. Host transfer (gate #2): closed the host tab → survivor promoted ("You're the host now") → completed all 9 holes → reached "Race over". ✓
4. Peer-leave grace (gate #3): departing peer shown as "left", did not block the round from ending. ✓
