# Build Log: Lumenlock
**Date:** 2026-07-17
**Status:** deployed

## Idea Source
**Invented.** IDEAS.md was empty. The registry covered arcade (gravity-golf, snake-royale, rhythm-relay), board (hexbloom), word (cipher-clash) and party (nightwire) — **puzzle** was the obvious gap, and nothing in the org (`gh repo list ben-gy`) clashed.

Rather than re-skin a classic, the fresh mechanic is the **prism**: white light entering fans into a rainbow, red bending left, green straight on, blue right. That single rule turns a tap-to-rotate mirror maze into a colour-routing problem, and it's one sentence to explain.

The best thing in the game wasn't designed — it fell out of the model. Crystals *sum* what they receive and must match exactly (so a stray beam spoils one), which means a **white crystal accepts either untouched white light OR red+green+blue recombined**. That emerged from the mask arithmetic during test-writing and got promoted to a headline mechanic.

## Game Details
- **Name / repo:** Lumenlock / ben-gy/lumenlock
- **Genre:** puzzle
- **Core loop:** Tap a mirror → the whole beam re-routes instantly → read the new path → tap again, until every crystal drinks its own colour.
- **Multiplayer:** **async-seed, deliberately not live P2P.** A contemplative puzzle gains nothing from a lobby and a latency budget; it would be multiplayer as decoration. Instead: deterministic seeds mean `?l=5` / `?d=2026-07-17` / `?s=seed&l=8` hand a friend the byte-identical board, plus a UTC-seeded **Daily Lock**. No net/lobby/rematch, no trystero. The determinism gate still applies and is tested — async sharing is a lie without it.
- **Stack / render:** vanilla-ts / canvas (12 kB gzipped, zero runtime deps)
- **Engine modules used:** rng, loop, sound (extended), storage, mobile.ts + mobile.css. Not used: net, lobby, rematch, input (the game is discrete taps; no D-pad, no continuous input).

## Juice
Additive ('lighter') beam compositing so overlapping beams mix on screen exactly as the masks mix in the model; travelling dashes so the board is alive at rest; eased mirror flips; crystal pop + coloured particle burst on lock; lock tones pitched as a chord (red root / green fifth / blue octave) so completing a board plays music; screen shake + white flash + full bloom on solve. Reduced motion honoured from the OS and overridable in-game.

Accessibility: colour is never the only signal — every beam and crystal carries a glyph (● ▲ ■ ◆) and its own dash rhythm, so the board plays in greyscale. Palette is orange-red / lime / cyan, separated on both the red-green axis and by lightness.

## Test Results
- Tests written / passed / failed: **341 / 341 / 0**
- P2P-sync determinism test: **pass** (async form — same seed → byte-identical board; every share link round-trips to the same board)
- Par-is-the-minimum: **pass** — verified per level against an independently written brute-force searcher
- Coverage: physics (incl. loop + combinatorial-branch termination), generation across 30 levels, difficulty ramp, session lifecycle, share links, renderer effect lifetime

## Build Status
- npm install: pass · test: pass · build: pass · local play: pass · production play: pass

## Deployment
- Repo created / Pages enabled / DNS + TLS: pass
- PR: https://github.com/ben-gy/lumenlock/pull/1
- Live: https://lumenlock.benrichardson.dev

## Errors & Resolutions

**Three real bugs, all found by actually playing rather than by tests. All fixed and mutation-tested (reverted → seen RED → restored → green).**

1. **Par was a number we made up.** Par was the *scramble count*, which is only an upper bound — several scrambled flips are usually irrelevant. The first browser playthrough solved level 1 in **1 flip against par 2**, so the game congratulated the player for "beating the generator" on their first click. Replaced with an exhaustive ascending-depth search for the true minimum (pruning keeps boards at 3–9 live pieces, so it's a few hundred traces, ≤15 ms). "Under par" became impossible by construction, so the verdict is now **"Perfect — no shorter solution exists"** and the results label reads "Best possible".

2. **The difficulty ramp was inverted.** Dense boards mostly *fail* crystal placement (a crystal absorbs light another one needed), so the attempts that survived were the sparse ones: **level 20 generated 3 mirrors on a 10×10 grid — emptier than level 10**. Added a per-level live-piece floor (`minPieces`) and raised the attempt budget. Live pieces now climb 3 → 13 and crystals 2 → 4. The old test only asserted the grid grew and sailed straight past it.

3. **A new board inherited the previous solve's white flash.** Effects decay in the rAF loop, and **rAF is paused while a tab is hidden** — so "it fades in 600ms" is only true if the player is watching. Caught on the production mobile screenshot: level 5 opened under a full-board grey wash. Added `View.reset()` on every board start/restart.

**A mutation that survived, and what it exposed.** Weakening the crystal rule from "matches exactly" to "receives any of its colour" left the suite **green** — the stray-beam test was passing for the wrong reason, because its crystal received no beam at all. Rewritten to route the prism's red back around into a green crystal (so it gets green *and* red); it now fails correctly when the rule is weakened. Without the mutation pass this would have shipped as a test that proved nothing about the game's central difficulty rule.

**Verification note.** The first production re-check appeared to show the flash bug *surviving* the fix. It hadn't: GitHub Pages had served a **cached index.html** pointing at the old bundle. Confirmed via `performance.getEntriesByType('resource')`, busted the cache, and re-ran the full repro against the new hash. Worth remembering — a production check against a stale bundle looks exactly like a failed fix.

**Non-issues ruled out.** A Dependabot workflow run shows as failed on the repo: those runs can't obtain the Pages OIDC token, and it is unrelated to the game (both real commits are green). The in-pane timer reading 0:00 was the clock correctly refusing to bill time while `document.hidden` — proven to advance 0:00 → 0:01 once visibility was simulated.
