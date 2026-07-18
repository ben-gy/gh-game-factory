# Build Log: Emberwake
**Date:** 2026-07-18
**Status:** verify_production_pending (see Deployment — the build is live, the TLS cert lagged)

## Idea Source
IDEAS.md, second entry. The **first** entry (zombie horde base defence) was already being
built by a CONCURRENT session — `games/2026-07-18-scrapwall/` existed with files modified
75 seconds before I looked. `games/` is gitignored and lives only in the main checkout, so
worktree isolation does not apply and two sessions racing the same queue collide. I backed
off that idea entirely and took the next unclaimed one (Emberwake), removing it from
IDEAS.md and staking the directory immediately. Scrapwall shipped from the other session.

Quoted idea: *"an auto-running spark tears across dissolving skybridges while a wave of dark
unmakes the track behind it at an ever-rising floor speed… the hook is that momentum IS your
speed, your health and your score at once."*

## Game Details
- **Name / repo:** Emberwake / ben-gy/emberwake
- **Genre:** arcade
- **Core loop:** auto-run up a lane track; swipe to dodge/leap/slide, grab motes, thread
  hazards in-lane for momentum, hold SURGE to cross chasms, stay ahead of the rising dark.
- **Multiplayer:** async-seed (UTC daily seed + share links + own-best ghost replay)
- **Stack / render:** vanilla-ts / canvas
- **Engine modules used:** loop, rng, sound, storage, mobile (+ mobile.css). No
  net/lobby/rematch — see below.

## Why async-seed rather than live P2P
The idea specifies a "live ghost race", but that shape is a *parallel time-trial*: each peer
sims only its own runner on the same seeded track and broadcasts a pose ping. Nothing is
shared or authoritative, so there is nothing to desync — the entire value is "same track,
compare distance", which async-seed delivers exactly. Since the sim is a pure function of
(seed, mode, inputs), the daily seed hands everyone the identical bridge, a share link
carries seed+mode+distance, and replaying a seed races a ghost of your own best run. This
keeps the whole experience while avoiding the live-P2P contract surface (and its historically
flaky sandbox smoke test) for zero loss. The factory explicitly blesses this for score
attacks; cf. lumenlock and grainfall.

## Juice
Ember trail particles (momentum-scaled), mote burst on pickup, hit debris + screen shake,
chasm-cross burst, the dark's jagged animated leading edge over a void gradient, a red
near-death vignette that floods the screen as the gap closes, momentum-bar colour that
shifts amber→red as you bleed, and procedural audio for every event (mote/jump/slide/
thread/clip/surge/chasm/death). All shake and particle counts degrade under
`prefers-reduced-motion`.

## Balance — the sim refereed it and overruled the design TWICE
`tests/balance.test.ts`: a reactive runner-bot (with a seeded mistime probability, so
momentum is a genuine resource rather than a free refill) plays 220 fixed seeds per mode
under three surge policies. Baseline printed FIRST via a scratch `_measure` test, then tuned
against real numbers.

**Attempt 1 — no momentum decay.** Runs were 6–9 MINUTES (Ember median 9405m / 358s), the
bot pinned momentum at 1.0 the whole way, and distance had a ~3% spread (p10 9236, p90 9515).
Every policy scored the same because the run simply ended at a fixed dark-ramp wall. No
economy, no skill differentiation. The refill rate simply exceeded any drain, so momentum had
only two stable states: pinned at cap, or dead.

**Attempt 2 — heavy passive decay to create scarcity.** Over-corrected badly: momentum
drained monotonically to zero (`medEndM=0.00` in every mode) and runs ended by STARVATION
*before reaching the first chasm*. That made SURGE — the signature mechanic — irrelevant in
2 of 3 modes, and `never`/`hoard`/`mixed` produced byte-identical results. The measured tell
was `never ≈ hoard ≈ mixed`, which is what exposed that no gate was ever being reached.

**Attempt 3 (shipped) — light decay + frequent chasms + a ramp wall.** Good play keeps
momentum high and runs to the dark-ramp wall; chasms come often enough (gateEvery 300–400m)
that the surge economy applies throughout.

The other correction was to the *comparison itself*: I had defined a `hoard` policy as
"surge only at chasms", which is actually near-optimal and competed with `mixed`, muddying
the result. "Pure hoarding" in the idea's sense means never dumping momentum into a surge at
all — which cannot cross a chasm and dies at the first one. Reframed that way the claim is
emphatic and robustly true:

| mode | mixed | pure-hoard | surge-spam | chasm fumbles (mixed) | early death |
|------|-------|-----------|-----------|----------------------|-------------|
| Ember | 2151m / 89s | 498m (100% chasm) | 374m | 2% | 0 |
| Nightfall | 1429m / 62s | 436m (100% chasm) | 196m | 3% | 0 |
| Latticework | 2452m / 103s | 568m (100% chasm) | 515m | 3% | 0 |

Mixed beats pure-hoarding 3.3–4.3× and surge-spam 4.8–7.3×. Zero unfair early deaths
(gone inside 8s) across 660 runs. Every run terminates — the rising dark guarantees it.

**Fairness is structural, not tuned:** track events have strictly increasing distances, so
at most one hazard exists at any point and a safe lane ALWAYS exists. Pinned by a test.

## Test Results
- Tests written / passed / failed: 48 / 48 / 0 (runs in <1s)
  - `balance.test.ts` (21) — the surge economy, run-length windows, termination
  - `sim.test.ts` (16) — step semantics, momentum clamping, chasm/dark death, determinism
  - `modes.test.ts` (5) — 3 modes, prototype-key guard on `modeOf()`
  - `source-hygiene.test.ts` (6) — control bytes, console, analytics, fonts, `[hidden]`, footer z-order
- P2P-sync determinism test: **n/a (solo)** — but the equivalent invariant is tested and is
  load-bearing here: same seed → byte-identical track AND byte-identical bot run, which is
  what the daily seed, share links and ghost replay all depend on.
- **Mutation-tested:** made chasms non-fatal → 7 balance/sim assertions went RED; reverted →
  green. Footer z-index guard → RED on revert to z24, green on restore.

## Build Status
- npm install / test / build / local play: **pass** (bundle 32 kB JS, 12 kB gzip)
- **Every mode verified in-browser at ~375px (principle #20):**
  - **Ember** (3 lanes) — fits, no overflow, pit + overhang + block + mote + chasm all render, HUD clear
  - **Nightfall** (3 lanes) — fits, no overflow; caught the dark's edge + red vignette at low momentum
  - **Latticework** (5 lanes — the overflow risk) — fits cleanly at 375px, `scrollWidth === innerWidth`, runner and hazards scale down with lane width
  - Zero console errors in every mode; results screen, how-to and menu all verified at 375px
- rAF note: the browser pane throttles rAF hard (5m→7m in 2s), so gameplay was driven through
  a synchronous `__ember.step()` hook to reach and screenshot real mid-run states. The sim is
  fixed-timestep, so stepping by hand is exactly what the loop does.

## Errors & Resolutions
- **Concurrent-session collision on the ideas queue.** Detected `games/2026-07-18-scrapwall`
  being actively written (mtime 75s old) and abandoned that idea rather than duplicating work.
  Root cause is structural: `games/` is shared across worktrees and IDEAS.md is a shared
  mutable queue with no locking. (IDEAS.md ended up with a duplicated `Frostward` line from
  the concurrent edits — left alone deliberately rather than risk another lost update; the
  Step-2 registry + `gh repo list` check dedupes anyway.)
- **Attribution footer was invisible on every screen.** `.site-footer` (z24) sat *below* the
  full-bleed `.screen` overlays (z25), so the backlink to the rest of the catalog never
  showed — caught by looking at the menu screenshot, invisible to every other gate. Fixed to
  z26 (below modals at z40) and pinned with a source-level CSS invariant test, mutation-verified.
- **Balance mis-tunings** — see above; two full retunes, both driven by measurement rather
  than argument.
- **TLS cert lag blocked the production browser pass (status: verify_production_pending).**
  DNS resolves to the Pages IPs, the deploy workflow is green, and production serves over
  HTTP with every asset returning 200. But GitHub's cert sat in state `new`
  ("certificate request process will begin shortly") for 70+ minutes. Likely cause: the
  skill's step-4/5 CNAME cycling, run several times in quick succession, re-adds the domain
  each time and requeues issuance — worth doing **once** and then leaving alone. Both browser
  surfaces refuse plain HTTP (the in-app pane denies it outright; Chrome force-upgrades to
  HTTPS and lands on an error page), so no visual pass against the live HTTPS URL was
  possible.

  **What that does and does not leave verified.** The deployed bundle is a byte-for-byte
  SHA256 match (JS *and* CSS) for the exact local build that WAS fully play-verified
  in-browser at 375px across all three modes, and the shipped CSS contains the `[hidden]`
  guard. So the artifact is known-good; what is missing is specifically the "look at it on
  the live URL" step. Per the factory rule, that is not enough to claim deployed — flip the
  registry to `deployed` once `https://emberwake.benrichardson.dev` returns 200 and a
  ~375px per-mode screenshot has been taken.
