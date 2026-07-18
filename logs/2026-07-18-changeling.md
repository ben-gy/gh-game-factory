# Build Log: Changeling
**Date:** 2026-07-18
**Status:** deployed *(pending final TLS confirmation — see Deployment)*

## Idea Source
IDEAS.md, first entry (removed from the queue on pick):

> "Changeling — real chess, standard pieces and win-by-checkmate, with one rule
> bolted on: the instant one of your pieces captures, it morphs into the type of
> whatever it just took… the tuning lever being whether the morph is forced or
> optional (keep-or-take) plus the AI's internal piece values."

Built as specified. The named tuning lever (`morph: 'forced' | 'choice'`) was
implemented as a real generation-level mode field from day one so the sim could
reach for it — and then not needed, because the sim found no snowball to fix.

## Game Details
- **Name / repo:** Changeling / ben-gy/changeling
- **Genre:** board
- **Core loop:** Play chess. Every capture morphs the capturing piece into what it
  took, so an exchange is a shape-shift you have to want. King is immune.
- **Multiplayer:** live P2P, 2 players, **lockstep** (not host-authoritative
  snapshots). No randomness and no hidden information means peers exchange only
  `{from, to, promo}` and both apply the identical forced morph — the boards
  cannot drift. The clock is the only host-authoritative state.
- **Stack / render:** vanilla-ts / DOM + procedural inline-SVG pieces
- **Engine modules used:** net, rematch, lobby, rng, sound, storage, drag,
  mobile (+ mobile.css), identity, countdown

## Design decisions worth recording
- **Versus, not co-op.** The routine's co-op-first bias is right for arcade and
  survival shapes and wrong here: chess *is* a duel, and co-op chess would mean
  two people sharing one side, removing the decision from one of them every other
  turn. Justified in plan.md rather than defaulted.
- **Lockstep, not snapshot star.** Chosen because it makes desync structurally
  impossible for this game, not to save work.
- **Promotion composes with the morph.** One uniform rule (`resultType` then
  promote) instead of a pile of exceptions. A queen taking a pawn on the last rank
  becomes a pawn and promotes straight back — a legal no-op, and the only place
  the two rules interact.
- **No countdown in solo.** 3-2-1-GO runs for every networked round (principle
  #15) but is skipped solo, where there is no head-start to equalise and it would
  only delay the player. A turn-based game with a clock that starts on White's
  first move has no fairness stake in it.
- **Perft as the correctness anchor.** The morph cannot change the legal-move
  *count* for the first three plies (no capture is possible), so 20/400/8902 pins
  the whole base generator against published numbers.

## Juice
Morph pop + white flash + SVG cross-fade on capture, with sound branching on
upgrade (`powerup`) vs downgrade (`hit`) vs level trade (`coin`); screen shake on
check and checkmate; tweened cell-relative piece motion; legal-move dots vs
capture rings (shape, not just colour); check pulse; last-move wash; and the
material *tide* bar, which is in constant motion because the morph circulates
material rather than accumulating it. All motion gated on `prefers-reduced-motion`.

## Balance — the sim refereed, and overruled the design twice
`tests/balance.test.ts` was written and baselined BEFORE any tuning.

1. **The first measurement lied.** Sampling the leader by raw material said an
   early leader wins only ~27% — wildly anti-predictive, which reads as "the game
   punishes whoever gets ahead". It was an artifact: under the morph, capturing
   first hands the recapturer both your freshly-upgraded piece and an upgrade of
   their own, so a material reading taken mid-exchange systematically favours the
   side about to be punished for it. Resolving pending captures first
   (`quietEval`) turned "who is ahead" into a real question. **Had the raw number
   been believed, the fix would have targeted a snowball that does not exist.**
2. **White's first-move edge does not survive the morph.** 260 paired games of
   Classic: White scores **46.5%** (draws 22%) where ordinary chess gives White
   ~55%. Same mechanism — moving first means more often *initiating* an exchange,
   and the initiator is the one who gets recaptured. The design feared "White's
   edge plus a snowball"; neither was there, so nothing was compensated for.

Committed baseline (printed on every `npm test`):
```
classic   white 46.5% (260 games) · leader-wins p12 36% -> p60 51% · 15.1 captures
skirmish  white 47.5% ( 80 games) · leader-wins p12 40% -> p60 61% · 11.8 captures
wildcourt white 54.2% ( 60 games) · leader-wins p12 58% -> p60 54% · 15.9 captures
```
Method notes: seeds are run in **pairs** with the bots' RNG streams swapped
between seats, so the seat number is not two noisy averages; a lead below 60cp is
deadbanded to "level" so dead-even positions are not bucketed as somebody's
advantage; and games still running at ply 160 are adjudicated the way an engine
match would be. Captures-per-game is asserted too, so a future "fix" cannot flatten
the win curve by quietly making capturing a bad idea.

## Test Results
- Tests written / passed / failed: **160 / 160 / 0** across 16 files
- P2P-sync determinism test: **pass** (lockstep replay of `{from,to,promo}` gives
  byte-identical positions in all three modes, plus a negative control)
- Host-transfer takeover: **pass** (11 tests — a guest does not move the clock, a
  promoted guest adopts it and can drive the game to `over`)
- Contract gates: room-code normalisation, one-join invariant, trystero-rejoin
  characterisation, host election, rematch lifecycle, no-deadlock — all green

## Build Status
- npm install / test / build / local play / multiplayer smoke: **pass / pass /
  pass / pass / pass**
- **Every mode verified in-browser at a true 375×812 (principle #20):**
  - **Classic** 8×8 — board 351px, cells exactly 44px, zero horizontal overflow,
    play surface top-most at board centre, all controls on-screen
  - **Skirmish** 6×6 — cells 59px, zero overflow, zero square overlaps, fits
  - **Wildcourt** 8×8 shuffled — cells 44px, zero overflow, and the shuffled back
    rank confirmed *identical for both sides* in the live DOM (fairness by
    construction, checked visually and not merely asserted in a unit test)
  - One layout issue found and fixed in this pass: at 375px the board is
    width-limited, so the whole stack sat against the top of the viewport with a
    dead band beneath it. Fixed by centring `.game-wrap`.

## Multiplayer smoke test (two tabs, all six steps)
1. **Typed-code join** — host created `8VGR`; guest typed `" dws7 "`-style input
   (lower case, stray spaces) and landed in the *same* room. Not the invite link.
2. **In-sync play** — moves crossed in both directions; clocks synced from host.
3. **Host transfer** — host tab closed mid-game: survivor detected the leave, the
   round ended decisively, and the survivor **reached the full results screen**
   with both breakdowns, the match tally and working rematch controls.
4. **Peer-leave grace** — the HUD marks the seat "left" rather than freezing.
5. **Host stickiness + stale room** — the creator kept the HOST badge when the
   guest joined (the guest was never host); after leaving, `?room=` was cleared
   and "Play with a friend" offered create/join rather than teleporting back in.
6. **Rematch** — both tabs clicked Play again: one new round in the same room, no
   reload, both peers present with fresh boards, **colours swapped**, and a move
   still crossed — proving the mesh was genuinely alive and not just repainted.
   With only one tab ready, the other showed "1 of 2 ready" and did not hang.

Also verified: the **host's mode travels**. The guest had locally selected Classic;
the host had picked Skirmish; the guest correctly displayed *and played* the host's
6×6 board.

## Errors & Resolutions
Three real defects, none of which any unit test could have found. All were
mutation-verified (fix reverted, test seen RED, restored, seen green):

1. **Both peers ejected to the menu the instant the second joined.** The net
   handlers (`onPeers`, `onHostChange`) call the game's repaint, which fires while
   both players are still in the *lobby* with no session — and that repaint had a
   `return showMenu()` fallback. Multiplayer was 100% broken while solo play,
   `tsc` and 130 unit tests were all green. Found by the two-tab smoke test.
   Pinned by `tests/screens.test.ts`.
2. **The host leaving stranded the survivor on a dead board.** Peer-leave
   correctly ended the round and rendered the summary — then the *same* handler
   repainted the game screen straight over it. Exactly the failure principle #9
   forbids ("every player must reach this screen"). Fixed by making the repaint
   refuse to rebuild a game screen that is not mounted.
3. **Pieces stranded a cell off their square in a backgrounded tab.** The slide
   animation renders a piece one cell *behind* its square and releases the offset
   on the next frame — so releasing it is correctness, not decoration, and a
   backgrounded tab never fires `requestAnimationFrame`. Found live in the
   harness (whose tabs are permanently hidden), fixed with a timer backstop, and
   pinned by a test that stubs rAF to never fire.

## Deployment
- Repo created: **ben-gy/changeling** · Pages enabled (Actions build) · Cloudflare
  DNS `changeling.benrichardson.dev` → `ben-gy.github.io` · deploy workflow
  **success**
- PR: https://github.com/ben-gy/changeling/pull/1
- **The Pages CNAME was set ONCE and deliberately not cycled.** A previous run
  (emberwake) left TLS issuance stuck in state "new" for 70+ minutes by cycling
  it repeatedly; the routine's cycle step is what causes that, so it was skipped.
- Production serves correctly over HTTP (200, correct `<title>`) while the TLS
  certificate finishes issuing. Both browser surfaces refuse plain HTTP, so the
  final production visual pass is gated on the cert.
