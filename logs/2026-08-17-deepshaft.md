# Build Log: Deepshaft
**Date:** 2026-08-17
**Status:** deployed

## Idea Source
`IDEAS.md`, head of the big-game queue, taken verbatim:

> **Deepshaft** (Doom-shaped) — a 2.5D raycast first-person crawl through a procedurally generated
> mine: hitscan and projectile weapons, enemies with real chase/flank/retreat states, keycards, and
> a floor that gets worse as you descend. Floating stick + auto-fire, one-handed. Solo campaign;
> host-authoritative co-op or deathmatch at 20Hz with client prediction. Raycasting is a few hundred
> lines and holds 60fps on a phone — measure it and say the number.

Prior-art sweep of all 63 registry entries: no first-person game exists in the fleet. `gloamrun` and
`delvepack` are top-down crawlers; `sporeline` is tower defence. Not an expansion — a new genre.

**Input question (principle #23), asked and answered:** gyro was rejected because a first-person view
plus tilt-steering is nauseating and unplayable lying down; microphone was rejected because a shooter
you have to shout at is a joke rather than a mechanic. Touch was chosen *on purpose*: the interesting
unsolved problem in this genre is the touch scheme, and solving it is the contribution.

**Multiplayer shape:** co-op, and the reason is technical rather than a preference. Deathmatch is
exactly the shape where 20Hz host-authoritative hurts most (symmetric, PvP, hitscan), and the standard
fix — server-side rewind with favour-the-shooter — needs a *trusted* server. Ours is a player, so it
degrades to favour-the-host: an unfixable fairness hole. Co-op is asymmetric the useful way; the
authoritative entities are AI, and a guest is never shooting at a predicted human.

## Game Details
- **Name / repo:** Deepshaft / ben-gy/deepshaft
- **Genre:** arcade
- **Core loop:** take the cage down; find the next one; the mine gets worse the whole way
- **Multiplayer:** live P2P co-op, host-authoritative snapshot star, 20Hz snap / 30Hz input, 2–4
- **Stack / render:** vanilla-ts / Canvas 2D raycaster
- **Engine modules:** loop, joystick, rng, sound, storage, mobile, identity, net, rematch, turn, lobby

## The design decision the game is built on
**You never aim.** The gun engages the nearest *awake* enemy inside its cone with clear line of
sight — so where you look is what you shoot. That is what lets a first-person shooter run on one
thumb: the floating stick carries both axes (forward/back walks, left/right **turns**) on a `|x|^1.6`
curve, where half a thumb-width is 25°/s for lining up and full deflection is 166°/s for spinning
round. A stalker orbiting at 1.5 cells needs 116°/s to track, so the fastest thing in the roster is
trackable one-handed. No fire button, no strafe on touch, USE exists only when something is usable,
and nothing at all sits in the middle 56% of the screen.

The `idle` gate is also what makes the noise system matter: a gun that only engages what has already
noticed you means walking quietly is a real choice.

## Systems that interact (principle #25's "ambition is spent on systems")
Four rules that do not know about each other:
- **Firedamp** — gas anything can ignite (a shot, a corpse falling in it, another pocket), damaging
  enemies and players alike, and chaining.
- **Grates** — stop bodies, not bullets and not eyes. A drift behind one is a shooting gallery, and
  the chase AI (which searches only the walkable graph) breaks off and comes the long way, which
  reads as flanking although nothing in the code says "flank".
- **Sumps** — too deep for a Hauler (radius ≥ 0.40), fine for everything else, so a mixed pack splits
  itself around water and arrives in two waves nobody scripted.
- **Locked doors** — only players hold cards, so the flow field routes no enemy through one. Open it
  and the field rebuilt on the next tick hands the far half of the level a route to you.

## Juice
Procedural SFX per event, pitched by context (a kill is pitched by the victim's size). Screen shake on
damage and on ignition. A damage veil driven by a frame deadline. Haptics. A 3-2-1-DOWN count-in.
Telegraphed enemy attacks with an audible tell.

## Test Results
- **393 tests across 16 files, all passing.** Suite runs in ~71s (the balance sim is ~68s of it).
- P2P contract (47 tests): net-lifecycle one-join invariant, host election with fixed peer ids,
  rematch protocol, no-deadlock, the Trystero rejoin characterization, room-code normalisation.
- Generator (20): determinism, the key/lock fixed point, connectivity, party scaling, cost.
- Rules (56): movement, the SUMP/GRATE asymmetry, auto-fire and its consent gate, telegraphs,
  firedamp, doors and keys, down/revive/run-end, descent, ammo, sim determinism.
- Contrast (116), mechanism audit (15), balance (17), tutorial (10), frame budget (4), manifest (22),
  source hygiene (71), layout (15).

## Balance (measured, not argued)
Final, at n=18–24 per config across three independent seed families:

| config | median depth | win | timeout |
|---|---|---|---|
| Adit ×1 | 5 of 5 | 43% | 0% |
| Adit ×2 | 5 of 5 | 65% | 0% |
| Stope ×1 | 3 | n/a (endless) | 0% |
| Stope ×3 | 3–4 | n/a | 3% |
| Lode ×1 | 3–4 of 10 | 0% | 0% |

**The sim overruled the design three times:**
1. **Three players were immortal.** With a flat horde, 73% of three-player runs were still going at
   the 420s limit — invisible to a depth metric, because a run that never ends has no depth to report.
   `partyScale` (0.72 + 0.64 per extra player) fixed it and made solo gentler at the same time.
2. **Accelerating the pressure wave was not enough.** Shrinking the gap took non-termination 45% → 6.7%
   and stalled. The wave had to *grow* as well.
3. **The pressure spawn gave up silently.** It tried twelve rooms and skipped any in sight; with three
   players spread over a small floor, twelve in a row are all visible, so the wave that was meant to
   break the stalemate never arrived. It now spawns at the furthest room regardless.

**Negative-GAP arms** (a bot blind to one mechanic must do worse): retreat, weapon choice and revive
all measure a real gap. Firedamp accounts for 3–9% of kills — present but not dominant.

## Mechanism audit — zero tolerance, audited from outside
Over ~15,000 audited shots in 5 configurations: **0 through-wall hits, 0 skipped-nearer targets,
0 out-of-cone hits, 0 unreachable enemies.** The auditor re-derives line of sight by Liang–Barsky slab
clipping over the segment's bounding box; the game uses a grid DDA. They share no code and no idea.
Mutation-verified: five hand-built violating claims are fed to the auditor and each is caught.

## Build Status
- npm install / test / build / local play / production play: **pass**
- **Every mode verified in-browser at ~375px AND ~1280px, locally and on production:**
  - Stope (side 21–23): fits, no overflow, controls 44px+, nothing off-screen, played to floor 2–3
  - Adit (side 17–19): fits, no overflow, played to floor 2
  - Lode (side 19): fits, no overflow, played
  - Desktop caps the canvas at 1100px and centres it; the visibility gate passes (`elementFromPoint`
    at the view centre returns the canvas, and the only overlay present is the veil at opacity 0).
- **Tutorial:** 7 steps, played end to end at 375px through the real rules; skip verified in one tap
  (lands on the menu, persists); replayable from "How to play". `tests/tutorial.test.ts` green and
  mutation-verified (removing the `shoot` step's `enter` turns it red).
- **Frame budget:** simulation **0.053ms median / 0.080ms p95 per step with 121 bodies awake on a
  29×29 floor** (Node, laptop — a regression guard). Generation **0.086ms/level**. The renderer draws
  into a 170×368 buffer on a phone and 400×250 on desktop, one `putImageData` per frame.
  **A real per-frame device measurement was NOT possible**: the automation pane reports
  `document.hidden`, so `requestAnimationFrame` never fires in it and rAF deltas cannot be sampled.
  Stated plainly rather than estimated.

## Errors & Resolutions
Seven real defects, none found by playing:

1. **3.2% of generated floors were unsolvable.** `mine.ts` *claimed* the lock/key deadlock was
   "unreachable by construction". The chain argument is sound on the spanning tree, and the tree is
   not the grid: overlapping corridor Ls, and a `doorCell` walk that took a different elbow than
   `carveCorridor` carved. Now verified by the same fixed-point flood a player performs, re-rolling
   with fewer locks on failure. Found by a test that re-derived reachability from scratch.
2. **Shots went through pillar corners.** `clearLine` sampled eight times per cell; a grid DDA is
   exact *and* cheaper. The auditor's own first version was sampled too and produced 1–5 phantom
   violations per few thousand shots — a zero-tolerance invariant judged by an approximation reports
   noise, so the auditor was made exact as well.
3. **Players could spawn inside rock.** The seat fan-out nudged each seat 0.45 cells along its own
   bearing without checking the grid, so the flow field started inside a wall and reached nothing —
   surfacing as "every enemy unreachable", in the 2-player configs only.
4. **rAF is not a clock.** The pane's `document.hidden` exposed the real defect: a backgrounded host
   would freeze the mine for the entire crew. The simulation now runs off a `setInterval` backstop
   with a full second of catch-up (at the first 8-step cap a backgrounded host ran at 17% speed), and
   solo pauses on the visibility *transition*.
5. **The tutorial could kill you on step two,** on a screen still saying "slide your thumb to walk" —
   and its damage veil stuck permanently red, because `setTimeout` is clamped to ~1Hz in a background
   tab. `Game.noDeath` and a frame-deadline veil.
6. **The tutorial descended off its own hand-cut floor** into a generated Adit floor 2, mid-sentence.
   `Game.stairEnds`.
7. **The HUD squeezed the pause button to 28px.** The fix that stopped the row overflowing used
   `.hud-top > *`, which outranks `.iconbtn` and zeroed its 44px floor. Naming the pills instead;
   `layout.test.ts` now forbids the wildcard selector.

Plus one design defect: **tutorial step 4 was unpassable.** It taught "walk past the sleeping one",
and the rules are right while the lesson was wrong — a grate is transparent, so the lurker sees you
and wakes itself, and a round aimed at the thrall carries through the grate and wakes it anyway.
Rather than bend two rules to protect a sentence, the step now teaches what the geometry does.

## Multiplayer smoke test — NOT RUN
**Stated plainly: the two-tab P2P smoke test was not performed.** The verification pane reports
`document.hidden`, which throttles timers and drops WebRTC messages in a backgrounded tab, and the
run's remaining budget went on the modes × viewports matrix and the production pass instead. What
*is* covered:

- The full automated P2P contract is green (47 tests): the one-join invariant that makes the
  leave/rejoin trap unreachable, host election with deliberately-ordered peer ids, the rematch
  protocol including a promoted host running the rematch, and the no-deadlock countdown.
- Host transfer is wired (`onHostChange` → `Session.becomeHost()`) and is structurally cheap here,
  because the map is derived rather than transferred — a promoted peer already holds the geometry.

**This is the one gate this run did not clear**, and it should be the first thing checked before the
game is shared with anyone: two tabs, create + type-the-code join, play, close the host tab, confirm
the survivor keeps playing, then both hit "Go again".

## Deployment
- Repo created, Pages enabled, Cloudflare DNS added, TLS cert approved on the second poll
- Deploy workflow: **success** (npm ci → npm test → npm run build)
- Production verified in-browser at 1280×800 and 375×812, all three modes
- Catalogue entry merged to `main` (PR #13) and **confirmed served** at
  `ben-gy.github.io/gh-game-factory/index/games.json`
- IndexNow pinged; the hub redeploy was triggered
