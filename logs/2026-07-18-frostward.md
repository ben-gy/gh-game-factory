# Build Log: Frostward
**Date:** 2026-07-18
**Status:** deployed

## Idea Source
IDEAS.md, first entry (removed on take):

> Frostward — a creeping frost called the Rime spreads across a square grid as a deterministic cellular automaton and 2–4 players each guard three Hearths in their corner, playing cards each turn to bend the prevailing Gale, dig warm Thaw-patches and raise Ridge-walls the frost can't climb, or Leap an ember of cold beside a rival's Hearth […]

Kept faithfully, with two deliberate departures, both forced by the balance sim:

1. **Seats are not in the corners.** They sit at `2πk/N + θ(seed)` on a circle, with θ seed-random, because a square lattice is not 3-fold symmetric and putting three players in three corners of a square is precisely the invisible seat-fairness bug principle #18 exists to catch. Hearths then fan across a *fraction of each sector* rather than clustering.
2. **The Gale's random drift became a leader-hunt.** The idea proposed "a hard cap on random drift"; a deterministic drift toward whoever holds the most hearths is strictly better (no RNG to sync, and it terminates games). It did NOT do what the plan claimed — see below.

## Game Details
- **Name / repo:** Frostward / ben-gy/frostward
- **Genre:** board
- **Core loop:** The Rime spreads only into the Gale's forward arc, so it grows as a cone that sweeps as the wind swings. Everyone secretly commits one card a turn; every Veer that turn *sums*. Then the Rime steps. Last player with a lit hearth wins.
- **Multiplayer:** live P2P, 2–4. Host adjudicates *which commits happened*; the turn resolution is a pure function of `(seed, mode, roster, commits)`, so no board state is ever transmitted.
- **Stack / render:** vanilla-ts / DOM
- **Engine modules used:** net, rematch, lobby, rng, drag, storage, identity, mobile (+ mobile.css); sound extended locally

## Juice
Procedural Web Audio throughout — the Rime's hiss is **pitched by how many cells froze**, so you hear the size of a step before you finish reading the board. Wind whoosh on a Veer, stone thud on a Ridge, warm rising fifth on a Thaw, crackle on an Ember, a held ping when a hearth beats the frost back, a descending tone when one goes dark. CSS particle bursts on melts, embers, guards and snuffs; screen shake scaled by whether the snuffed hearth was yours; the Gale arrow tweens 260ms so you *see* the wind swing. 3-2-1-BLOW countdown carried by audio. All degrade under `prefers-reduced-motion`.

## Test Results
- Tests written / passed / failed: **230 / 230 / 0** across 15 files
- P2P-sync determinism test: **pass** (including a match played with `Math.random` poisoned to throw)
- Balance sim: **pass** (30 assertions; ~7s)
- Host-transfer takeover: **pass** · Room-code: **pass** · Rematch lifecycle: **pass** · Host election: **pass** · Trystero characterization: **pass** · Layout invariants: **pass**

### What the balance sim overruled
Built the sim FIRST and took a baseline before tuning anything. The design as written was broken:

| | median turns | leader@t2 | winner untouched | 4P seats |
|---|---|---|---|---|
| baseline | 3–10 | 70–81% | >50% | 20/22/23/**35** |
| shipped | 13–29 | n/a (only ~10% of games have a leader by t4) | 16–40% | 26/24/26/24 |

**Accepted:**
- **The flank rule.** Frost always advances straight down the Gale but only creeps sideways into a cell that already has two frozen neighbours. Small early, big late — and it added *zero* new state, because "how old is this frost" was already written on the board. Median 7→15; 4P leader@t8 83%→52%.
- **Hearth guard (1) + rime delay (1).** Together they took 4P seats from 20/22/23/35 to 26/24/26/24. The seat bias was **not geometric** — everyone's first guess — it was that in a fast game the first cone decided everything. Neither lever alone worked: guard-only left 19/27/28/26, delay-only left 19/26/23/31.
- **Fanned hearths** across a fraction of each sector rather than a fixed 34° cluster. 2P blowouts 57%→34%.

**Refuted:**
- `hearthGuard: 2` — longer games (median 29), no curve improvement, and emberfall blowouts went UP to 68%.
- `rimeDelay: 2` — worse than 1 (2P leader@t8 80% vs 67%).
- Lowering Whiteout's turn cap — did nothing to the median, only converted natural endings into counts. Stepping every **2nd** turn instead of every 3rd is what shortened it (median 33→24, blowouts 27%→19%).
- **driftHunt.** Written into the plan as THE anti-snowball lever. Measured against a paired control it barely moves the leader curve (4P leader@t18: 66% with, 67% without). What it genuinely does is **terminate** games — without it Whiteout's 4P median runs 42 turns instead of 30. Kept as a pacing lever; the comment in `game.ts` was rewritten and a test now pins the honest description so nobody re-derives the original story.

## Build Status
- npm install / test / build / local play / multiplayer smoke: **pass / pass / pass / pass / pass**
- **Every mode verified in-browser at true 375×812, locally AND on live production (principle #20):**
  - **Drift** (11×11, 121 cells) — 33.7px cells, no overflow, no overlaps, board is the topmost element at its centre, footer hidden mid-round. Fits.
  - **Whiteout** (13×13, 169 cells) — 28.5px cells. **This is the mode that found a bug** (below). Fits.
  - **Emberfall** (9×9, 81 cells, hand of 4) — 41.2px cells, four cards fit comfortably. Fits.
  - Zero console errors in every mode, local and production.
- **Two-peer P2P smoke test on the real public relay (all six gates):**
  1. Typed-code join — typed `gm-qy` (lowercase, stray dash) → normalised `GMQY` → landed in the creator's room. Not the link.
  2. In-sync play — identical board fingerprints across both tabs at every sample.
  3. **Host transfer — closed the host tab mid-game; the survivor was promoted, the vacated seat became bot-played, and it drove the match all the way to a full results screen.**
  4. Peer-leave grace — vacated seat auto-played, no stall.
  5. Host stickiness — the joiner did not steal host; a *third* peer joining later deferred to the **promoted** host. Neither tab showed a host badge before the mesh settled.
  6. **Rematch — both peers voted and landed in one fresh round, same room, identical board fingerprint, mesh provably alive.** A single voter saw "Waiting for 1 more" rather than a silent hang.
- `?room=` cleared on leave; "Play with friends" then offered create/join rather than teleporting back into the dead room.
- Anti-zoom verified live: `gesturestart` cancelled, second `touchend` cancelled, `dblclick` cancelled, first tap still allowed.

## Errors & Resolutions

**1. The game was a slot machine (found by the balance sim).** Covered above. The fix is documented in `game.ts` `threatened()` and in the header of `tests/balance.test.ts`.

**2. Solo game froze forever once your own hearths went dark.** With no turn clock (solo has none), the only thing driving a turn was the local player committing — so the moment you were eliminated with two bots still standing, nothing advanced the game. Frozen board, no results screen, no way out but a reload. Fixed by re-checking at turn-arm whether every *remaining* seat is a bot, clock or no clock. **My first fix didn't work**: resolving calls `apply → armTurn → maybeResolve`, which the re-entrancy guard then refused, so the follow-up never happened. Made it a loop instead of recursion. Mutation-verified (single-shot loop → RED).

**3. Bot burned cards it should have played.** A turn-one hand of three Thaws scores no candidate (nothing is worth melting yet), and the fallback returned a nonsense target. Invisible except as a slightly weaker opponent — and it also degrades the balance sim that the whole design was tuned against. Fixed with a guaranteed-legal fallback. Mutation-verified. Added `tests/bot.test.ts` asserting every returned commit is legal against the board it was shown.

**4. Whiteout's 13-column board gave 26.7px cells at 375px** — caught by the layout guard before any browser saw it. The board now bleeds back over `.main-content`'s padding on a phone (28.5px), and `tests/layout.test.ts` does that arithmetic explicitly so the fix can't be silently reverted. Mutation-verified.

**5. A guest could see nobody ready, ever.** Only the host receives commits, so in a game whose entire tension is simultaneous commitment, the host had all the social information and everyone else had none. **Found only in the two-tab browser pass — no unit test was looking for it.** Added a `lok` roll-call channel: the host broadcasts *who* is locked in, never *what*.

**6. "Change my card" only changed the button.** A guest un-committing cleared its own state while the host still held the withdrawn commit and would resolve the turn with the card the player had just taken back. Found by the test written for #5. Fixed by having a guest send a withdrawal.

**7. "0 turns under the Gale" for a player who lost every hearth.** The summary stat measured the seat's *centre* angle, so a cone eating the outer hearth of a player's fan didn't count. Spotted by reading an actual results screen rather than by any assertion. Now measured against the hearths themselves.

**8. A measurement that lied.** An early overlap probe reported seat-chip overlaps in Whiteout; it was comparing chips across a *wrapping* flex row, where reusing x-space is correct. Replaced with a real rect-intersection check, which reports zero. Worth recording because the instinct was to "fix" a layout that was already right.

## Notes
- Set the Pages CNAME **once** rather than cycling it, per the known failure where repeated cycling requeues TLS issuance for 70+ minutes. Cert reached `approved` within minutes and production served HTTPS 200 on the first check.
- Two concurrent factory sessions were taking from IDEAS.md during this run; the Frostward line was removed before any other edit, and no other entry was touched.
