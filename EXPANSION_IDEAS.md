# Expansion Ideas

Enhancements to **existing** games (new modes, more players, better juice, a fresh mechanic) go here for manual review — NOT built as new games. The daily factory logs them here when an idea is too close to something already shipped.

Format: `- **existing-repo-name**: Description of the enhancement or new mode. Include any library/spec URLs.`

- **boxbox**: crew-roles CO-OP mode. The original idea floated a co-op where each
  player owns a crew role (front jack / left side / right side / fuel & wing) with
  cross-player physical dependencies — one pair of hands can't hold the jack AND
  gun a wheel — sharing one clock, so nobody can solo the stop. Boxbox shipped
  versus-on-same-seed instead because that shape is desync-proof and survives a
  peer dropping, whereas cross-player physical dependencies deadlock the whole
  crew the instant one peer's tab closes mid-stop. To do co-op safely it needs: a
  per-role reassignment on peer-leave (a dropped role's stations fall to the
  survivors, never freeze), a stop-level watchdog that force-completes an
  abandoned station after a grace window, and a co-op summary that leads with the
  shared stop time and shows each player's CONTRIBUTION (stations completed,
  fumbles) rather than ranking them. The triage layer would become a shared vote
  (host adjudicates) so two players can't call different job sets on one car.

## Engine

Gaps in `@ben-gy/game-engine` that forced a game to keep a local fork. Closing one
means the fork can be deleted and that game rejoins the shared engine.

**All six gaps logged here were closed in engine v1.3.1 (2026-07-23).** What is
left is the migration work — and a gap is not actually closed until the fork it
existed for is gone, so these stay open until each one is deleted.

- **DONE v1.3.1** — `sound.ts` game patches + pitch; `DEFAULT_RELAYS` refresh
  with runtime write-health detection and demotion; `lobby.ts` `repaint()` +
  sticky view state; `lobby.ts` public-rooms surface + `modeSlot`; `drag.ts`
  `makeRail`; `rematch.ts` opts generic. Migrated already: **turntide** (relay
  override deleted), **scrapwall** (forked `sound.ts` deleted, cue table kept
  as `src/cues.ts`), and **snake-royale** (forked `sound.ts` deleted 2026-07-25,
  cues in `src/cues.ts` — see the sound-migration entry below; its forked
  `lobby.ts` deleted 2026-08-01, engine pin `#v1.3.2`, PR
  https://github.com/ben-gy/snake-royale/pull/7). See the engine CHANGELOG for
  the relay measurements.

  **No forked `lobby.ts` survives anywhere in the fleet** — checked across all 45
  games on 2026-08-01, not inferred from this file. What remains under this
  heading is the `sound.ts` work (five games: `morsel`, `deepwatch`, `delvepack`,
  `frostward`, `gloamrun` — four of them blocked on engine synthesis gaps) and
  the `ballast` `touch.ts` port, whose fork is confirmed still present.

- **Fleet migration: delete the remaining forked `sound.ts`** — the old "each is
  mechanical, just lift the table" claim here was WRONG and it took a run
  (2026-07-25) to find out by reading all six forks. Only `scrapwall` and
  `snake-royale` were pure table-forks. The other four each added synthesis the
  engine's `createSfx` still does NOT provide, so deleting their fork
  as-described would ship an audible regression, not a no-op. Per-game:

  - **`snake-royale` — DONE 2026-07-25.** Byte-exact synth match to the engine
    (noise `*0.6`, identical gain/frequency ramps); only the positional pitch
    argument needed moving to `play(name, { pitch })` at two callers (countdown
    `beep`, `eat` combo). Bumped `#v1.1.0`→`#v1.3.1`, patches lifted to
    `src/cues.ts`, `src/sound.ts` deleted, `countdown.ts`/`countdown.test.ts`
    re-pointed at `@ben-gy/game-engine/sound` (its fake `Sfx` also needed the new
    `addPatches`/`has` methods). Went straight to `main` (pure fork-deletion,
    verified green + 375px browser). Its forked `lobby.ts` is a SEPARATE entry and
    was left alone.
  - **`deepwatch` — near-mechanical, needs a sign-off.** Pitch-only (a `depth`
    shift, `1 - 0.62*depth`, that moves to `{ pitch }` at the one `surface`
    caller), BUT its noise gain is `*0.55` where the engine uses `*0.6`, so noise
    cues (`misplay`/`tank`/`lost`) come out a hair louder after the swap. Cosmetic,
    but it is NOT "no behaviour change" — decide before shipping.
  - **`gloamrun` — BLOCKED on an engine gap.** Its `sound.ts` carries a per-cue
    throttle (`MIN_GAP = { shot: 60, mhit: 40, hurt: 120 }` + a `lastAt` tracker)
    that debounces rapid fire. The engine has no throttle, so deleting the fork
    machine-guns the audio in a bullet-hell co-op. Its `manifest.test.ts` also
    hard-codes `src/sound.ts` in its no-console file list and will go red on
    deletion — switch that to `readdirSync('src')` like scrapwall did.
  - **`morsel` / `delvepack` — BLOCKED on an engine gap.** Both cap polyphony
    (`if (voices > 12) return`) with an `osc.onended` that decrements a voice
    counter, so a feeding frenzy / a horde wipe cannot clip the mix. `morsel` also
    does a log mass→pitch transform (caller-movable) and both use a smaller noise
    gain (`delvepack` `*0.5`). The engine has no voice cap; deleting the fork
    removes the clip guard.
  - **`frostward` — BLOCKED on an engine gap.** Each patch layers a
    bandpass-filtered noise band (`BiquadFilter`, `Q 0.9`, tracked by a `rate`
    pitch) over the oscillator — a texture the engine's single-osc+noise
    `createSfx` cannot reproduce. Deleting the fork flattens the sound. The
    positional `rate` is otherwise caller-movable to `{ pitch }`.

  So four of the six are really requests for the engine to grow **per-cue
  throttling, a polyphony cap, and a filtered-noise band** — logged as the new
  Engine entry below. Until those land, only `deepwatch` is close to a drop-in.
  When migrating any of them: pin `#v1.3.1` and CHECK the installed version (npm
  serves a stale tarball on a tag bump and says nothing).

- **Engine `sound.ts`: throttle, voice-cap, and a filtered-noise band.** Four
  games (`gloamrun`, `morsel`, `delvepack`, `frostward`) keep a forked `sound.ts`
  purely for synthesis the v1.3.0 patch-table work did not add. Add these three
  and the last four sound forks can finally be deleted (the patch tables are
  already in each game, ready to lift): (a) an optional per-patch `minGapMs` so
  rapid cues (`shot`/`hit`) don't machine-gun, tracked engine-side — what
  `gloamrun` hand-rolls; (b) an optional global polyphony cap (a voice counter
  with an `onended` decrement, dropping a play once over the cap) so a frenzy or
  wipe can't clip — the shape `morsel`/`delvepack` already hand-roll; (c) an
  optional bandpass-filtered noise layer per patch (`band?: { freq, q }`) for
  `frostward`'s texture. Discovered while migrating `snake-royale` 2026-07-25;
  verified against each game's actual `sound.ts`, not assumed.

- **Engine `lobby.ts`: an optional `shareTitle`.** The Web Share sheet is
  hard-coded to `title: 'Join my game'`, so a game that wants its own name in the
  share sheet has to fork the whole lobby for one string — which is exactly what
  `snake-royale` was doing ("Join my Snake Royale game"), and what its migration
  on 2026-08-01 had to give up to delete the fork. Add
  `shareTitle?: string` to `LobbyConfig`, defaulting to the current wording, and
  re-point snake-royale at it. Small, but it removes the only real reason left to
  fork the lobby, and every game on the engine lobby currently shares an
  anonymous title. Found while doing that migration, not assumed.

- **ballast: delete `src/touch.ts` in favour of `makeRail`** — the engine's
  `makeRail(el, { stepPx, axis, onStep })` is a direct port of it, with the same
  net-out semantics and the same thresholds. Also switch its net handlers from
  rebuilding the lobby to `lobby.repaint()`, which is what the QR-vanishing bug
  was actually about (though v1.3.1's sticky view state means the QR now survives
  the rebuild either way).

- **unstrung**: a **co-op** shape for the seam mechanic, deliberately not built in the first run
  (versus was chosen because the strand is a shrinking shared resource and *what you leave behind* is
  the entire strategic content — co-op on one strand with a shared score collapses to alternating
  solitaire where nobody has a reason not to take the biggest word, and one strong player calls every
  move). The version that would work has to give the players *different information*: each diver can
  only cut words that **start with a letter from their own private hand**, against a shared target
  score and a turn clock. Now "I take the small word so the seam lands where *you* can reach it" is a
  cooperative act, the party's total is genuinely a joint product, and no one player can solo it
  because half the board is unreachable to them. Needs: per-seat letter hands dealt from the round
  seed (still zero board state on the wire), a shared target curve tuned by a co-op sim measuring the
  *difficulty* curve rather than seat fairness, and a mechanism invariant asserting every seat can
  always reach at least one legal cut (the co-op equivalent of the dry-board check).
- **unstrung**: a **ring** strand — the two ends of the strand stitched into a loop, so a cut can wrap
  around the join and the board has no privileged head or tail. Cut from the first design for
  rendering risk (a wrapping selection across a visual line break needs its own hit-testing story),
  but it is a genuine fourth mode shape rather than a dial: on a ring *every* cut is interior, so
  every cut makes two seams and the seam economy roughly doubles. Would need its own balance pass —
  `SEAM_MULT` is tuned against a line, and on a ring x3 will almost certainly be too generous.
- **unstrung**: show the join QR on the **results screen** as well as the lobby, via `qrPanelHtml()`,
  so a third player can be pulled into a live room between rounds without anyone navigating back.
  Currently "Back to lobby" is one tap away, which satisfies the requirement but costs a screen.
- **hatch**: hand-authored **picture packs**. Boards are currently random line-solvable bitmaps, so
  the revealed image is abstract — solving is satisfying but the reveal isn't a recognisable *thing*.
  A curated set of small pixel-art pictures (each stored as a tiny bitmap, verified line-solvable at
  build time by the existing line solver, rejected if not) would make the reveal a payoff ("it's a
  cat!"). Keep the random generator as the daily/endless source; use a pack as a themed campaign or a
  special daily. The verify-solvable-or-reject gate already exists (`lineSolve(...).solved`), so the
  work is authoring + a `gen-pictures.mjs` that emits only the line-solvable ones. Watch the balance
  sim: a hand-authored picture may have a different difficulty distribution than the density-tuned
  random boards, so re-run the reader-vs-masher gap over the pack.
- **hatch**: a **colour** nonogram mode (each filled square is one of a few colours, clues carry a
  colour per run). A genuinely different puzzle — colour adjacency changes the deduction rules — but
  it needs a colour-blind-safe palette that still clears the contrast gate for *every* pair of
  adjacent colours, and the line solver + mistake model both need extending to a per-colour state, so
  it is a real build, not a dial. Flag: the fill-vs-empty lightness cue that makes the mono game
  colour-blind legible does not survive to a multi-colour board, so shape/pattern fills would be the
  honest accessibility answer.
