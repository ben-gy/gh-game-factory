# Build Log: Realmfold
**Date:** 2026-08-16
**Status:** deployed

## Idea Source

IDEAS.md, first entry of the board-game initiative, taken verbatim:

> **Realmfold** (Kingdomino-shaped) — draft numbered dominoes in a turn order set by the tiles
> themselves (grab a strong tile, pick later next round), connecting matching terrain into a tidy 5×5
> kingdom with crown multipliers. vs 2-4, host shuffles; grid size = modes.

Removed from IDEAS.md in this run.

**The input question (principle #23), asked and answered on purpose.** Considered gyroscope,
microphone level and camera motion; rejected all three. This is a turn-based tile-placement board
game taken from the front of a deliberately ordered queue, and the input that fits it is a finger on
a grid — a sensor here would be a costume rather than a mechanic. **But the registry check says a
sensor run is genuinely overdue:** the last six shipped games (torc, hearsay, lustre, conduit,
huntress, weald) are all tap-and-key. Flagged here so the next run that is *not* a board-game-queue
entry reaches for one.

## Game Details
- **Name / repo:** Realmfold / ben-gy/realmfold
- **Genre:** board
- **Core loop:** claim a doublet from a face-up row and place it on your own demesne; next round's
  pick order is this round's claims sorted lowest-first, so the best tile costs you the initiative
- **Multiplayer:** live P2P, 2–4, **hostless deterministic lockstep** over a whole-log wire protocol
- **Stack / render:** vanilla-ts / DOM
- **Engine modules:** net, rematch, turn, lobby (+ qr), rng, sound, storage, identity, mobile, mobile.css

## What the simulation changed about the design

This is the part worth reading. Three things that looked obviously right were measured and were
wrong, and one confident fix was measured and was the wrong lever.

**1. Shire was specified with 16 doublets and the game's central mechanic was inert in it.**
At 16 (32 cells on 48 open) there is so much room that every doublet is placeable everywhere, so the
draft collapses to "take the most coronets" and pick order stops meaning anything. Measured: a
control arm identical to the shipped bot but **blind to pick order** scored **−0.04** against it —
i.e. the entire trade this game is built on was worth *nothing* in that mode — and the player holding
round 1's first slot finished **3.4 points ahead**. At 18 doublets (36 cells on 48, 75% fill) the GAP
is **+2.02 ± 0.84** and the first-pick edge falls to **1.6**.

**The obvious fix was the wrong one.** Turning off Shire's colony rule — the thing that makes
everything placeable — barely moved the GAP (**+0.74**) and made the pick-order bias *worse* (4.13).
Density was the variable the whole time, and only a sweep found that.

**2. holt's veto is worth nothing, and holt was designed around it being worth something.**
The intent was that burning a doublet would make going *last* worth paying for, inverting the game's
only dial. The sweep says no: the tempo GAP peaks at veto weight **0** and goes **negative** above 1
(at 1.35, tempo-aware play *loses* by 1.4). `VETO_W` therefore ships at **0**, and the mode earns its
place on what the burn measurably does instead — mean margin 5.5 against croft's 8.9, blowout rate
0.00 against 0.08, scores twelve points lower. `tests/balance.test.ts` re-runs the sweep and fails if
some other weight ever wins.

An earlier version of holt had the last claimant burn one of the two *leftovers*. That measured worse
than useless, for the reason a judge predicted before the sim ran: after everyone has claimed, the
leftovers are by construction the tiles nobody wanted, so the "veto" is the power to destroy junk.
Restructuring it so the burn happens **first**, at slot 0, against the whole row, is what made it a
real decision. It cost one extra turn per round and no new move kind.

**3. Two bot terms that looked obviously right were worth nothing or less.** A foresight term testing
the resulting board against what was still in the pool: 50.8 vs 51.4, i.e. slightly worse. Raising the
denial weight from 0.3 to 0.55: **−1.3 points**. Both dropped rather than kept as decoration.

**4. The order weight has a cliff.** Optimum near 0.75; at 1.5 the bot loses by 3.6 and at **2.2 it
loses by twelve points**, because it spends the whole match paying for a tempo it never cashes. That
is also why `ORDER_W` ramps to zero on the final round — the last claim buys nothing, so it must be a
pure grab.

**What is healthy.** Leader after round 3 wins 33% at four players (chance is 25%), rising 44% → 58%
→ 75% by round 11: flat and near chance early, decisive only at the end. Every round-1 pick position
lands within 3 points across all three modes. Blowouts 8% in croft. Discard rate 36% of player-games —
bounded *below* as well as above, because a rate of zero would mean the fill bonus is a free ten
points for everybody.

## Juice
Procedural sound throughout (`src/cues.ts`, seven custom patches): a claim is **pitched by the
doublet's number**, so a fat pick literally sounds expensive; a merge rises with the region; the burn
is a falling sawtooth. Placement drops with a 120ms scale-pop, a merge pulses the board ring, a
discard shakes it, and haptics fire on place and burn. All of it degrades to instant state changes
under `prefers-reduced-motion`. 3-2-1 count-in with audio before every round.

## Test Results
- **309 tests, 309 passing**, 17 files. `tsc --noEmit` clean.
- Balance sim: 16 assertions over nine (mode × player count) configurations. **~43s** — far over the
  routine's "a second or two", and stated rather than hidden: it is the price of nine configurations
  and it is cheaper than the version of Shire it caught.
- Mechanism audit: 16 assertions at zero tolerance, importing **neither `rules.ts` nor `score.ts`**,
  each with a mutation control that must come out red.
- P2P-sync determinism: byte-identical `createState` and `derive` across peers for 8 configs;
  `derive` proven order-independent on real logs, shuffled, reversed and one entry at a time.
- Contrast: every meaningful colour ≥3:1 against every surface it can sit on, all six terrains inside
  a luminance band, and a distinct glyph asserted for each.

## Build Status
- npm install / test / build / local play / multiplayer smoke: **pass** (all five)
- **Modes × viewports matrix — every cell walked in a real browser, locally and on production.**
  3 modes × 3 player counts × 4 viewports (320×568, 375×812, 812×375 landscape, 1280×800) = 36 cells
  locally; 3 × 3 × 2 on production. Every one: no horizontal overflow, no overlapping offers, every
  control ≥44px, nothing off-screen, every `[hidden]` computing `display:none`, and the board the
  topmost element at its own centre.

  **Two bugs found this way, both invisible to every other gate:**
  - **Shire's bottom row went off a landscape phone.** The engine's `mobile.css` puts a 44px floor on
    every button so controls stay thumb-sized; a board cell is a button and is not a control. Grid
    rows came out 44px against 36px cells. It appeared in **one cell of the matrix and none of the
    others** — 7×7 at 812×375 — which is precisely the shape principle #20 exists for.
  - **`--cell` was sized from `dvh`.** dvh is the viewport as it is *right now*, so the board is
    built for a hidden URL bar and overflows when the bar returns; measured here it resolved to 428
    against a 375px viewport. Now `svh`. Both are ratcheted by `tests/layout.test.ts`.
  - Also fixed from the browser: the row offered **"1st–5th of 4"** on holt's burn turn, and at
    320×568 the second row of doublets and the Quit button ran past the fold.

## Multiplayer smoke test (two tabs, local build) — all six gates

1. **Typed-code join.** Tab A created room HQJX; tab B typed `' hq jx '` — lower case, stray spaces —
   into the Join field and landed in the same room. **QR:** panel opens, square 268×268, black on a
   **light** card, encodes the invite *link* (not the bare code), caption names the room, invite row +
   toggle + panel all inside the lobby card, no page overflow. Screenshotted at 375px and looked at.
2. **In-sync play.** B's burn (#41) and claim crossed to A; identical logs and `claimedBy` both ways.
3. **Host transfer — the host torn down mid-turn, with the room waiting on it.** The survivor was not
   frozen: the absent seat was flagged and the room played its turns (log 2→4→5→6 across three
   observed fill cycles, ~45s apart as designed), and the survivor reached a **full results screen
   with both players' breakdowns**, the departed one marked "(left)".
4. **Peer-leave grace.** Covered by the same run.
5. **Host stickiness + stale room.** The creator **kept HOST after the guest joined**, and the guest
   rendered the host's *gossiped* mode ("The host chose Holt") rather than its own. After leaving, the
   URL was cleared and "Play with friends" offered create/join rather than teleporting back in.
6. **Rematch.** Both peers voted, landed in a **fresh round in the same room** with an identical
   reveal and empty boards, and a claim still crossed the mesh — proving it was genuinely alive and
   not merely repainted.

**Honest limits.** The pane's synthetic mouse injection was unavailable for this entire run
("Browser pane is currently hidden" on every `left_click`), so every interaction was driven by
dispatched `pointerdown`/`pointerup`/`click` sequences — the technique the visibility gate itself
prescribes — rather than by real OS-level clicks. **A real double-tap-to-zoom check was therefore not
possible**; `hardenViewport()` and the engine's `mobile.css` are asserted at source level instead.
And the host-transfer run was verified over three fill cycles rather than by sitting through all ~55
absent turns (~40 minutes); `tests/takeover.test.ts` proves the unattended run to `over === true`
deterministically.

## Deployment
- Repo created / Pages enabled (Actions) / DNS CNAME / TLS **approved** / catalogue entry on `main`
- Production verified in-browser at 375×812 **and** 1280×800, every mode, with a real claim-and-place
  interaction performed through the shipped UI on the live site. Zero console errors from the game
  (the one entry is a cross-origin `transferSize: 0`, and `window.feedback` is defined, so the widget
  loaded and self-mounted).

## Errors & Resolutions

- **Preview port 5199 was already serving another project.** `--strictPort` did not stop vite
  falling through; caught by checking the served `<title>`, which read "Radio Spectrum". Moved to 5233.
- **`slotRange` reported "1st–5th of 4"** on holt's burn turn — the claim index is −1 there because
  nobody has claimed yet. Capped at the number of claims, and the slot preview is now suppressed
  entirely on a burn turn, where it answers a question the player is not being asked.
- **Only the first of each duplicate handle was disambiguated.** Two tabs on one device share the
  store, so both peers arrived as "Reeve 858"; renaming in place fixed one and left the other, because
  once it had become "Reeve 858 (Amber)" the second no longer looked like a duplicate. Found in the
  smoke test.
- **The rival strip truncated names to "Amb…" in Shire and not in Croft** — a 7×7 thumbnail is half
  again as wide as a 5×5 one, and three of them share a 375px row. Same component, legible in one mode
  and not another.
- A subagent noticed a comment crediting the wrong line for the `slotRange` fix. Corrected: the outer
  `Math.min` is the invariant, the clamp is belt and braces.
