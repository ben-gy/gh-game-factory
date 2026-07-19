# Build Log: Sporeline
**Date:** 2026-07-19
**Status:** deployed

## Idea Source
IDEAS.md, first entry. Quoted in part:

> Sporeline — an open-field maze tower-defence with a versus twist, quick matches (~6–7 min): creeps march from a gate toward your Heart across an empty grid and there IS no fixed path — the towers you drop ARE the walls, so you're mazing, snaking the route as long as you can to buy more shots, but the classic rule holds (you can never fully wall the gate off, there's always one road through) […] Kills pay gold you split between more/upgraded towers and the signature lever — SENDING a spore into a rival's field, which drops an extra creep on them AND bumps your own income […]

Built essentially as specified. The one design decision the brief left open — versus vs co-op — was resolved to **versus** and justified in the plan rather than defaulted: the signature verb (send a spore into someone else's field) has no co-op reading at all, and a co-op Sporeline would be two people mazing separate fields against a shared wave script, i.e. two solo games in adjacent tabs.

Two things in the brief were deliberately **not** built: the daily-seed async ladder and the AI-skirmish-only framing were folded into a single solo mode against bots, and the brief's `patterns/*` references were ignored — `patterns/` is frozen history and the engine is now the `@ben-gy/game-engine` package.

## Game Details
- **Name / repo:** Sporeline / ben-gy/sporeline
- **Genre:** strategy
- **Core loop:** Drop towers that are also walls, folding the creeps' road longer to buy your guns more seconds; spend kill-gold on a tighter maze or on spores that hurt a rival and raise your income. Last Heart beating wins.
- **Multiplayer:** live P2P, 2–4, versus. Per-peer deterministic sim with a host-authoritative clock.
- **Stack / render:** vanilla-ts / canvas (field) + DOM (HUD, menus, results)
- **Engine modules used:** net, rematch, turn, lobby, rng, sound, storage, mobile, feedback

## The netcode, in one paragraph
Each peer simulates **only its own field**. Nobody else's field can affect it except through one narrow channel — a spore somebody paid to send. That removes the entire class of desync bug snapshot-star netcode exists to manage, because there is no shared continuous state to disagree about. The host owns exactly three things: the wave clock, the round seed, and the win check. That is also the complete list of what a promoted peer takes over, which is why host transfer here is nearly free and unit-testable without a network. Channels: `wv`, `spore`, `st`, `fld` (display-only), `end`.

## Juice
Procedural SFX on place / reject / kill / leak / wave / spore-in / win, screen shake on Heart hits (suppressed under `prefers-reduced-motion`), spore-mote particle bursts on kills and leaks, a Heart that pulses faster as it weakens, and the signature piece: **while dragging a tower the field live-previews the road the creeps would take**, drawn over the current one with a `+7` / `−12` delta badge.

## Test Results
- Tests written / passed / failed: **170 / 170 / 0** across 12 files
- P2P-sync determinism: **pass** (wave script is a pure function of the seed; a stubbed `Math.random` cannot move it)
- Balance sim: **pass**, 16 assertions
- Mechanism invariants: `misTargetedShots`, `sealedFields`, `strandedCreeps`, `orphanedSpores` all **0**

## What the balance sim overruled
Built first, before any tuning, and it refereed everything.

1. **The game had no early game, and no outcome metric could see it.** The first build's numbers all looked healthy — every match terminated, 0% blowouts, seat rates near chance. What they did not show: across 240 matches in three modes, **nobody lost a Heart beat before wave 15**. The leader-wins metric was uncomputable before wave 12 for want of a leader, and it reported that as `n=0` rather than as a problem. Three quarters of every match was a formality, then everyone collapsed within three waves of each other. Fixed by `hp0` 16 → 42: average first leak moved wave **15.1 → 3.3**.
2. **The obvious fix for (1) did nothing.** Relaxing the late hp curve (the `hpLate` knee) produced numbers *byte-identical* to the broken build for the early game and merely stretched matches from 20 waves to 30 — a longer formality. Recorded in `game.ts` so nobody re-derives the original story.
3. **The signature mechanic never fired**, and the sim revealed it by accident: seven different send economies produced **byte-identical** results in 2-player Skirmish. Identical to the digit can only mean no spore was ever sent in any of them — the bots' gold reserve made `balanced` a strict synonym for `turtle`. Two of the three policies had been the same policy for every measurement taken up to that point.
4. **A seat bias that replicated across three seed families was an artifact of the instrument.** Siege 4P read seat 0 at 29% and seat 3 at 18% against 25% chance, in every family, at n=360. It looked airtight. Re-running with all four seats on **one** policy moved the bias around and *reversed* its direction. The families shared an identical seat-to-policy rotation schedule, so they were not independent in the only dimension being tested. Notably, a fix had already been written for it (a draw rule in `match.ts`) and measured as changing **precisely nothing**, which is what prompted the check — the "your diagnosis will be wrong" principle doing its job.

**A real bug it did catch:** a lowest-index tie-break in the bot's target selection meant every bot aimed its opening spores at seat 0, since all Hearts start equal.

**Sampling, stated honestly:** the shipped assertions are regression *ratchets* calibrated to the seed counts the suite actually runs (~46s); the precision figures quoted in the file come from an n=120-per-config, three-decorrelated-family development run. Two bounds were deliberately loosened rather than tightened after they started tracking noise — Siege 2P reads 57% over 120 seeds and 73% over the first 44 of those same seeds.

## Two defects the browser pass caught that no test could
- **Input geometry depended on a rendered frame.** Cell size and origin were computed only inside `draw()`, which runs from rAF. Before the first frame — or in any throttled or hidden tab — `cellAt()` returned −1 and **every tap was silently dropped**: no toast, no error, no console output, and a board that looked completely normal. Found only because one run of taps happened to have no screenshot between mount and tap; the identical taps *with* a screenshot first had passed minutes earlier, because any check that looks at the screen fires a frame and makes the bug vanish. Fixed by measuring in `cellAt` itself, pinned by `input-geometry.test.ts` (asserts every cell resolves on a renderer that has never drawn), mutation-verified.
- **A knocked-out player was left on a dead board.** Solo play only ended when one seat remained, so dying on wave 3 of a three-way left the player at Heart 0/16 with no results screen — the exact "every player must reach the summary" failure. Invisible to the balance sim by construction, which has no human seat and correctly plays every match to the last survivor. Mutation-verified: the un-fixed code strands the player for **7,028 ticks (~6 minutes)**; the fix ends it within 1. The first version of that test asserted only the end state and stayed **green** against the broken code — it had to be rewritten to measure the *delay*, which is what the bug actually was.

Also caught in-browser: a `.field-wrap` with no definite height ancestor rendered the board at **12px cells** with a screen of dead space beneath it; and rival chips (the send button) measured **38px**, under the 44px floor.

## Mutation verification
| Fix | Mutation | Result |
|---|---|---|
| Targeting = furthest along road | switch to nearest-to-tower | **80,407** mis-targeted shots (shipped: 0); every other assertion stayed green |
| Host promotion | make promotion a no-op | takeover test red |
| Host demotion | make demotion a no-op | demoted peer keeps broadcasting waves — red |
| Input geometry | trust the last drawn frame | 4 tests red across all three modes |
| Human-out ends match | force `humanOut = false` | 7,028 ticks of dead board — red |

## Build Status
- npm install / test / build / local play / multiplayer smoke: **pass / pass / pass / pass / pass**
- **Every mode verified in-browser at ~375px (principle #20), locally AND on live production:**
  - **Skirmish** 9×13, 39px cells — fits, no overflow, controls on-screen, tower placement works
  - **Tangle** 7×15, 41px cells — fits, no overflow, road visibly re-routes around a wall
  - **Siege** 11×13, 32px cells — fits, no overflow, **two gates and two independent roads** confirmed rendering
  - Each was tapped **without an intervening repaint**, which is the condition that exposed the input-geometry bug.

## Deployment
- Repo created: ben-gy/sporeline · Pages enabled (workflow build) · Cloudflare DNS CNAME added
- Pages CNAME set **once** and deliberately not cycled (the emberwake lesson) — TLS cert reached `approved` promptly
- Production: `https://sporeline.benrichardson.dev` → 200, correct `<title>`, every asset 200, zero console errors
- PR: https://github.com/ben-gy/sporeline/pull/1

## Known limitation
Siege's 11 columns force **32px cells** at 375px width, below the 44px ideal. Geometrically unavoidable on a phone at that column count; flagged rather than hidden. Every *control* (tray chips, HUD buttons, rival send chips) is 44px.

## Errors & Resolutions
Beyond the five mutation-verified fixes above: none. `tsc --noEmit` is clean, no `console.*` in shipped code, no control bytes, no vendored engine.
