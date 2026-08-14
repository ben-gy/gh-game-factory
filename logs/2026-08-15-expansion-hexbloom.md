# 2026-08-15 — Expansion Desk: hexbloom rejoins the shared lobby

**Item actioned:** "Fleet migration: delete the five forked `src/engine/lobby.ts`"
(game factory), bundled with "Engine `lobby.ts`: an optional `shareTitle`" as the
entry itself instructed.

**PR:** https://github.com/ben-gy/hexbloom/pull/8
**Engine release:** `ben-gy/gh-game-engine` v1.4.0 (commit `704452f`, tagged and pushed)

## Why this item

The routine's first preference is "a migration that deletes a fork", because a
forked file stops receiving upstream fixes and compounds daily. This was the
largest such item in any of the three backlogs: five games, ~3,100 lines of
duplicated lobby, all pinned at engine `#v1.1.0` since July.

## Verifying the claim before building (step 2)

The entry was treated as a claim, and re-measured. It held:

- All five forks exist and are imported. `find games/*/src -iname '*lobby*.ts'`
  returns `cipher-clash`, `hexbloom`, `rhythm-relay`, `gravity-golf`, `nightwire`.
- No lobby migration commit exists in any of the five repos — the newest commit
  in each is still the v1.1.0 adoption.
- The "engine v1.3.1 closed the public-rooms + modeSlot surface" claim is TRUE
  (though it landed in v1.3.0, not v1.3.1). All five forks' extra surface —
  `BoardAccess`, `Listing`, `roomAd()`, `createListing`, the private/public
  chooser, the noticeboard browser, the host-only `modeSlot` — is present and
  byte-equivalent in the engine. **No fork carries a named export the engine
  lacks.**

Two adversarial agents were tasked with refuting the item. Neither could, but
both returned corrections that would otherwise have shipped bugs:

1. **`share?: { text?: string }` as specced was wrong.** The default
   interpolates the room code, and a game builds its lobby config before
   `getOrCreateRoomCode()` has necessarily run — so a plain string would have
   shipped the literal **"Room undefined"** to every invite. Shipped as
   `text?: (roomCode: string) => string`.
2. **The share title was never the whole blocker.** 5/5 forks rewrite the share
   title, but **4/5 also rewrite `'Start now'`** and 1/5 rewrites `'Leave room'`.
   Building the entry exactly as written would have deleted **zero** forks —
   including the one this run migrated. v1.4.0 therefore ships `labels?:
   { start?, cancel? }` as well.

## What shipped

**Engine v1.4.0** — `share?: { title?, text? }` and `labels?: { start?, cancel? }`
on `LobbyConfig`, both defaulting to the existing copy so an omitting caller gets
byte-identical output. `tests/lobby-wording.test.ts`, 12 tests, including **the
first coverage `share()` has ever had** (five games had already forked a function
with zero tests). Engine suite 175 → 187 green.

**hexbloom** — 645-line fork deleted, pin `#v1.1.0` → `#v1.4.0`, `main.ts` plus
three test files re-pointed at `@ben-gy/game-engine/lobby`, the two strings passed
at the call site, one CSS rule. 184 tests green, tsc clean, build clean.

Engine released straight to `main` with a tag rather than via PR: the engine has
never had a PR (linear release history, `git log` shows tagged release commits
only), and the game PR cannot be built or reviewed against an untagged branch.
The reviewable unit is the game PR, which is open and unmerged.

## Verified

- Installed engine version **asserted** as `1.4.0` before believing any green
  build — the documented npm-serves-a-stale-tarball trap.
- Lockfile: the single package was re-resolved, not regenerated. All 25 rollup
  platform binaries survive, so `npm ci` still works on Linux.
- **Mutation-verified, both repos.** Reverting the engine's `src/lobby.ts` turns
  7 of 12 new tests red (the 5 that stay green are the defaults, correctly);
  dropping `escapeHtml` alone turns the injection test red. On the game side,
  removing `share:`/`labels:` from `main.ts` turns the source-level guard red
  while the two DOM tests stay green — the asymmetry is the point, since a
  dropped config field is silent when the engine has defaults.
- **Browser at 375×812 with two live P2P peers**: both reached a running round
  with an identical board; Start reads "Start game" at quorum and "Waiting for
  1 more…" below it; `navigator.share` received
  `{ title: 'Join my Hexbloom game', text: 'Room NCKU' }`; all three modes and
  the private/public chooser re-wire through the engine's new `.lobby-modeslot`
  wrapper; no horizontal overflow.

## One defect the review pass found that the browser pass missed

An independent three-lens review with adversarial verification raised six
findings; four were refuted, two survived:

1. **The commit message overclaimed.** It said the migration gained five things
   including the spectator screen. The fork had already ported
   `renderSpectating()` — which is exactly why `tests/lobby-spectating.test.ts`
   passes against the package unchanged. Corrected to four. Worth recording as a
   process note: this is the artefact the next fork-deletion will read to decide
   what the engine already provides, so an inflated list gets trusted rather than
   re-derived.
2. **The join-QR toggle rendered flush against the first roster card.** The
   engine emits it with only `margin:10px auto 0` inline; hexbloom's `.lobby` is
   plain block flow with no gap and `.lobby-players` has `margin-top: 0`, so the
   gap below the pill was **0px** against 14px above. My own 375px screenshot
   pass looked at this and did not see it — it took a computed-style measurement
   to catch. Fixed to 14/14 and re-verified. **Games whose `.lobby` is a
   flex/grid with a gap get the separation for free, which is why this has never
   bitten in ~45 other games** — worth checking per game on the remaining four
   migrations.

## Left undone, deliberately

- **Four lobby forks remain.** Each is its own run, as the entry instructs. The
  backlog entry has been rewritten with the per-game blockers now *measured*
  rather than assumed: `cipher-clash` and `rhythm-relay` are unblocked by v1.4.0;
  `nightwire` needs an engine `note?: string`; `gravity-golf` needs
  `roomCodeFromUrl()`, a seed-stripping `setRoomInUrl`, and has a behavioural
  fork (its host abstains from the ready vote) that no config option closes.
- **`labels.cancel` ships with no consumer in this PR.** Verified-forked in
  `rhythm-relay`; shipping it now avoids a second engine release for one string.
  Flagged explicitly in the PR rather than passed off as consumed.
- **The takeover offer's button wraps to three lines at 375px.** Measured as
  contained (78×52 in a 305px row, no overflow) and reachable only in the 15s
  alone-in-a-room window. Restyling an engine-owned class belongs in the engine.

## Backlog changes

- **Deleted:** the `shareTitle` entry, replaced by a DONE record carrying the two
  spec corrections so nobody rebuilds it from the wrong premise.
- **Rewritten:** the five-forks entry → 1 done, 4 remain, with per-game blockers.
- **Updated:** the Engine section header's fork tally (5 → 4 lobby forks) and
  `CURRENT_ENGINE_TAG` in the game-factory SKILL (`v1.3.2` → `v1.4.0`).

## Nothing was skipped as stale this run

No entry was found to be false and deleted. The two entries actioned were both
substantially true; what was wrong in them was *incomplete*, not fabricated.
