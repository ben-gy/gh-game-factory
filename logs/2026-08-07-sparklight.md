# Build Log: Sparklight
**Date:** 2026-08-07
**Status:** deployed

## Idea Source
IDEAS.md, head of the board-game initiative queue:

> **Sparklight** (Hanabi-shaped) — CO-OP: you can see everyone's cards but your own, and spend a
> shrinking pool of clue tokens to hint colour or number so teammates play the fireworks up 1→5 in
> each suit without a misfire. co-op 2-5, host-authoritative; solo drives all hands.

Removed from IDEAS.md. Checked against all 54 shipped games: nothing in the fleet has **inverted
hidden information**. `tacit` is the other co-op card game and hides cards *from* the other players;
`deepwatch` is a silent ascending-line co-op. This is the first game where what is hidden is *your
own hand*, and that inversion drove every architectural decision below.

**Input question (principle #23), asked and answered:** touch. The last three registry entries
(`brood`, `kiln`, `bracken`) are also tap games, which is a real signal — but this is a quiet
deduction game often played by passing one phone around, and a sensor would be noise bolted onto it.
The board-game initiative is also explicitly the current priority. Noted rather than defaulted.

## Game Details
- **Name / repo:** Sparklight / ben-gy/sparklight
- **Genre:** card
- **Core loop:** on your turn, raise a card onto its plume, douse one for a spark back, or spend a
  spark to point out one colour or number in a crewmate's hand. Eight sparks, fifty cards, three
  hazes. A hint has to mean more than it says.
- **Multiplayer:** live P2P, 2–5, host-authoritative deal with whole-log replay
- **Stack / render:** vanilla-ts / DOM
- **Engine modules:** net, rematch, turn, lobby, rng, sound, storage, drag, mobile (v1.3.2, verified
  installed, 25 rollup binaries in the lock)

## The three decisions that mattered

**1. The deck cannot come from the shared seed.** The obvious design derives the shuffle from
`RoundInfo.seed` and has each client decline to render its own hand. It is wrong for a reason I did
not anticipate: that seed is broadcast to every peer *and every spectator*, so deriving from it does
not leak your own hand, it leaks **the entire future order of the draw pile** to everybody. In a game
about spending a scarce channel, knowing the next eight cards is a far larger cheat than knowing your
own five. So the dealer shuffles from a locally-minted seed it never sends, and unicasts each peer a
sight table with that peer's own cards masked out.

**2. The hint mask travels inside the action.** A hint touches a subset of the target's slots, and
the target is the one peer who cannot compute which — a control-flow branch on a hidden hand, which
is exactly how this fleet has desynced before. So nobody derives it: `hintMask()` runs once on a peer
that can see the hand, the mask is packed into the action word, and every *other* peer re-derives it
from its own sight on replay and rejects a wrong one. A dishonest mask is caught independently by
everyone except the one player it was aimed at.

**3. The census replaces the discard pile.** Every digital game of this shape renders a row of small
discarded cards nobody reads. It answers one question — how many copies are left — so the game
answers it directly instead: a five-cell ladder beside every plume (▪ raised / ○ spare / ◉ last copy /
╱ gone). Thirty marks permanently on screen, and no ash heap is drawn at all.

## Juice
Procedural audio only; every cue is a glide so the table is readable with your eyes shut — raising
climbs 520→880Hz, dousing falls, a completed plume soars to 1560Hz, and hazing is the one ugly noise
(sawtooth 260→70Hz with a noise burst). Screen shake on a haze, 3-2-1-GO countdown with audio,
`prefers-reduced-motion` honoured throughout.

## Test Results
**201 tests, 201 passing, 0 failing**, across 15 files.

- `sight.test.ts` — **the redaction invariant**, and the most important file here. A masked replay
  must produce byte-identical public state to a full one, for every seat, at every ply, in every
  mode. Mutation-verified: re-deriving the hint mask instead of reading it from the action turns it
  red, restoring turns it green.
- `mechanism.test.ts` — 16 tests. Every audit counter shown to go RED against a deliberately
  corrupted event stream (a hint one slot out, a shifted mask, a misjudged raise, a phantom card, an
  out-of-turn action, a wrong score, a false ending, a duplicate card, a mode the auditor was lied
  to about).
- `balance.test.ts` — difficulty sim, 120 seeds per cell across 3 modes × 4 table sizes, plus a
  zero-tolerance mechanism audit over every simulated night.
- `bot-view.test.ts` — the information gate, four layers (mask / structural throw / differential deep
  scan / hand swap), plus a control proving the bot *does* react to what it may legitimately see.
- `contrast.test.ts`, `manifest.test.ts`, `source-hygiene.test.ts`, `rules.test.ts` (32),
  `takeover.test.ts` (21), `rematch.test.ts`, `no-deadlock.test.ts`, `host-election.test.ts`,
  `net-lifecycle.test.ts`, `room-code.test.ts`, `rng.test.ts`.
- P2P-sync determinism: pass.

### What the simulation actually said

The first bot scored **13–27% of perfect** and every gate was green — the game "worked". It was
applying a probability test to *clued* cards, and a colour hint alone only makes a card ~30% likely
to be playable, so the crew spent 25 sparks a night and raised almost nothing. Trusting the
convention (play what you are told unless you can prove otherwise) plus a **stall hint** (with a full
spark pool dousing is illegal, so a seat with nothing to say was force-raising and burning haze — it
ended 99% of two-player nights inside 26 turns) took it to **64–79%**, which is strong-amateur play.

Two assertions I wrote from intuition were wrong and were replaced with what the numbers say:

- "A bigger table scores lower" — false. Measured at n=200 across two independent seed families, the
  mean traces an **inverted U peaking at three players** (18.8 / 20.0 / 19.7 / 18.5). What actually
  moves monotonically is the **spread** (sd 2.94 → 1.83) and **permanently lost plumes** (1.74 →
  0.38). Two players is the volatile game, five is the grind.
- "Prism and Onyx are both harder than Vigil" — half false. Prism lands within a point of Vigil as a
  percentage, because its sixth suit adds ten cards to the pile as well as five points to chase. So
  the mode gate measures the **mechanism** instead: capped plumes per suit, where Onyx > Prism >
  Vigil holds cleanly and is the thing the sixth suit exists to do.

## Build Status
- npm install / typecheck / test / build / local play: **pass**
- **Every mode verified in-browser at ~375px (principle #20):** vigil, prism and onyx at both 3 and
  5 players — 6 cells, all: no horizontal overflow (scrollWidth 375), 0 overlaps, 0 sub-28px targets,
  nothing off-screen. Correct deck sizes (50/60/55) confirmed live.
- **Desktop (1280×800), every mode at 2 and 5 players:** 6 cells, all clean; table centred at 860px.
- **Both sides of the 760px breakpoint** (740 and 780) and a **landscape phone (812×375)**.

### Layout bugs found by looking, and fixed
1. **Quit overlapped the fifth plume** at 375px — it was `position: absolute; top; right`, hiding
   that colour's height and half its census ladder in every mode. Moved into the counters flow, where
   it cannot overlap anything by construction. Pinned by a source-level invariant in
   `source-hygiene.test.ts`.
2. **The whole dock was off-screen in landscape.** An 812×375 phone is 760px *wide*, so it matched
   the desktop query and inherited 116px hand slots in a 375px-tall window; `min-height: 100dvh` let
   the column grow past the viewport and the action bar's bottom edge sat at y=812. Fixed with a
   pinned `height: 100dvh` (so the seats scroller absorbs it) plus a short-viewport block placed
   **last**. Both pinned by invariants, including one asserting the source order.
3. **Three invisible elements**, caught by the contrast gate before they were ever drawn: empty plume
   slot 1.39:1, hidden card back 1.58:1, card-back edge 2.91:1 (and a fourth at 2.96:1 after a later
   palette change). All lightened until measured ≥3:1.

## Deployment
- Repo created, Pages enabled (Actions), Cloudflare DNS CNAME added, GitHub CNAME set, cert cycled
  **once** and reached `approved`. Deploy workflow: success.
- **Production verified in-browser, not by curl**: loaded, played, all three modes screenshotted at
  375px, a real input registered through the real UI, feedback widget mounted, zero game console
  errors.
- Catalogue entry **merged to main and confirmed served** at
  `ben-gy.github.io/gh-game-factory/index/games.json` (position 0). IndexNow pinged, lab redeployed.

## Multiplayer smoke test (two tabs, live production)
| Gate | Result |
|---|---|
| Room entry by **typed** code | **pass** — `t89z ` (lower case, stray space) normalised into the same room |
| QR | **pass** — present, 200×200, square, inside the card, no overflow, dark-on-light, encodes the **invite link** not the bare code |
| Host stickiness | **pass** — the creator kept the host badge when the second player joined |
| In-sync play | **pass** — the host's hint reached the guest: 2 slots touched, 3 ruled out, `logLen` 1 on both, guest's UI narrowed its chips and wrote RAISE |
| **Redaction over the real wire** | **pass** — on the guest exactly one seat is masked, and it is the guest's own; it learned *about* its cards without learning them |
| Host leaves mid-round | **FAILED, fixed, re-verified — see below** |
| Rematch | not exercised end-to-end; covered by `rematch.test.ts` + `no-deadlock.test.ts` (see honesty note) |

### The bug the smoke test existed to find
Closing the host's tab in a **two-player** room left the promoted survivor on a board that could
never move again. The survivor is promoted, asks the room what it is holding — and there is nobody
left to answer. So its own hand stays hidden, `viewFor` **correctly** refuses to build a view for the
seat the crew's bot should cover, and it is simply nobody's turn, for ever. Measured on production:
**90 attempts to take a turn, zero state change.** Nothing else caught it — 198 tests were green, the
board looked perfectly normal, and no error was logged anywhere.

`alone()` already existed in `session.ts` and was **wired to nothing**. It is an ending now: a co-op
has nobody to hand the win to, so the honest outcome is to stop, keep the score, and show the
summary. Fixed, three tests added, **mutation-verified** (reverting turns 2 tests red), redeployed,
and re-verified on production — the survivor now reaches *"Everyone else left. The night ended where
it stood."* with both crew rows shown.

## Errors & Resolutions
Besides the three layout bugs and the walkover above:

- **The deck was derivable from the broadcast round seed.** `dealAsHost()` shuffled from
  `this.seed ^ 0x5f3a7c1d` where `this.seed` *is* the round seed the rematch protocol broadcasts to
  every peer and spectator — with the constant sitting in the source. Every client could have
  computed the entire future draw order: the precise leak the file's own header condemns, written
  three paragraphs below that header. Found by the subagent writing the P2P contract tests. Both the
  deal and the post-takeover reshuffle now mint from `newSeed()` locally. Pinned by
  `rng.test.ts › two dealers handed the SAME round seed shuffle different decks`.
- **`tick()` measured silence from the epoch.** `heardAt.get(s) ?? this.claimAt ?? t` — `claimAt` is
  `0` until a takeover and `??` does not catch `0`, so a seat not yet heard from scored
  `Date.now() - 0 > SILENT_MS` and live crewmates were written off on the very first tick. Fixed with
  a `startedAt` floor.
- **`hazeFaults` compared a variable with itself.** The audit incremented `haze` and `failedRaises`
  on the same branch, so the check was `x !== x` — a counter that could never fire against any build,
  however broken. Found by adversarially reviewing the *audit* rather than the game. The end event
  now carries `haze` and `sparks` so the audit has something independent to compare against, and four
  new mutation tests prove the previously-dead counters fire.
- **My leak scan was unsound.** It matched card *values*, and card values repeat across the deck
  (three Amber 1s), so `ash` and `log` produced false positives on the first honest seed. Replaced
  with a **differential** scan: build the view twice with the seat's own cards swapped and report any
  path whose numbers differ. No thresholds, no coincidences.
- **Preview port collision.** 5199 was already serving a sibling factory's build and `curl` happily
  returned its `<title>Water Market</title>`. Moved to 5271 and confirmed the served title.

## Honesty notes
- **The rematch loop was not exercised end-to-end in the browser.** The protocol is covered by
  `rematch.test.ts` and `no-deadlock.test.ts` (quorum, visible countdown, straggler dropped, promoted
  host can run it) and the UI path is wired, but I did not click Play again on two live tabs. It is
  the one gate in the multiplayer contract I am reporting as untested rather than passed.
- **The dealer can work out its own hand**, and always could — it is the deck minus everything it can
  already see, and no serverless arrangement avoids it without mental poker. The renderer never reads
  it (proved by a test), so the *screen* is honest; devtools would not be. This is disclosed in
  About, in the README, and on screen via the "holds the deck" badge rather than being hidden.
- **A bounded residual in the takeover**, reported by the test agent and left unfixed: "longest clean
  log wins" can recover a ply the dead dealer committed but never broadcast; that ply drew a card the
  new dealer cannot learn, so it deals that position from its fresh shuffle and one card can change
  under a peer that saw it. Not a desync. `takeover.test.ts` pins the blast radius — no position
  below the promoted peer's own `drawn` may move.
- Real-device testing (an actual phone, actual Safari) is not possible in this pipeline. Everything
  above is Chromium at emulated viewports.
