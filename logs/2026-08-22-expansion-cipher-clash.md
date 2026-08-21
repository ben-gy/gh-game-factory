# Expansion Desk — 2026-08-22 — cipher-clash

**Item actioned:** *Fleet migration: delete the forked `src/engine/lobby.ts`* →
the `cipher-clash` sub-entry.
**PR:** https://github.com/ben-gy/cipher-clash/pull/7 (open, assigned `ben-gy`, NOT merged)

## Why this item

Routine preference #1 is "a migration that deletes a fork" — the only class of
item with a *compounding* cost. The backlog named `cipher-clash` as
"UNBLOCKED, and the cheapest next one", and engine v1.4.0's own CHANGELOG says
"`cipher-clash` and `rhythm-relay` are unblocked by this release".

Re-measured at the top of the run rather than trusted: 4 forked `lobby.ts`,
12 forked `sound.ts`. **That local `find` was itself misleading** — see below.

## Verification before building (ultracode, Opus 5 subagents)

A 7-agent workflow: 4 parallel measurement agents, 2 adversarial refuters, 1
synthesis judge. **The 4 measurement agents all died on API 529s**, so the
`diff`/`css`/`importers`/`baseline` slots returned `null`. The two refuters and
the judge re-derived everything from source independently (87 tool calls), so
the run proceeded on evidence, not on the empty slots. Verdict: **GO**.

What the refuters caught that the backlog had wrong:

1. **"hexbloom — DONE 2026-08-15" is a PR, not a merge.** hexbloom#8 is still
   OPEN and hexbloom's fork is still on `main` at `#v1.1.0`. My local `find`
   missed it only because that checkout sits on its unmerged branch. Fork counts
   must be measured against `gh api .../contents/src/engine`, not the worktree.
2. **The local checkout was 4 commits behind `origin/main`** — an AGPL relicence
   (+3 lines to every source file), a feedback-widget change and an OG refresh.
   Building without pulling would have shipped a PR reverting all three, and it
   invalidated every line number in the backlog entry.
3. **hexbloom#8's `.lobby-host` collision claim is false** (see below).

## What shipped

Pin `#v1.1.0`→`#v1.4.0` (single-package re-resolve; installed version asserted
= `1.4.0`; lockfile churn 4/3). `src/engine/lobby.ts` deleted, `main.ts` + 2 test
importers re-pointed, `share.title` passed, mount renamed `.lobby-host` →
`.lobby-mount`, 3 CSS rules added, unseated/back-to-lobby paths use `roomCode`.

`src/engine/sound.ts` deliberately untouched — separate fork, separate entry.

## What was verified

- **Baseline first:** green before any change (15 files / 143 tests, `tsc` clean).
- **After:** `tsc` clean, **18 files / 155 tests**, `vite build` OK, zero dead refs.
- **Mutation-verified every new assertion** (each reverted, watched go red,
  restored). The most valuable one: dropping `share:` turns the *source*
  assertion red while the *DOM* share test stays green — the asymmetry that
  makes the source assertion worth writing.
- **In-browser at 375×812**, toggling only the `.lobby-modeslot` rule:

  | | `.modes`→`.vis` | `.vis`→`.re-note` |
  |---|---|---|
  | without | 0px (flush) | **−6px (overlap)** |
  | with | 16px | 10px |

  Held across all 3 modes and both visibility states; and at 1280×800 (capped
  460px, centred, no overflow).
- **QR panel:** 268×268, square, dark-on-light, quiet zone, inside the card,
  encodes the join link not the code.
- **Two-tab P2P:** typed-code join worked, roster 2/6, host stickiness held
  (creator kept HOST when the guest joined), identical board on both tabs,
  results showed both players, "Back to lobby" returned to the right room.

## What was NOT verified — stated plainly

- **Host transfer.** Closing the host tab left a stale roster with no promotion.
  **I ran the control**: stashed the change, re-pinned `#v1.1.0`, rebuilt, and
  repeated the identical test — the *unmodified* build behaves the same. Every
  pane tab reports `visibilityState: hidden`, which throttles the timers
  peer-leave needs. **Not a migration regression; not a pass either.** Needs a
  real two-device check.
- **The spectating screen** was never reached in the browser: a third peer
  joining mid-round never entered `phase: 'playing'` locally, so it got a normal
  lobby (notably, *not* the blank screen the fork would have shown). Covered by
  unit tests only.
- **No production check** — this is a branch, not a deploy.

## Incident during the run (recorded so it is not repeated)

The shell's working directory silently reverted to the factory root between Bash
calls, so a `git stash pop` intended for the game repo **ran against
`gh-game-factory` and conflicted a pre-existing `autostash` into `IDEAS.md`.**
No work was lost: the conflicted pop *keeps* the stash entry, so
`git checkout HEAD -- IDEAS.md` restored the factory to a clean tree with
`stash@{0}` intact, and the game repo's own `expansion-wip` stash was untouched.
**Lesson: use `git -C <abs-path>` for every git call in this routine.** Do not
rely on `cd` persisting across Bash invocations.

## Entry disposition

The `cipher-clash` sub-entry is **replaced**, not merely deleted — the parent
"Fleet migration" entry still has three games left, so it stays. Rewritten to
record: the corrected count (2 of 5 have a PR, 3 remain), the counting rule that
"DONE" means a PR not a merge, the measured `.lobby-modeslot` numbers, the false
`.lobby-host` claim, the two flex-column CSS surfaces, and the two process notes
(pull first; run the control before blaming host transfer).

## Needs a user decision (this routine cannot clear these)

1. **Merge hexbloom#8 and cipher-clash#7.** Until then both forks are live on
   `main` and the fleet debt is unchanged. The routine may not merge its own PRs.
2. **Sequence dependabot `cipher-clash#5`** (vite/vitest) against the pin bump —
   they both touch `package.json` / `package-lock.json` and will conflict.
3. **`cipher-clash#1` ("review", OPEN)** is a standing violation of the
   "no review PRs" rule.
