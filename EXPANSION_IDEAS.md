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

  **CORRECTION (2026-08-08) — "No forked `lobby.ts` survives anywhere in the
  fleet" was FLATLY FALSE, and it is the worst kind of error in this file: an
  open thing recorded as done.** Five live, imported forks exist and were
  re-measured this run, not inferred:

  ```
  find games/*/src -iname '*lobby*.ts'      # NOT games/*/src/lobby.ts
  ```

  `cipher-clash`, `hexbloom`, `rhythm-relay`, `gravity-golf` and `nightwire` each
  ship `src/engine/lobby.ts`, all pinned at engine `#v1.1.0`. The 2026-08-01
  check globbed `games/*/src/lobby.ts` and missed the `src/engine/` depth. The
  same glob error undercounted `sound.ts`: the true fleet count was **13**, not
  five (add `cipher-clash`, `hexbloom`, `gravity-golf`, `nightwire`, `bidstorm`,
  `lumenlock`, `emberwake`, `grainfall` under `src/engine/`), and is **12** after
  deepwatch. Treat every count in this file as re-measurable, not as a fact.

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
  - **`deepwatch` — DONE 2026-08-08.** PR
    https://github.com/ben-gy/deepwatch/pull/3. Every number in the old entry was
    right; the word "near-mechanical" was not. Pin `#v1.1.0`→`#v1.3.2`, table
    lifted to `src/cues.ts`, `src/sound.ts` deleted, depth shift now
    `play('surface', { pitch: depthPitch(...) })`. Three things the old entry
    missed, all of which a literal reading would have shipped as regressions:
    (a) `beat`/`go`/`select` COLLIDE with engine built-ins at different values
    (`beat` is a sine here, a triangle in the engine), so all 12 patches must be
    passed explicitly or the countdown quietly changes; (b) the engine IGNORES a
    `pitch <= 0` rather than clamping, so the depth clamp is load-bearing, not
    tidiness; (c) **the fork's `try/catch` is not decoration** — the engine has
    never had one, and `sfx.unlock()` is the first statement in the core tap
    handler, so a blocked `AudioContext` makes the game UNTAPPABLE, not silent.
    Kept as a `createGameSfx` wrapper. Accepted behaviour change: noise gain
    `*0.55`→`*0.6` (+0.79 dB) on `misplay`/`tank`/`lost`.
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
  Engine entry below. With `deepwatch` done, **every remaining `sound.ts` fork is
  blocked on that engine work**; there is no drop-in left. `gloamrun` is the
  cheapest next one (throttle only, ~18 bare call sites, no positional args).

  **The migration recipe is now proven twice** (snake-royale, deepwatch) — reuse
  it rather than rediscovering it: pin `CURRENT_ENGINE_TAG`, re-resolve the
  SINGLE package (`npm install github:ben-gy/gh-game-engine#vX.Y.Z`) — never
  `rm package-lock.json && npm install`, which keeps one rollup platform binary
  of ~25 on macOS and breaks `npm ci` on Linux — then ASSERT the installed
  version before believing any green build, because npm caches a `github:` dep by
  tag and will reinstall the previous tarball reporting success. Note also that
  `tests/*.test.ts` file lists that hard-code `src/sound.ts` go red on the
  deletion; switch them to `readdirSync('src')`.

- **Engine `sound.ts`: throttle, voice-cap, and a filtered-noise band.** Four
  games (`gloamrun`, `morsel`, `delvepack`, `frostward`) keep a forked `sound.ts`
  purely for synthesis the v1.3.0 patch-table work did not add. Add these three
  and the last four sound forks can finally be deleted (the patch tables are
  already in each game, ready to lift): (a) an optional per-patch `minGapMs` so
  rapid cues (`shot`/`hit`) don't machine-gun, tracked engine-side — what
  `gloamrun` hand-rolls; (b) an optional global polyphony cap (a voice counter
  with an `onended` decrement, dropping a play once over the cap) so a frenzy or
  wipe can't clip — the shape `morsel`/`delvepack` already hand-roll; (c) a
  filtered-noise layer for `frostward`'s texture. Discovered while migrating
  `snake-royale` 2026-07-25; verified against each game's actual `sound.ts`.

  **CORRECTION (2026-08-08) — (c) was MISSPECIFIED and must be redesigned before
  it is built.** This entry proposed `band?: { freq, q }`, a STATIC bandpass.
  `frostward/src/sound.ts` actually uses a **swept** `noiseBand?: [start, end]`
  that ramps exponentially and scales with the caller's `rate`, with Q hard-coded
  at 0.9, over a cached LOOPED buffer — plus `noise?: number` as a per-patch MIX
  LEVEL replacing the engine's boolean. A static `{ freq, q }` would not
  reproduce a single one of frostward's six noisy patches, so building to this
  spec ships a feature its only consumer cannot use. The entry also misses
  frostward's `fifth?: boolean` second voice (reproducible at the call site — all
  three `fifth` patches are noiseless). Respec against
  `frostward/src/sound.ts:39-42,97-106,128-151` first.

  **Prerequisite nobody has paid yet:** the engine's own `tests/sound.test.ts`
  `FakeCtx` has no `createBiquadFilter`, never fires `onended`, and has no
  `performance.now` control — so all three features need new fake surface before
  a single assertion can be written. Budget that, or the tests will be theatre.

  Also worth folding in while touching this file: a per-patch `noiseGain?`, which
  would have made deepwatch's migration a true no-op instead of a +0.79 dB
  change (forks sit at `*0.5`/`*0.55` against the engine's `*0.6`).

- **Engine `sound.ts`: make audio incapable of breaking a game.** `createSfx` has
  no error handling and never has (checked at v1.1.0 and v1.3.2): `ensure()` calls
  `new AudioContext()` bare, and `play()` builds its node graph bare. Games call
  `sfx.unlock()` as the FIRST statement of input handlers — in deepwatch it is
  the first statement of the core tap — so a constructor that throws (a hardened
  anti-fingerprinting extension does exactly this) aborts the handler before the
  move runs. The failure mode is not a silent game, it is an **untappable** one.
  ~6 lines: wrap `ensure()` and the body of `play()` in `try/catch`. Discovered
  while migrating deepwatch 2026-08-08, which had hand-rolled this armour in its
  fork; it is now a `createGameSfx` wrapper in `deepwatch/src/cues.ts`, and the
  wrapper can be deleted once the engine does it. **Not done this run** because
  an engine feature cannot be tagged, consumed and verified inside one PR — and
  the whole point of the run was to land a verified fork deletion. Do it with the
  throttle/voice-cap/band work above, in one engine release. Worth it because it
  fixes the same latent bug for every game on the engine synth, not just the one
  that noticed.

- **Engine `lobby.ts`: an optional `shareTitle`.** The Web Share sheet is
  hard-coded to `title: 'Join my game'`, so a game that wants its own name in the
  share sheet has to fork the whole lobby for one string — which is exactly what
  `snake-royale` was doing ("Join my Snake Royale game"), and what its migration
  on 2026-08-01 had to give up to delete the fork. Add
  `shareTitle?: string` to `LobbyConfig`, defaulting to the current wording, and
  re-point snake-royale at it. Small, but it removes the only real reason left to
  fork the lobby, and every game on the engine lobby currently shares an
  anonymous title. Found while doing that migration, not assumed.

  **Refinement (2026-08-08), verified at source** (`gh-game-engine/src/lobby.ts`,
  the `share()` helper): the hard-coded object is
  `{ title: 'Join my game', text: 'Room XXXX', url: link }` — **`text` is
  hard-coded on the same line**, and `rhythm-relay`'s fork customises the text as
  well as the title. So ship `share?: { title?: string; text?: string }`, not
  `shareTitle?` alone, or the fork-deletion goal is not actually unblocked. This
  is now known to be **six** games' problem: all five surviving lobby forks
  independently rewrite that string, which is about as strong as evidence gets
  that the option is real rather than speculative. `share()` currently has **zero
  test coverage**, so this change brings the first test of it. Note it deletes no
  fork on its own (snake-royale's went on 2026-08-01) — ship it bundled with the
  first lobby-fork migration so a fork actually dies with it.

- **ballast `touch.ts` → `makeRail` — DO NOT BUILD AS WRITTEN. Verified FALSE on
  both halves 2026-08-08.** Kept (rather than deleted) because the underlying
  idea is still worth doing and the next run needs to know why the old wording
  was a trap.

  The load-bearing sentence — "a direct port, with the same net-out semantics and
  the same thresholds" — is refuted on ten points. Two are outright gameplay
  regressions in a live stacker: (1) `classifyRelease` has **no duration bound on
  a tap**, so every press-and-hold soft-drop would rotate the piece on release,
  where `touch.ts` requires `dur < 250ms`; (2) the engine's swipe test is **OR**
  (`speed > v || dist > d`) where ballast's is **AND**, so a slow 60px drag
  becomes a spurious HARD DROP — a lost game. Also: ballast's rail is TWO-axis
  with a one-way vertical ratchet that never retracts soft drops, against
  `makeRail`'s single axis that nets out both ways; the rail origin resets at
  promotion (first step at ~34px, not 26px); `preventDefault` differs; listeners
  bind to the element vs `window`; and `touch.ts` QUEUES every intent for the rAF
  step (with clamps) where `makeRail` calls `onStep` synchronously.
  **`touch.ts` has ZERO test coverage**, so every one of these ships silently.

  It is also **not executable as written**: `makeRail` first appears in engine
  **v1.3.0** and ballast is pinned at **`#v1.2.1`**, so this is an engine bump
  dragging `net`/`lobby`/`qr`/`rematch` under a game with five P2P test files —
  not a file swap. `lobby.repaint()` likewise does not exist at v1.2.1.

  **The second half is stale outright:** ballast already stopped rebuilding its
  lobby in net handlers. `src/main.ts:338-363` routes them to a `repaint()` that
  early-returns on the mounted `.lobby-box`, with a comment saying it exists to
  stop the QR being yanked off screen — the exact bug this entry wanted fixed.

  Rewritten task, if anyone wants it: *bump ballast to `CURRENT_ENGINE_TAG`,
  write gesture tests for `touch.ts` FIRST, then port the rail and accept a
  documented list of behavioural deltas* — or grow `makeRail` a two-axis mode and
  a tap duration bound. It is a behaviour change either way, never a no-op.

- **Fleet migration: delete the five forked `src/engine/lobby.ts`** — NEW, and
  the largest single piece of fork debt in the fleet. `cipher-clash` (588 lines),
  `hexbloom` (645), `rhythm-relay` (597), `gravity-golf` (659) and `nightwire`
  (642) each ship an imported copy of the engine lobby, all pinned at engine
  `#v1.1.0`. This was hidden by the false "no forked `lobby.ts` survives" line
  corrected above. `hexbloom/src/engine/lobby.ts` explicitly names the
  public-rooms + `modeSlot` surface that engine **v1.3.1 already closed** — i.e.
  those closures shipped and no game ever consumed them, which is the real reason
  the debt is still here. Each fork also carries a private/public chooser,
  a noticeboard browser, `BoardAccess`/`Listing`/`roomAd()` and a host-only
  `modeSlot`; verify that superset against the current engine per game before
  deleting anything. Treat each game as its own run — the pin jump is
  `#v1.1.0` → `CURRENT_ENGINE_TAG` across `net`/`lobby`/`rematch`/`qr`, which is
  the same jump deepwatch made on 2026-08-08 (recipe above; it was clean there,
  and the lobby is the surface it moves most). Bundle the `share?: { title, text }`
  entry below with the first of these so a fork dies with it.

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
- **shunt**: a **hump / classification yard** as a fourth mode — the one genuinely different axis the
  build's design pass identified and deliberately cut. Wagons are pushed over a hump and roll into
  roads by gravity, so a road fills **FIFO from the far end** instead of LIFO from the mouth, which
  inverts the game's central constraint (today, "the order of a rake never reverses" is the whole
  puzzle). That is the appeal and also why it was cut: it needs a **second rules model, a second
  solver, a second generator and renderer support**, since `applyMove`'s push/pull inverse pair — the
  property that makes par provably optimal and the yard un-brickable — does not hold for a
  gravity-fed road. Two things to settle before building it: (a) is the reverse move still legal, and
  if not, does the backward Dijkstra still give exact par (it does not, on a directed graph — you'd
  search forward per yard, or prove a different symmetry); (b) the unanswered playtest critique that
  at 7 wagons a hump yard is "solve it on paper, then type in 13 confirmations" — i.e. it may be a
  planning exercise with no moment-to-moment decisions. Prototype the solver and measure branching
  and optimal-move uniqueness (shunt's shipped modes sit at ~4 legal moves/state) before committing
  to art.
