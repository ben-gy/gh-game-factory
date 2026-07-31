# 2026-08-01 — Expansion Desk: snake-royale, delete the forked `lobby.ts`

**Item actioned:** *Fleet migration: delete `snake-royale`'s forked `lobby.ts`*
(game factory `EXPANSION_IDEAS.md`, Engine section).

**PR:** https://github.com/ben-gy/snake-royale/pull/7 (not merged — it carries
user-visible behaviour changes, so the straight-to-main exception does not apply).

## Why this item

Preference #1 in the routine: a migration that deletes a fork. A fork is the only
kind of backlog entry with a *compounding* cost — `src/lobby.ts` stopped receiving
every engine lobby fix the day it was taken, and the entry itself called it "the
single highest-value migration left". It was also the last `lobby.ts` fork in the
fleet, so clearing it closes that class of debt entirely.

## Verifying the claim first

The entry was treated as a claim, not a fact:

- `src/lobby.ts` really was still present (674 lines) and `main.ts` really did
  import from `./lobby`.
- The engine's `lobby.ts` (859 lines) is a **strict superset**: every symbol the
  fork exported is exported by `@ben-gy/game-engine/lobby`, `P2P_IP_NOTE` /
  `BROWSE_IP_NOTE` verbatim.
- Re-took the version facts rather than trusting them: the game was pinned at
  `#v1.3.1` while `CURRENT_ENGINE_TAG` is `v1.3.2`, and v1.3.2 is a QR-fill fix
  that the fork could never have received. Bumped as part of the migration.

Claim confirmed. Built it.

## What was built

Deleted `src/lobby.ts`; re-pointed `main.ts` and three test files
(`public-rooms`, `lobby-host-offer`, `room-code`) at the engine module; bumped the
pin `v1.3.1` → `v1.3.2`; added `tests/lobby-engine-surface.test.ts` (7 tests) and
one CSS rule that test forced out.

**Gained:** a join QR (the fork had none), sticky view state so a repaint no
longer closes it mid-scan, a spectating screen for a peer that missed the round
start (the fork left it on a blank screen), relay *write* health in `?netdebug=1`,
and both HOST+READY badges.

**Given up, deliberately:** the Web Share sheet now says "Join my game" instead of
"Join my Snake Royale game" — the engine has no `shareTitle`. Fleet-consistent
(every other engine-lobby game shows the same), and not worth keeping a 674-line
fork alive for one string. Logged as a new engine entry instead. Start button
reads "Start now" not "Start game".

## What the new test caught

`main.css` was written against the **fork's** markup, so the engine's larger
surface could paint as an unstyled heap with `tsc` and every other test green.
The test asserts per-*element* (not per-class — `.lobby-ready` / `.lobby-cancel`
are bare `querySelector` hooks on a `.lobby-btn`, so flagging them is noise) that
nothing renders with no styled class at all.

It found `.lobby-modeslot` genuinely unstyled — the engine wraps `modeSlot`'s
output in a div this stylesheet had never heard of. **Mutation-verified: seen red
before the CSS rule, green after.** Two other early failures were bugs in my own
fake (`votes` is `RoundPlayer[]`, not `string[]`), not in the migration.

## Verified

- `tsc --noEmit` clean; **192 tests pass** (was 185); `npm run build` green.
- In-browser at **375×812 and 1280×800** (both — a breakpoint audit confirmed the
  lobby has no width media query, but it was checked rather than assumed):
  created a room, opened the QR (fills its card, correct room-code caption),
  switched arena Royale→Skirmish.
- The two things most likely to break silently, measured rather than eyeballed:
  the arena and visibility pickers still re-wire through the new
  `.lobby-modeslot` wrapper (their handlers use descendant selectors), and the
  gap between the two chip grids is **exactly 10px** — `.modes`' own
  `margin-bottom`, i.e. the wrapper added nothing. `scrollWidth - clientWidth === 0`
  at both widths.
- The QR **stayed open across the repaint** triggered by the arena change — the
  sticky view state working live, which is the fix the fork never had.

## Traps hit

- **npm served the stale `1.3.1` tarball** on the tag bump and reported success.
  Caught by checking the installed version. Fixed by re-resolving **the single
  package**, *not* by regenerating the lockfile — a full regenerate on macOS keeps
  one rollup platform binary of ~25 and kills `npm ci` on the Linux runner. All
  **76** rollup entries verified present before and after.

## Skipped, and why

- **`ballast: delete src/touch.ts` in favour of `makeRail`** — a genuine fork
  deletion, fork confirmed still present. Skipped only because this run takes one
  item; it is the strongest candidate for the next run.
- **The four blocked `sound.ts` forks** (`gloamrun`, `morsel`, `delvepack`,
  `frostward`) — blocked on real engine gaps (per-cue throttle, polyphony cap,
  filtered-noise band). Not actionable without engine work first.
- **`deepwatch`'s `sound.ts`** — the entry itself says it needs a sign-off on a
  noise-gain change (`*0.55` → `*0.6`). That is a judgement call, left for the
  user.
- Everything in the **site** and **tool** backlogs — all are additive feature
  work, none is a fork deletion, so none outranked this.

## Needs a user decision

- **`deepwatch` sound migration**: ship the slightly louder noise cues, or grow
  the engine an amplitude option first?
- **tool factory**: deleting `ben-gy/collate` and `ben-gy/pagewell` still needs
  `gh auth refresh -h github.com -s delete_repo` (interactive — the baked-in token
  lacks `delete_repo`). Both are archived, so this is cleanup, not urgent.
