# Build Log: Rootbound
**Date:** 2026-07-20
**Status:** deployed

## Idea Source

IDEAS.md, the single queued entry — a boardless hex duel with six creature types, a one-colony
rule, ring-the-Heartroot win condition, and "polarity" as the signature twist (a creature among its
own colour moves short and defends; one reaching into enemy territory moves further and strikes).
The idea also named its own balance risk up front — first-player tempo, plus a possibly dominant
Burrower — and both were measured rather than assumed. The idea line was removed from IDEAS.md.

## Game Details

- **Name / repo:** Rootbound / ben-gy/rootbound
- **Genre:** board
- **Core loop:** place or move one piece a turn into a single shared colony that must never split;
  win by filling every cell around the enemy Heartroot, with pieces of either colour counting.
- **Multiplayer:** live P2P, 2 players, **lockstep** — no board state on the wire at all
- **Stack / render:** vanilla-ts / Canvas 2D board + DOM hand, HUD and menus
- **Engine modules:** net, rematch, turn, lobby, rng, sound, storage, mobile, feedback

## Juice

Procedural SFX on select/place/leap/convert/end; spore particle bursts on placement and a
two-colour spray on a Sporeling conversion; screen shake on conversion (off under
`prefers-reduced-motion`); eased slide animation along a move's real path; a six-segment **pressure
collar** around each Heartroot that fills, reddens and goes critical at one-from-death — which
doubles as the game's HUD and is the only way the wither is visible; and a nested/reaching halo so
polarity is *shown* rather than only computed.

## Test Results

- Tests written / passed / failed: **209 / 209 / 0** across 12 files
- P2P-sync determinism: pass (play is RNG-free; a whole game replays byte-identically through the
  wire format alone)
- Contrast: pass — 48 assertions, plus a real-pixel probe on the rendered canvas
- Balance sim: pass — 36 assertions over ~360 AI-vs-AI games per run
- Mutation-verified: host-transfer promotion, and the `createOneShot` scheduler guard

## Build Status

- npm install / test / tsc --noEmit / build / local play: **pass** (all)
- Two-peer P2P smoke test: **not run** (see Errors below)
- **Every mode verified in-browser at true 375×812** (principle #20), locally AND on live production:
  - **Thicket** — fits, zero horizontal overflow, canvas top-most at board centre, 44px min tap,
    zero hand/HUD overlaps. Placement rule confirmed visually: 3 legal cells, all own-colour side.
  - **Bramble** — same geometry pass. Rule confirmed visually: **10** legal cells including ones
    touching the enemy, which is exactly the difference from Thicket. Hand shows Creeper ×3.
  - **Deadwood** — same geometry pass. Hand shows Warden ×2. Wither reaches 5 then 4.

## Balance (the long story is BALANCE.md)

The sim was built **before** any tuning and the baseline was bad: **52.5% / 17.5% with 30% draws**
in thicket, 67% draws in bramble, and most games dying at the turn cap rather than on a ring. Final,
at n=600 per mode replicated across three independent seed families:

| mode | seat0 | seat1 | draw | plies | short | lead m8 | m16 | m28 |
|---|---|---|---|---|---|---|---|---|
| thicket | 51.5% | 48.5% | 0% | 58 | 5.7% | 50% | 50% | 74% |
| bramble | 36.5% | 29.5% | 34% | 53 | 7.0% | 61% | n/a | 64% |
| deadwood | 48.5% | 51.5% | 0% | 33 | 2.0% | 35% | 32% | 88% |

Seven separate refutations are recorded in BALANCE.md. The three most transferable:

- **The leading hypothesis was wrong and inverted.** Written down before testing precisely so it
  could be scored: "the hands are too small to close a ring" — bigger hands took thicket's draw rate
  from 29% to **92%**.
- **A byte-identical sweep is a null result, not a neutral one.** `heartrootBy` at 1/2/3/4 returned
  identical numbers at every setting because the search never delays its Heartroot, so the rule
  never fired. Deleted rather than shipped unmeasured — sporeline's exact failure mode.
- **A finding taken under an old rule set has to be re-taken.** Wider hands were rejected in round 1;
  re-tested in round 5 after `doubleRing` changed, the same change took bramble's blowout rate from
  47.9% to **2.1%** — the single largest quality win in the exercise.

Also worth carrying forward: at the n used in most sweep cells (96–120) the 95% CI on a win rate is
roughly ±9–10 points, so several apparent 5–15 point differences between neighbouring cells were
noise. The shipped configs were therefore chosen on **mechanism** and only then verified at n=600
across three families.

## Errors & Resolutions

**1. The solo bot never moved — a total hang, found only in the browser.** The bot was scheduled with
`clearTimeout(t); t = setTimeout(move, 420)` and poked by a 300ms poll (which existed so a
backgrounded tab would still resolve). Every poke cancelled the pending timer ~120ms before it could
fire and armed a fresh one, so the move never happened. The turn clock counted down normally, the
board never changed, and the HUD said "Thinking…" — a hang wearing the costume of the intended
behaviour. **Zero console errors, 202 green tests, a clean build.** Fixed by extracting a named
`createOneShot` where poking while pending is a no-op, guarded by `tests/scheduler.test.ts` and
mutation-verified (restoring the re-arm pattern turns exactly that assertion red).

**2. The contrast gate caught turntide's shipped bug, reproduced from scratch, in my own palette.**
The two player colours measured **1.07:1** in luminance — literally the same shade of grey — while
the plan sitting next to them claimed "a lightness *and* hue split". Caught on the very first run of
`contrast.test.ts`. Fixed to 1.52:1. A second failure in the same run found the reaching flare at
1.02:1 against the nested halo *and* colliding with Amber's own piece colour, so a selected Amber
piece would have flared in something very close to itself; moved to magenta.

**3. The opening board read as "nothing loaded".** An empty field with no highlighted cell is
indistinguishable from a failed render. Since the Heartroot is the only legal play on turn one, it is
now picked up automatically so the player sees where it may go.

**4. Two rules tests failed on first run — both were bad test setups, not engine bugs.** One scripted
an opening where the second Heartroot was not adjacent to the first; the other tried to close a ring
by *placing* against the enemy in Thicket, which that mode forbids by design (there you must
manoeuvre a piece in). Both rewritten to be reachable positions; the second now uses Bramble, and the
distinction it exposed is a genuine and good property of the mode.

**5. The two-peer P2P smoke test was not run.** A second live browser context was not driven against
the first, so the multiplayer contract is covered by automated tests rather than a live mesh:
`takeover.test.ts` (15 tests, mutation-verified), `host-election.test.ts`, `net-lifecycle.test.ts`,
`rematch.test.ts`, `no-deadlock.test.ts`, `room-code.test.ts`. Flagged in the PR, not hidden.

**6. The scaffolding agent overwrote `package.json`** mid-run (it had been created and installed
against already). Caught by re-running `npm install`; the engine pin and dependency set were correct.

## Deployment

- Repo created: ben-gy/rootbound
- Pages enabled (Actions build); deploy workflow **completed success**
- Cloudflare DNS CNAME created; Pages custom domain set **once and deliberately not cycled** (per the
  emberwake lesson that cycling requeues issuance) — the cert reached `approved` within minutes
- Production verified in a real browser over **https** at 375×812, all three modes, zero console
  errors, real-pixel contrast probe agreeing with the palette constants
- PR: https://github.com/ben-gy/rootbound/pull/1
- Index published; IndexNow pinged (202/200); hub deploy queued
