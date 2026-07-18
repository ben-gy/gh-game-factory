# Build Log: Scrapwall
**Date:** 2026-07-18
**Status:** deployed

## Idea Source
IDEAS.md (first entry): "Zombie horde base defence — build and fortify a base by day
(walls, barricades, turrets, traps, scavenger runs for scrap and ammo), then survive an
escalating night horde that pathfinds toward whatever you left weakest… Co-op, not
versus: 2–4 peers share one base and one economy… host transfer handing the sim to a
survivor mid-wave… Tune the wave curve with a sim."

Removed that line from IDEAS.md. Interpreted as a **grid tower-defence/base-survival**
(no avatars) — the tap/drag control scheme this factory's mobile spec wants for a board
game, tractable pathfinding, and a clean host-authoritative snapshot model. Themed the
horde as "husks" (no trademark).

## Game Details
- **Name / repo:** Scrapwall / ben-gy/scrapwall
- **Genre:** strategy (tower-defence / base-survival)
- **Core loop:** prep lull (build walls/guns/spikes from scrap, harvest salvage for
  scrap+ammo) → wave (husks flow-field toward the Core, dig the weakest wall; guns burn
  ammo; patch breaches) → repeat, ever-worsening, until the Core falls.
- **Multiplayer:** live P2P **co-op**, 2–4, host-authoritative snapshot star. Channels
  `snap` (full grid+horde @10Hz) + `act` (build/repair/clear/harvest/launch). Host
  transfer rebuilds the deterministic spawn queue and resumes; peer leave shrinks the
  horde. Rematch inside one living room via rematch.ts.
- **Stack / render:** vanilla-ts / canvas
- **Engine modules used:** net, rematch, lobby, rng, loop, sound, storage, mobile,
  identity, drag, countdown

## Juice
Turret muzzle flash + fading tracers, husk death bursts + rings (shape+colour per kind
for colour-blind safety), wall-break debris + screen shake, Core-breach red vignette +
shake, harvest sparkle, build thunk, procedural SFX throttled per event, 3-2-1 wave
countdown with audio, pulsing Launch button, Core hp-bar tween. Respects
prefers-reduced-motion.

## Test Results
- Tests written / passed / failed: 142 / 142 / 0
- P2P-sync determinism test: pass (identical salvage layout + identical horde spawns
  from one seed; resume-queue determinism)
- Host-transfer takeover test: pass
- Balance sim: pass — smooth wave ramp with a contested middle, every run terminates,
  party playable at every size, `RAMP_EXP` pinned as load-bearing
- Host-election / net-lifecycle (one-join) / rematch / room-code / source-hygiene /
  manifest: pass

## Build Status
- npm install / test / build / local play / multiplayer smoke: pass / pass / pass / pass / pass
- **Every mode verified in-browser at ~375px (principle #20):**
  - Outpost 9×9 — fits, no overflow, controls on-screen (local + production 375px)
  - Depot 11×11 — fits; played through waves 1–3 with turrets firing, husks dying, "wave
    held" flashes (local); 375px production screenshot crisp
  - Sprawl 13×13 — fits, no overflow at true 375px (production); caught live combat with
    the Core-breach vignette working
- Visibility gate: canvas is the top element at centre, overlays compute display:none
- **Two-peer smoke test on LIVE production (all six gates):** typed-code join ("6duf" →
  6DUF), roster 2 / exactly one host / creator keeps host, in-sync co-op round (both
  reached a results screen showing BOTH players' contributions, footer says "together"),
  rematch (both Play again → fresh round 2 in the same room), **host transfer** (closed
  the host tab → survivor promoted, launched the wave, husks incoming, run finishable).

## Deployment
- Repo created / Pages enabled (workflow) / DNS (Cloudflare) / TLS cert issued
  (https_enforced true) / production 200 + in-browser verified.
- PR: https://github.com/ben-gy/scrapwall/pull/1

## Errors & Resolutions
- **Flow-field routing bug (found via game.test.ts):** the weighted Dijkstra added the
  cost of the *source* cell instead of the *entered* cell, giving wall cells a cheap
  distance so husks pathed straight INTO them. Fixed to node-weight the entered cell;
  mutation-verified the test goes red on revert.
- **Balance took several sim iterations:** the first economy was total-salvage-capped
  (party irrelevant, hard wave-5 cliff); then a turret carpet went immortal. Resolved by
  making salvage renewable (throughput-limited), scaling both the horde AND scrap income
  with party count, and capping the bot's turret ambition so the geometric HP ramp always
  out-scales the fort. Landed a smooth ramp that terminates.
- **Two-tab test confound (not a bug):** Chrome MCP backgrounds the non-active tab, which
  pauses its rAF, so `syncHud`/render freeze on whichever peer isn't foregrounded (the sim
  keeps running off the setInterval keepalive). Verified each peer by foregrounding it;
  all gates passed. (Real players' tabs are foregrounded while playing.)
