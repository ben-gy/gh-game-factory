# Expansion Desk — 2026-08-08 — deepwatch

**Item actioned:** delete deepwatch's forked `src/sound.ts` and rejoin the shared
engine synth.
**PR:** https://github.com/ben-gy/deepwatch/pull/3 (open, assigned `ben-gy`, NOT merged)

## Why this item

The routine's preference order puts "a migration that deletes a fork" first, on
the grounds that fork debt compounds daily. Four candidates were verified in
parallel against real source before choosing; three of the four backlog claims
turned out to be wrong in some material way, which is itself the finding.

| Candidate | Verdict | Outcome |
|---|---|---|
| `deepwatch` sound fork | **PARTLY true** — numbers right, "near-mechanical" wrong | **BUILT** |
| `ballast` `touch.ts` → `makeRail` | **FALSE, both halves** | entry rewritten, not built |
| Engine sound throttle/voice-cap/band | **PARTLY** — item (c) misspecified | entry corrected, deferred |
| Engine lobby `shareTitle` | **TRUE** but deletes no fork today | entry sharpened, deferred |

Three independent judges scored the verified dossier on different lenses
(routine-order, compounding-value, regression-risk). Two of three picked
deepwatch; the third picked `shareTitle` precisely because it is the
lowest-regression option, which is a fair objection but loses to the rule that a
gap whose fork is still in place was not closed.

An independent adversarial agent then tried to REFUTE that deepwatch was worth
building. Verdict: **not refuted, high confidence** — it went further than asked
and aliased deepwatch against a real v1.3.2 checkout, getting `tsc` exit 0 and
174/174 before any of my changes existed. But it surfaced the objection that
changed the design (below).

## What the entry got wrong

Every *number* in the backlog entry checked out (the `1 - 0.62*depth` shift, the
single `surface` caller, the `*0.55` vs `*0.6` noise gain). The word
**"near-mechanical"** did not. Three things a literal reading would have shipped:

1. **`beat`/`go`/`select` collide with engine built-ins at DIFFERENT values** —
   `beat` is a sine in deepwatch and a triangle in the engine. Game patches merge
   *over* defaults, so omitting any of the 12 is an audible change with no error.
2. **The engine ignores a `pitch <= 0`** rather than clamping it, so an unclamped
   depth ratio would play at FULL pitch — the opposite of a deep card. The clamp
   is load-bearing.
3. **The fork's `try/catch` is not decoration.** The engine's `createSfx` has no
   error handling and never has. `sfx.unlock()` is the *first statement in the
   core tap handler*, so a blocked `AudioContext` aborts the handler before the
   move runs — the failure mode is an **untappable game**, not a silent one.
   Preserved as a `createGameSfx` wrapper.

## What was verified

- Baseline green BEFORE touching anything: `tsc` clean, **174/174**.
- Engine pin `#v1.1.0` → `#v1.3.2`, re-resolved as a single package
  (**3 lines** of lockfile churn), installed version **asserted at 1.3.2**.
- Bump verified green on its own before the audio work: 174/174.
- After migration: `tsc` clean, **185/185** (+11), `vite build` OK.
- **Four mutations, each seen RED then restored green:** armour removed from
  `unlock()`; cue table not passed to the synth; clamp removed from `depthPitch`;
  a `console.log` in a file the old hand-written manifest list could never see.
- **In-browser at 375×812** (local preview, `--strictPort`, served `<title>`
  confirmed): all three modes (Shallows / Trench / Abyss) dived and tapped; a
  real `surface` + `misplay` + `tank` sequence played with gauge and tank pips
  updating; countdown ran; room entry → lobby → QR panel all render on the bumped
  engine. Console clean apart from the TURN endpoint's CORS rejection, a
  localhost-origin artifact that `getTurnConfig()` fails open on by design.
- Bundle 83.7 → 96.2 kB (32.0 → 36.7 kB gzip), from the larger v1.3.2 lobby.
  Bonus: the lobby **gains the QR join flow** it did not have at v1.1.0.

## Accepted behaviour change

Noise burst on `misplay`/`tank`/`lost` moves `gain*0.55` → `gain*0.6`
(**+0.79 dB**). Unreachable from the patch table, sub-perceptual, not worth new
engine API. Because it is not a pure no-op, this went via PR rather than straight
to `main`.

## The most important finding of the run

**"No forked `lobby.ts` survives anywhere in the fleet" (recorded 2026-08-01) is
FLATLY FALSE.** Re-measured this run, twice, independently:

```
find games/*/src -iname '*lobby*.ts'    # NOT games/*/src/lobby.ts
```

Five live, imported forks at `src/engine/lobby.ts` — `cipher-clash` (588 lines),
`hexbloom` (645), `rhythm-relay` (597), `gravity-golf` (659), `nightwire` (642) —
all pinned at engine `#v1.1.0`. The original check globbed one directory too
shallow. The same error undercounted `sound.ts`: **13** fleetwide, not five (now
12 after deepwatch).

Worse, `hexbloom`'s fork names the public-rooms + `modeSlot` surface that engine
**v1.3.1 already shipped to close** — those closures landed and no game ever
consumed them. The fleet's real fork debt is roughly triple what this file
claimed, and it is now logged as its own entry.

## Not done, and why

- **The other four `sound.ts` forks** (`gloamrun`, `morsel`, `delvepack`,
  `frostward`) — each blocked on engine features that do not exist. With
  deepwatch done there is **no drop-in left**.
- **No engine release.** Putting the `try/catch` into the engine would fix ~36
  games at once and is the better long-term answer, but a tag cannot be cut,
  consumed and verified inside one PR. Logged as a new entry.
- **deepwatch's other fork, `src/engine/drag.ts`** — different gap.
- **No two-tab P2P round driven to completion.** Lobby/room/QR surfaces verified
  and the five P2P test files pass, but a live two-peer dive was not played.

## Backlog delta

Actioned entry removed (rewritten as DONE with the recipe). Corrected: the false
lobby-fork claim; the misspecified engine `band?: { freq, q }` (frostward uses a
*swept* `noiseBand: [start, end]` scaling with pitch — building to the old spec
would ship a feature its only consumer cannot use); the `ballast` entry, kept as
an explicit DO-NOT-BUILD-AS-WRITTEN with the ten deltas. Added: engine audio
hardening; the five-lobby-fork migration; `share?: { title, text }` refinement.

## Needs a user decision

Nothing in the game factory blocks on the user this run. The one standing
user-only item lives in the **tool factory** backlog: deleting the archived
`ben-gy/collate` and `ben-gy/pagewell` repos needs `gh auth refresh -h github.com
-s delete_repo`, which is interactive — the baked-in token carries only
`gist, read:org, repo, workflow`.
