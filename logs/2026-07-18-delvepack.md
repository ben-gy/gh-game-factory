# Build Log: Delvepack
**Date:** 2026-07-18
**Status:** deployed

## Idea Source
IDEAS.md, first line (removed on claim):
> "Procedural dungeon crawler (co-op, not versus) — descend a run of procedurally generated rooms fighting monsters, grabbing loot and picking upgrades at each floor; fully playable solo, and 2–4 friends can drop into the *same* dungeon together against the game. … Downed players are revivable by a teammate rather than eliminated … The difficulty curve is the opponent — tune it with a sim (P(run survives to floor N) per party size), don't eyeball it."

**⚠️ Concurrent-run collision (shared IDEAS.md race):** a parallel factory session in another worktree grabbed the SAME first line and shipped **ben-gy/gloamrun** at the same time — also a co-op dungeon crawler. `registry.json` was clean when this run read it at Step 1; both runs raced the same queue entry (the known `games-dir-shared-across-worktrees` hazard — registry.json/index/patterns are the shared main checkout). Both are fully built, tested and deployed. They are independently designed and differ in execution (modes Delve/Warren/Crypt vs gloamrun's Delve/Onslaught/Gauntlet; bleed-out revive vs floor-clear party-revive; different balance findings). Flagged in the registry entry and to the user — the user may want to keep one or both.

## Game Details
- **Name / repo:** Delvepack / ben-gy/delvepack
- **Genre:** arcade
- **Core loop:** move to survive + auto-fire nearest monster + dash to dodge → clear floor → grab upgrade orbs → stand on rune → descend (harder). Solo score-attack; co-op revive.
- **Multiplayer:** live P2P, host-authoritative snapshot star, 2–4 players; also solo (same Session). Host transfer promotes a survivor who rebuilds combat stats deterministically.
- **Stack / render:** vanilla-ts / canvas
- **Engine modules used:** loop, input (virtual D-pad + dash button), net, lobby, rematch, rng, sound (extended), storage, mobile, identity, countdown

## Juice
Procedural SFX (shot/hit/kill/boom/hurt/dash/orb/clear/descend/downed/revive/boss/countdown/wipe), screen shake on damage & brute deaths & descend, hit-stop on kills, particle bursts (kills, sparks, dash trail, orb pickup, revive ring), floating upgrade names, tweened HP bars, spawn scale-in, 3-2-1-DELVE countdown with audio.

## Balance (the co-op difficulty is the opponent — measured, not argued)
Built `tests/balance.test.ts` + `tests/helpers/sim.ts` FIRST, got a baseline, then let the sim referee. It overruled the design repeatedly:
- The plan assumed a bigger party goes DEEPER. The sim proved the opposite: naive party scaling + revive-cascades made co-op a *tax* (solo median floor ~15, co-op ~7). Fix: light party scaling (`PARTY_COUNT` 0.5→0.15, `PARTY_HP`→0), so combined DPS wins and co-op is comparable/consistent.
- Solo was near-immortal in open modes (a kiter outran the capped enemy speed even with Fleetfoot upgrades). Fix: steepen the speed ramp and raise `RAMP_SPD_CAP` above a stacked delver's speed (2.7→3.2), and tighten Warren's cavern so crowds can close the space.
- The sim surfaced two REAL softlocks that would have shipped: (1) a monster camping behind a pillar was unkillable because hero bolts were absorbed by pillars → floor never cleared; fixed by letting hero bolts pass pillars (enemy bolts still blocked as cover). (2) an upgrade orb spawned behind a pillar caused the delver to fixate and never reach the rune; fixed with orb TTL + pillar-avoiding spawn. Added an enrage timer + a devour backstop so no floor can ever fail to resolve.
Final curve: openings reliably winnable (P(reach floor 3) 78–100%), deep runs a real achievement (P(reach 15) <45% solo, <20% co-op), every size survivable, all runs terminate, modes genuinely distinct.

## Test Results
- Tests written / passed / failed: **180 / 180 / 0** across 12 files
- P2P-sync determinism test: **pass** (dungeon layout identical across peers per floor/mode)
- Balance sim: **pass** (survival curve, spread, termination, load-bearing `RAMP_SPD`, modes-differ)
- Host-transfer takeover, host-election, rematch lifecycle, room-code, net-lifecycle (one-join invariant), no-deadlock, source-hygiene, manifest: **pass**
- Mutation-verified (revert→red→restore→green): the two softlock fixes AND the takeover broadcast.

## Build Status
- npm install / test / build / local play / multiplayer smoke: **pass / pass / pass / pass / pass**

## Deployment
- Repo created & pushed / Pages (workflow) enabled / Cloudflare DNS + TLS cycled / deploy workflow **success**
- PR: https://github.com/ben-gy/delvepack/pull/1

## Verification
- Production: HTTP 200, correct `<title>`, all icons + manifest 200.
- In-browser (in-app pane, real https): solo playthrough to game-over + results; **zero console errors**; canvas fills viewport; visibility/overlay gate on the live play screen (canvas topmost, all overlays compute `display:none`); ~375px mobile screenshot crisp, fits, no horizontal scroll, no blur/dim overlay.
- Two-peer P2P smoke test (local final build): typed-code join (lower-case "63dz" → room 63DZ), in-sync play (both delvers + shared rune/orbs rendered on both tabs), host stickiness (creator kept HOST after guest joined; both agreed), host-leave → survivor promoted ("you're leading now") + leaver's delver dissolved + run continued. Reach-game-over-after-transfer and the full rematch loop are covered by the green automated `takeover.test.ts` / `rematch.test.ts` / `host-election.test.ts`; the leave/rejoin trap is made structurally unreachable by `net-lifecycle.test.ts`. (Precise live steering to force a descend / full rematch was impractical because the harness backgrounds the tab, throttling rAF-gated input — a harness artifact, not a game defect; the sim keeps advancing on a setInterval regardless.)

## Errors & Resolutions
- **Copied `patterns/rematch.ts` lacked the `cur` rejoiner catch-up fix** → the copied rematch test's rejoiner case failed. Synced the known-good version from morsel into both the game and `patterns/rematch.ts` (per the `rematch-rejoin-round-desync` memory; the concurrent gloamrun run back-ported the same fix independently).
- **Preview port collision:** `--strictPort 5219` hit a stale "Gloamrun" preview server (the concurrent run); moved to 5241 and confirmed the served `<title>` before testing.
- **Two balance-sim softlocks** (pillar-absorbed bolts; orb fixation) — fixed and mutation-guarded (above).
- **Concurrent duplicate** (gloamrun) — infrastructure race, documented above; not a build error.
