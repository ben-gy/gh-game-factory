# Expansion Desk — 2026-07-25 — snake-royale

## Item actioned

**Fleet migration: delete the remaining forked `sound.ts`** (game-factory
`EXPANSION_IDEAS.md`, Engine section). Picked as a fork-deletion migration —
the highest-priority class per the routine, because a forked file stops
receiving upstream engine fixes and compounds daily.

Shipped: **snake-royale**'s forked `src/sound.ts` deleted; the game now uses the
shared engine `createSfx` from `@ben-gy/game-engine/sound` (v1.3.1).
Straight to `main` (ben-gy/snake-royale @ `b758827`) under the Step 5
pure-fork-deletion exception — no behaviour change, green suite.

## The claim was substantially false — verified against the code

The entry said all six games (`snake-royale`, `morsel`, `deepwatch`,
`frostward`, `gloamrun`, `delvepack`) were "mechanical … lift the PATCHES table,
delete sound.ts", with only `morsel` and `snake-royale` having a hand-rolled
pitch. Reading all six forks, that is wrong:

| game | reality | migratable now? |
|---|---|---|
| snake-royale | byte-exact engine synth; positional pitch only | **YES — done** |
| deepwatch | pitch-only (`depth`→shift), but noise gain `*0.55` vs engine `*0.6` | near — needs a sign-off on the noise delta |
| gloamrun | per-cue **throttle** (`MIN_GAP shot/mhit/hurt` + `lastAt`) | NO — engine has no throttle |
| morsel | **voice cap** (`voices>12`) + `onended` + log mass→pitch transform | NO — engine has no polyphony cap |
| delvepack | voice cap + `onended`, noise gain `*0.5` | NO — engine has no polyphony cap |
| frostward | bandpass-filtered noise **band** per patch (BiquadFilter, Q 0.9) | NO — engine has no filter layer |

So four of the six are really requests for the engine to grow per-cue
throttling, a polyphony cap, and a filtered-noise band. Deleting those forks
as-the-entry-described would have shipped audible regressions (machine-gun SFX,
clipping frenzies, flattened texture), not no-ops. The entry has been rewritten
to reflect this per-game, and a new Engine entry logs the three synthesis gaps
the v1.3.0 patch-table work did not close. `snake-royale` was the one genuine
byte-exact table-fork, so it is the one that shipped.

## What I built (snake-royale)

- Bumped `@ben-gy/game-engine` `#v1.1.0` → `#v1.3.1`. **Surgical lockfile
  update** (`npm install @ben-gy/game-engine@…#v1.3.1`), NOT a full
  regenerate — my first attempt (`rm package-lock.json && npm install`) drifted
  every dev dep (vite/esbuild churn, ~8000 lines) exactly as the
  "regenerated-lockfile-breaks-CI" note warns; restored and re-resolved just the
  one package → 3-line lockfile diff.
- Lifted the 11-cue PATCHES table into `src/cues.ts` (`Record<string, Patch>`),
  `go` redefined so the launch tone stays exactly as shipped.
- `createSfx(settings.muted)` → `createSfx({ muted, patches: CUES })`.
- Positional pitch → `{ pitch }` at the two callers: `countdown.ts` (`beep`) and
  `main.ts` (`eat` combo). Verified both pitch inputs are always > 0, so the
  engine's `pitch<=0 → 1` guard never changes behaviour.
- `countdown.ts` / `countdown.test.ts` re-pointed at `@ben-gy/game-engine/sound`;
  the test's fake `Sfx` gained the engine's new `addPatches`/`has` methods and
  now reads `opts.pitch` instead of the positional arg.
- `src/sound.ts` deleted. Re-added the AGPL SPDX header to `cues.ts` after a
  mid-run rebase picked up the repo's relicense commit.

## Verified

- `tsc --noEmit` clean; `npm test` 185/185; `npm run build` OK.
- **Mutation-verified** the pitch path: stripping `{ pitch }` from the countdown
  call turns the "rises in pitch" test red; restoring it green. The path is
  load-bearing, not vacuously passing.
- **Browser at 375px** (in-app pane, mobile preset, against the built preview):
  boots, "How to play" renders, Endless solo runs the 3-2-1-GO countdown (fires
  `beep`×3 + `go`), death-into-wall fires `die`/`crash`/`lose`, game-over screen
  clean. **Zero console errors** across the whole session.
- **CI deploy green**: `npm ci` on the Linux runner succeeded (run 30131957471),
  which is the real proof the surgical lockfile kept the platform binaries.

## Not exercised in-browser

The `eat` cue's pitched caller fires only on eating a pellet, which I did not
manage before steering into a wall. Its transform is identical in shape to the
mutation-verified countdown one and is `tsc`-checked against the engine
`PlayOptions`, so the risk is negligible — noted rather than left implied.

## Skipped / needs a user decision

- **The other five sound forks are NOT ready to delete.** Four need engine
  features first (throttle / voice-cap / filtered band — logged as a new Engine
  entry). `deepwatch` is close but changes noise loudness slightly; that is a
  taste call for the user, not something this routine should decide silently.
- Everything else in the three backlogs was left untouched this run.
