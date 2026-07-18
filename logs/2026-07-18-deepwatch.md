# Build Log: Deepwatch
**Date:** 2026-07-18
**Status:** deployed

## Idea Source
IDEAS.md, first entry (quoted in part):

> "Deepwatch — a silent co-op card game where the crew must surface a bank of
> deep-sea creatures onto one shared line from shallowest to deepest, but each
> card shows only a shadowy silhouette sinking in a depth-gauge (no printed
> number)… every out-of-order surface costs the team one of a few shared air
> tanks. The team-saving twist is the sonar ping… plus a rising-tide timer…
> the risk to simulate is the difficulty curve."

Built as specified, including the explicit "zero chat or table-talk channel"
constraint and the sonar/tide twists. The idea's own stated risk — the difficulty
curve — turned out to be exactly right, and then some.

## Game Details
- **Name / repo:** Deepwatch / ben-gy/deepwatch
- **Genre:** card
- **Core loop:** Surface your shallowest creature onto one shared line when you
  believe nothing shallower is left in anyone's hand. No numbers, no talking; the
  only signal is how long each diver has been holding.
- **Multiplayer:** live P2P co-op, 2–4, host-authoritative star
- **Stack / render:** vanilla-ts / DOM
- **Engine modules used:** net, rematch, lobby, rng, storage, mobile (+mobile.css),
  identity, drag (extended with a HOLD gesture), plus local sound + countdown

## Juice
Depth-pitched surface tones (a clean ascending line plays as a descending run, so
you *hear* the crew reading each other well), bubble trails rising off a surfaced
card, silt bursts on a misplay, a sonar sweep across the gauge, screen shake on
misplay and tide surge, the tide bar going red and pulsing under 25%, a tweened
floor band, 3-2-1-DIVE with audio on every level. All motion respects
`prefers-reduced-motion`, checked live rather than at boot.

## Test Results
- Tests written / passed / failed: 174 / 174 / 0
- P2P-sync determinism test: pass (this game leans on it unusually hard — hands
  are never sent, only derived)
- Balance sim: pass, 22 assertions
- **Mutation-verified (reverted → RED → restored → GREEN):** the sonar
  floor-corruption bug, hold-is-never-a-tap, signal-joining, countdown-overlay sweep

## What the balance sim overruled
Written before any tuning, per principle #18. It killed five confident diagnoses:

1. **The rising tide never fired.** Not once, in any mode, in any run — the
   headline mechanic was pure decoration. (It remains the termination guarantee
   and a real threat to a human who freezes; `game.test.ts` drives that path
   directly since the sim cannot reach it.)
2. **Sonar was worse than not having it** — 7% finishes against 8%. Two trigger
   rewrites failed before the real problem surfaced: divers never *joined* a
   teammate's signal, so a signal that never reached consensus was a shared stall
   that cost tide and bought nothing. With joining it is **+5.35σ across 6,300
   paired runs**. Pleasingly, the mechanic only pays when players read each other.
3. **Widening the deck did nothing** — 1× to 2.8× moved four-diver Trench from
   15% to 8%, i.e. noise. With purely proportional jitter a misorder needs a
   *ratio*, so every absolute scale cancels. The fix was adding a flat jitter term.
4. **Scaling air tanks did not rescue big crews** — at +3 tanks per extra diver a
   four-diver Abyss still finished 0% of runs.
5. **A broken control arm hid all of it for a while.** `sonar: false` zeroed pings
   once at the start, but modes grant bonus charges at `pingAt` levels, so the
   "no sonar" crew quietly got sonar back from level 6 and the comparison measured
   nothing. Fixing the control flipped the conclusion.

What actually worked was structural: a tide budget **per card** rather than per
level, and a dive whose **depth scales down as the crew grows** so every party
size faces about the same total number of cards. Final curve (2/3/4 divers):
Shallows 100/99/100, Trench 83/82/66, Abyss 55/32/61.

## The bug the sim could not see
The sim happily certified a Trench level 1 that ran in **6.3 seconds**. Playing it
in a real browser, a human got **zero taps in** — the bots cleared the level and
the tide force-surfaced both my cards while I was still reading the gauge. The
sim's diver judges instantly and has no perception cost, so this class of failure
is structurally invisible to it.

Fixed by slowing the tide to human speed (level 1 now 9–22s, a whole dive 5–7
minutes) and raising `JITTER` from 0.12 to 0.44 until the curve came back —
`JITTER` being the one lever that survives rescaling, since it is a ratio. There
is now a test asserting level 1 is long enough for a person to play.

**The general lesson: a balance sim measures whether the game is *fair*, never
whether it is *playable*. Both gates are needed.**

## Build Status
- npm install / test / build / local play: pass
- Two-peer P2P smoke test: **not run** (see Errors & Resolutions)
- **Every mode verified in-browser at true 375×812 on the LIVE production URL**
  (principle #20):
  - **Shallows** crew 4 → 5 levels — fits, no overflow, controls OK
  - **Trench** crew 4 → 7 levels — fits, no overflow, controls OK
  - **Trench** crew 2 → 10 levels — fits, no overflow, controls OK
  - **Abyss** crew 4 → 8 levels (+ hidden-hand note) — fits, no overflow, controls OK
  - Every case: card fully on-screen and ≥44px, 4 crew chips with zero overlap,
    HUD in bounds, footer hidden mid-round, no stray `[hidden]` element, zero
    console errors.

## Deployment
- Repo created / Pages enabled / DNS + CNAME set / workflow success
- PR: https://github.com/ben-gy/deepwatch/pull/1
- Live: https://deepwatch.benrichardson.dev

## Errors & Resolutions
- **Sonar corrupted the line (real rule bug).** `fireSonar` raised the floor to
  the deepest discard. Each diver discards their *own* shallowest, which says
  nothing about anyone else's second card, so a crew holding [5,20,60], [40,45]
  and [41,70] discards 5/40/41 and a floor of 41 strands the surviving 20 *below*
  the line — rendering a descending sequence and poisoning every diver's read.
  Discards no longer move the floor. Mutation-guarded.
- **A hold resolved as a tap.** Both actions live on one card, so releasing a
  sonar signal also surfaced the card — usually a misplay. `classifyRelease` now
  checks `held` first and unconditionally. Mutation-guarded.
- **Countdown overlays leaked** (found on the live site). `cancel()` stops the
  timer but cannot remove the element, and removal runs on its own 320ms timer,
  so re-entry orphaned a full-screen dim + `backdrop-filter` layer. They are
  `pointer-events: none` so taps still landed, but stacked they darken the gauge.
  Now swept before each new overlay, with a source-level invariant guard,
  mutation-verified.
- **Player and bot names collided** — a solo dive produced "Diver Fathom" sitting
  next to a bot called "Fathom". In a game entirely about working out who is
  holding back, two indistinguishable divers is not cosmetic. Disjoint name pools
  plus a de-duplication pass.
- **My own per-mode probe was wrong first time**, silently re-measuring one
  Shallows dive three times (all reporting "/5"). Caught because the level counts
  did not match `levelsFor`. Re-done with a clean reset per mode — a small live
  demonstration of exactly why principle #20 exists.
- **Two-peer P2P smoke test not run.** Host transfer is covered by 13 automated
  takeover tests (including "CAN STILL REACH GAME OVER"), plus the one-join
  invariant, host-election, room-code and full rematch-lifecycle suites. Noted
  honestly in the PR rather than claimed.
