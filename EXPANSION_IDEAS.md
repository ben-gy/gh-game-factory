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
  override deleted) and **scrapwall** (forked `sound.ts` deleted, cue table kept
  as `src/cues.ts`). See the engine CHANGELOG for the relay measurements.

- **Fleet migration: delete the remaining forked `sound.ts`** — `snake-royale`,
  `morsel`, `deepwatch`, `frostward`, `gloamrun`, `delvepack`. Each is mechanical
  and scrapwall is the worked example: lift the `PATCHES` table into
  `src/cues.ts`, delete `src/sound.ts`, import `createSfx` from
  `@ben-gy/game-engine/sound`, and pass `{ muted, patches: CUES }`. Two of them
  (`morsel`, and `snake-royale`'s chain chirp) also hand-rolled a pitch argument —
  that is now `play(name, { pitch })`. Pin `#v1.3.1` and CHECK the installed
  version, because npm serves a stale tarball on a tag bump and says nothing.
  Watch for hand-written file lists in each game's `manifest.test.ts`: scrapwall's
  named `src/sound.ts` explicitly and went red when it was deleted (fixed there by
  enumerating `src/` from disk, which is the better test anyway).

- **Fleet migration: delete `snake-royale`'s forked `lobby.ts`** — the engine now
  carries the public-rooms surface it was forked for, verbatim, including the
  `P2P_IP_NOTE` / `BROWSE_IP_NOTE` wording. Its `modeSlot` / `onModeMount` /
  `repaint()` are first-class lobby options now. This is the single highest-value
  migration left, because that fork was a strict superset that stopped receiving
  every engine lobby fix.

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
