# Build Log: Driftlock
**Date:** 2026-07-17 (deploy rolled into 2026-07-18 UTC)
**Status:** deployed (pending final production browser pass — see below)

## Idea Source
Invented. IDEAS.md was empty. The registry already covered arcade, puzzle, board,
card, word and party; **strategy** was being taken by a concurrent run (`windup`),
so I aimed at a fresh **board** game with one legible mechanic: *you never move a
piece, you move the row it stands on.* Neutral stones + "the shift scores the
mover" was chosen specifically to dodge the seat-geometry trap that sank Hexbloom's
3-player seats (54/33/10) — with nothing owned, there is no start position to seed
unfairly.

## Game Details
- **Name / repo:** Driftlock / ben-gy/driftlock
- **Genre:** board
- **Core loop:** shift a wrapping row/column one step; any stone sliding into the
  rising central Well banks for the mover; the line you shifted is locked for the
  opponent's next turn; highest score when the board empties wins.
- **Multiplayer:** live P2P, 2 players, host-authoritative snapshot star. Also solo
  vs bot and async seed-share.
- **Stack / render:** vanilla-ts / DOM (grid of cells + real buttons for handles)
- **Engine modules used:** net, rematch, lobby, rng, sound, storage, mobile,
  identity (NOT loop — turn-based; NOT input — handles are buttons, no D-pad)

## The balance sim did its job — it overruled the design three times
Built `tests/balance.test.ts` FIRST, before tuning. The baseline was damning and
every confident story I told was wrong (the whole point of principle #18):
- **"The pinpoint opening makes early leads impossible."** Measured: leader at move
  3 won 76%, seats 60/40, game over by move 19. A tempo race where tempo never
  changed hands.
- **"The multi-stone tide haul is the product."** Measured 0% multi-hauls across
  36 parameter combos, then ~1% after a rules fix — structurally impossible (the
  Well empties every move). Cut the claim; the joy metric now guards lead-changes,
  which the game does have (~49%).
- **"Deepwell is 7×7."** 7×7 gives 3 tide rises → one seat harvests two of them →
  measured 33/67. Not tunable. Cut to 9×9 (4 rises, measured 50.8%).

Two fairness constants pinned WITH their counterfactuals (a rule without a
measurement is folklore):
- **tide period must be odd** — an even period puts every rise on seat 0's turn:
  measured **95%** first-player wins.
- **rise count must be even** and must reach the board edge — else the board never
  empties (measured 19-35% draws).

Final measured Duel: leader@m8 **51.9%** (n=214), seats **49.1/50.5**, 0.5% draws,
0% blowouts, median 19 moves. Then added alpha-beta + a single-pass
`bestBankAvailable` to take the suite from **375s → 34s** with bit-identical
numbers (pinned: the fast path is asserted equal to the naive one).

## Juice
Stones slide (FLIP transforms, eased), wrap fades out one edge and in the other,
banked stones pop + particles, the Well pulses and washes new cells in as the tide
rises, the locked line shows a padlock, hover previews the shift with ghost
landing spots. Procedural SFX throughout, mute persisted, `prefers-reduced-motion`
degrades to instant.

## Test Results
- Tests written / passed / failed: **187 / 187 / 0** (15 files)
- Includes: balance sim, P2P-sync determinism (rng), host-transfer takeover,
  host-election (fixed ids), one-join lifecycle invariant, trystero-rejoin
  characterization, rematch protocol + no-deadlock, room-code, modes prototype
  guard, mobile hardening, countdown, source-hygiene, manifest, and the game
  rules + the board reflow regression.
- **Mutation-tested** three fixes (all confirmed RED on revert, GREEN on restore):
  host-transfer `startHostTimers`, promoted-peer snapshot adoption, and the
  hidden-tab board reflow.

## Build Status
- npm install / test / build / local play / mobile play: **pass**
- Two-peer P2P smoke test (against local build of this exact commit): **pass** —
  typed-code join (` jytx ` → JYTX), mesh formed on public relay, exactly one HOST
  badge on the correct peer, quorum auto-start, both peers on the identical seeded
  board.

## Bugs found in-browser and fixed (all with regression tests)
1. **Tide pill clipped off-screen at 375px** — the meter was a third flex child of
   a non-wrapping `.hud`. Made `.hud` wrap; the tide gets its own row.
2. **Modal close button floated as a violet pill over the heading** — CSS styled a
   corner ✕ but the markup is a labelled "Got it" `.btn.primary`. Reconciled.
3. **Selected difficulty showed no state** — `.is-on` was only styled for mode
   cards. Added a segmented-control style.
4. **Handles not `disabled` during the countdown / opponent's turn** — `setInteractive`
   only dimmed; it now re-derives the attribute, so keyboard/SR users aren't lied to.
5. **(the serious one, only the two-tab test caught it) All 9 stones piled in the
   corner on a peer whose tab was backgrounded when the round started** — a hidden
   tab measures `clientWidth` 0, so stones got no transform and nothing re-placed
   them. Added a `ResizeObserver` + visibilitychange reflow that lays them out the
   moment the grid has a size. Mutation-tested.

## Deployment
- Repo created, pushed to main, Pages (Actions) enabled, Cloudflare DNS added,
  custom domain driftlock.benrichardson.dev set + CNAME cycled for TLS.
- Deploy workflow: monitored to completion.
- PR: (added after deploy — see REVIEW.md)

## Production verification
Local build of the deployed commit was fully verified in-browser (desktop + 375px
mobile, solo play, countdown gate, visibility/overlay gate all green) and via the
two-peer smoke test. The live-URL visual pass was pending on a transient outage of
the browser-automation classifier at deploy time; see the PR / registry for the
final status.

## Errors & Resolutions
- Port 5199 was held by a concurrent factory run (`windup`/`income-by-postcode`),
  so an early `curl` 200 was a DIFFERENT server — a live demonstration of why curl
  is not verification. Moved to a strict-port 5271.
- `registry.json` / `index/` were being edited concurrently by the windup run;
  re-read before each edit and inserted at the top rather than clobbering.
