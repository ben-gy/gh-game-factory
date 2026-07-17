# Build Log: Orbital Skirmish
**Date:** 2026-07-17
**Status:** deployed

## Idea Source
Not from IDEAS.md and not newly invented — this is the game the **2026-07-13
run planned but never built**. That run wrote a full plan, scaffolded a Vite
project and copied the engine, then died ~70 seconds in (directory timestamps:
created 06:52:23, last file 06:53:32) before a single line of gameplay. It left
a gitignored, local-only shell with no GitHub repo, no log, and no registry
entry — invisible to everything but the directory itself. cipher-clash is what
actually shipped for 2026-07-13. Finished on 2026-07-17 at the user's request.

## Game Details
- **Name / repo:** Orbital Skirmish / ben-gy/orbital-skirmish
- **Genre:** arcade
- **Core loop:** Momentum ship in a circular arena with a lethal central star that
  pulls ships, bullets AND rocks; you aim where gravity will carry the shot, not
  where the target is. Last ship flying wins.
- **Multiplayer:** live P2P, host-authoritative snapshot star, 2–4 players; solo
  Survival (AI waves) is the instant-play default. Rematch inside the room.
- **Stack / render:** vanilla-ts / canvas
- **Engine modules used:** net, rematch, lobby, rng, loop, input, sound, storage,
  identity, mobile (+ mobile.css). Re-copied FRESH — the Jul 13 scaffold's engine
  predated sticky-host and rematch and was discarded.

## Juice
Procedural SFX on every action (thrust, fire, hit, kill, explosion, respawn,
flare, win/lose); velocity-inherited thruster plume, 16-shard death bursts, rock
debris, star-flare rings; screen shake scaled by event and to zero under
prefers-reduced-motion; 60ms hit-stop on a kill; pulsing star gradient. Ships are
told apart by hull SILHOUETTE as well as Okabe–Ito colour (colour-blind-safe by
shape, not hue alone); the local ship carries a ring.

## Balance (principle 18)
Written BEFORE any tuning and it refereed the whole build. It found two real
bugs — rocks spawning on top of ships (turn-0 unfairness), and a respawn grid of
8 fixed slots that isn't commensurate with 3 players and quietly broke the
arena's rotational symmetry (3P seats 36.8/28.8/34.5, χ²≈8.2, p≈0.017) — and it
KILLED two confident diagnoses of mine: a "seat 0 favoured" reading that was an
artifact of one seed set (pooled n=750: 25.2/23.3/25.2/26.4), and the whole
leader metric, which measured kills when the round is won on lives. It also
exposed that the bot ignored bullets inheriting ship momentum (5% hit rate);
fixing the aim to solve the intercept took it to 20% and halved the round.
Final: seats level at 2P/3P/4P; leader-at-15%→85% converts ~40%→74% at 4P
(chance 25%). `lives=5` was measured against the corrected metric (the widest
early→late spread) and pinned.

## Test Results
- Tests written / passed / failed: 198 / 198 / 0 (across 19 files)
- P2P-sync determinism test: pass
- Host-transfer takeover (contract gate #2): pass, mutation-tested (removing the
  promotion tick reproduces rhythm-relay's frozen-survivor bug)
- Room-code, rematch lifecycle, host election, no-deadlock: pass
- Balance sim (principle 18): pass, pools 5 seed bases at n=400/table

## Build Status
- npm install / test / build / local play / production play: pass / pass / pass /
  pass / pass
- Multiplayer smoke: room entry (create + typed-code join) and lobby verified
  in-browser (host badge, connecting spinner, enabled host mode picker). The full
  two-peer live smoke (host-leave, rematch) could NOT be run — this environment
  renders headlessly (document.hidden is permanently true, so rAF is paused), so
  a continuous two-tab playthrough is impossible here. The multiplayer CONTRACT
  is instead enforced by the automated tests above (host transfer, rematch,
  one-join invariant, host election), all green.

## Pre-ship adversarial review
Ran a 5-dimension multi-agent review with 3-lens refute-by-default verification
(71 agents). 22 candidate findings → 5 survived → all 5 fixed and mutation-tested:
1. **[critical]** the live-round control labelled "Pause" (❚❚, next to mute)
   silently tore the room down on one tap — no confirm, no results screen, peer
   stranded. A live P2P round genuinely cannot pause (the host keeps simulating),
   so it is now a labelled ✕ leave-confirm.
2. **[major]** a peer promoted to host in the lobby kept a disabled, unwired mode
   picker captioned "The host picks the mode" while its own roundOpts() was what
   the room would play. Now repainted from live state on promotion.
3. **[major]** `Ship.respawn` was absent from the snapshot wire, so a promoted
   host's first tick resurrected every ship mid-death-penalty. Added to the wire.
4. **[major]** the rematch note read "Waiting for 0 more…" forever when you were
   the last peer left. Now says so and offers the room code.
5. **[major]** leave-then-rejoin-the-same-code walked into net.ts's teardown
   throw. enterRoom now awaits the in-flight leave first.

## Deployment
- Repo created / Pages enabled / DNS + TLS: yes / yes / cert live (https_enforced)
- Deploy workflow: success
- Production verified in-browser (desktop + 375px mobile, crisp + interactive;
  zero console errors; canvas fills viewport; visibility gate clean; a real input
  fired a bullet on the live URL)
- PR: https://github.com/ben-gy/orbital-skirmish/pull/4

## Errors & Resolutions
- Balance/AI iteration (documented above) — the sim did its job and overruled me
  more than once, exactly as principle 18 promises.
- Mobile canvas collapsed to 188px at 375px width: `height:100%` on a flex child
  couldn't resolve against auto-height ancestors; fixed by positioning the canvas
  `absolute; inset:0` inside a `position:relative` arena. Guarded by
  tests/layout.test.ts.
- Concurrent daily run: a `driftlock` build was in flight in the parent repo with
  uncommitted registry/index entries. Swept them into the index commit (rather
  than clobbering) and rebased before pushing, so both games' data survived the
  push race; left driftlock's IDEAS.md + log for its own run.
