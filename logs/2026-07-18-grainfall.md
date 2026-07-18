# Build Log: Grainfall
**Date:** 2026-07-18
**Status:** deployed

## Idea Source
IDEAS.md (first entry): *"Micro civilisation (Hammurabi-style) — you rule a tiny city-state
one year per turn, splitting a grain stockpile between feeding your people, sowing next year's
fields, and buying land at a price that swings each year; harvests, rat infestations and plagues
then roll against you… Balance is the entire game: simulate P(city survives N years) and the
greedy-vs-cautious win rate before shipping, don't eyeball it."*

## Game Details
- **Name / repo:** Grainfall / ben-gy/grainfall
- **Genre:** strategy (economy / management sim)
- **Core loop:** each year split the granary three ways (trade land at a swinging price, sow
  fields, feed people), then the year rolls (harvest/rats/plague/settlers). Compounding is the depth.
- **Multiplayer:** async-seed. **Deliberately NOT live P2P** — it's a turn-based parallel-city
  game where players think at their own pace and end up on different years, so a live mesh would
  add the whole host-transfer/rematch/lockstep surface for a payoff async delivers exactly and
  robustly. Daily Reign (same decade for everyone each day) + challenge links (`?seed=&mode=`,
  optional `&t=&by=`) that replay a byte-identical deterministic reign and show the challenger's
  score to beat. The results screen also shows a **masterful-steward benchmark** (the cautious
  bot's score on your exact seed) — the solo form of "show what everyone missed".
- **Stack / render:** vanilla-ts / DOM (+ a small canvas layer for grain-mote juice)
- **Engine modules used:** rng, sound (extended), storage, mobile.ts + mobile.css. No net/lobby/loop.

## Three modes (genuine play-spread, not a dial)
- **Steward** — 10y, balanced. Learn the loop; a careful ruler thrives (cautious bot ~100%).
- **Famine** — 11y, exhausted land: lean harvests, hungry people, frequent rats, cheap land.
  Break-even economy — variance decides. Play defence (cautious ~66%).
- **Dynasty** — 18y boom: fertile fields, wildly swinging land prices (speculation matters),
  and a large well-fed city is a feeding liability. Play offence (cautious ~68%).

## Juice
Tweened HUD number counters, grain-mote particle bursts on harvest, dark scatter + shudder for
rats, grey scatter + screen-shake for plague, warm chord on a survived year, narrated Chronicle
with staggered reveal, procedural SFX per event, a sun-arc year track. All gated behind
`prefers-reduced-motion`.

## Test Results
- Tests written / passed / failed: **35 / 35 / 0**
  - game logic (feeding, overthrow threshold, harvest/rats, settler cap, legalize clamps, standing)
  - determinism / same-seed reign replays identically (async-multiplayer invariant)
  - **balance sim** (cautious vs greedy, 400 seeds/mode) — the shape assertions
  - structural-sustainability invariant (pins landPerHead/yields so no mode becomes a death spiral)
  - share round-trip + hostile-name sanitize + daily-seed stability
  - source hygiene (no literal control bytes) + mobile-layout CSS guards
- P2P-sync determinism test: n/a live (async), but the same-seed determinism test covers it.

## Balance — the sim refereed and OVERRULED the design (twice)
Built the sim FIRST and took a baseline. Every confident diagnosis was wrong until measured:
- **Famine was mathematically unwinnable** (7-12% even played carefully): net food per fully-farmed
  person = 10×(yield−1) ≈ 15 but feed was 22 → a guaranteed spiral regardless of skill. Fixed to
  break-even (feed 20, yield [1,5]) so leanness comes from variance, not structure → ~66%.
- **Dynasty snowballed into starvation** (4-31%): blind auto-growth swelled the population past
  what the fixed 1000-acre land base could feed, then one low-yield year deposed the ruler. Fixed
  with a **settler land-cap** (`floor(land / landPerHead)`) so a city never grows past its feeding
  capacity — to grow more, buy land. **Mutation-verified:** removing the cap turns both a unit test
  and the balance sim red.
- Final shape: cautious survives Steward ~100% / Famine ~66% / Dynasty ~68%; greedy far lower in
  every mode (skill decides); Famine < Steward (difficulty ordering holds); scores spread and
  differentiate strongly by mode (Dynasty mean ~2400 vs Steward ~1850 vs Famine ~830).

## Build Status
- npm install / test / build / local play / production play: **pass** each.
- **Every mode verified in-browser at ~375px (principle #20):** Steward, Famine (11 pips) and
  Dynasty (18 pips, worst case) each fit with **zero horizontal overflow**, controls on-screen and
  ≥28px, HUD numbers fully visible. **A mobile-only bug was found and fixed here:** at 375px the
  4-column HUD clipped its numbers ("3,20" instead of "3,200") because label+value rendered inline
  in a too-narrow box — fixed by stacking them (block) and pinned with a CSS-invariant guard test
  (mutation-verified red-on-revert). Redeployed and re-verified all three modes on production.
- Visibility gate: no stray overlays; play surface is the top element at centre; `[hidden]` guard
  present in shipped CSS. Zero console errors (local and production).

## Deployment
- Repo created / Pages enabled / DNS + cert provisioned / deploy workflow green (first run).
- PR: https://github.com/ben-gy/grainfall/pull/1
- Live + verified in-browser (desktop + ~375px mobile, all three modes) at https://grainfall.benrichardson.dev

## Errors & Resolutions
- Balance: three wrong diagnoses killed by the sim (see above) — the method (simulate first) mattered
  more than any single metric.
- TS: `burstEl`'s type helper grabbed the wrong parameter index (`Parameters[1]` = the `y` arg, not
  opts) → replaced with an explicit `BurstOpts` type.
- Mobile HUD number clipping at 375px → CSS stack fix + invariant guard.
