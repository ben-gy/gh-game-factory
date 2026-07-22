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

- **`drag.ts` has no STEPPED RAIL axis.** It classifies tap / drag / swipe off one Pointer
  Events stream, which is right for cards and tiles, but it emits a *gesture*, not a stream of
  discrete axis steps. A falling-block game (and anything else that moves a piece column by
  column) needs "one step per N px of travel along an axis, with the grab offset preserved and
  a running emitted-step count so a slow drag back and forth nets out correctly". `ballast`
  implements it game-side in `src/touch.ts` per MOBILE_CONTROLS §6 — Pointer Events only,
  `setPointerCapture`, per-`pointerId` state, `pointercancel` as an abort,
  `clientX − getBoundingClientRect()`, intents queued and drained by the rAF step.
  **Proposed:** `makeRail(el, { stepPx, axis, onStep })` alongside `makeDraggable`, sharing the
  same promote/tap/swipe thresholds so tap-to-rotate and swipe-to-drop stay first-class.

- **`lobby.ts`'s `qrOpen` state is defeated by a caller that rebuilds the lobby.** The engine
  correctly keeps `qrOpen` in its own 600ms repaint key so the QR is not closed under a player
  mid-scan — but a game whose net handlers call `createLobby` again on every roster/vote change
  destroys and recreates the whole lobby, and the fresh one starts closed. `ballast` hit this
  and the QR vanished about a second after every tap; the fix was game-side (repaint in place,
  never rebuild a mounted lobby). It is a sharp edge worth blunting in the engine, because
  "repaint the lobby when something changes" is the obvious thing for a game to do.
  **Proposed:** either return a `repaint()` on the lobby handle (so games have an in-place
  option that is easier to reach for than rebuilding), or have `createLobby` detect that it is
  being mounted into a container it already owns and preserve its view state across the call.

- **`sound.ts` cannot be extended with game-specific patches.** This is the
  single biggest cause of surviving forks: `bidstorm`, `cipher-clash`,
  `gravity-golf`, `hexbloom`, `nightwire`, `rhythm-relay`, `snake-royale` and
  `windup` all kept a local `sound.ts` for it. `createSfx(initialMuted)` takes no
  config, `PATCHES` is a module constant, and `SfxName` is a CLOSED union of
  platformer cues (coin, jump, hit, explosion, powerup) — so a card game
  importing the engine would play "coin" when a card lands. Two of the forks also
  add a `pitch` multiplier to `play()` (hexbloom scales a chirp with capture size;
  snake-royale and cipher-clash do the same for chains), which the engine has no
  parameter for. **Proposed:** `createSfx({ muted?, patches? })` merging extra
  patches over the defaults, `SfxName` widened to `string`, and an optional
  `play(name, { pitch })`. That alone would retire 8 forks.

- **`lobby.ts` has no public-rooms surface.** `cipher-clash`, `gravity-golf`,
  `hexbloom`, `nightwire`, `rhythm-relay` and `snake-royale` keep a forked lobby
  that is a strict superset of the engine's: a private/public chooser, the
  noticeboard browser, the `P2P_IP_NOTE`/`BROWSE_IP_NOTE` privacy disclosures, a
  host-only `modeSlot`/`onModeMount` for the arena/track picker, and a `repaint()`
  on the returned handle. These forks are view-only — their netcode comes from the
  package — but they do NOT automatically get new lobby states, so each new engine
  lobby feature has to be hand-ported into six files (the v1.1.0 takeover offer and
  `?netdebug=1` overlay already were, for snake-royale and gravity-golf).
  **Proposed:** move the listing UI into the engine behind an opt-in config, and
  add `modeSlot`/`onModeMount`/`repaint` as first-class lobby options.

- **`RoundInfo` opts are untyped per game.** `bidstorm` had to redeclare
  `RoundOpts = Record<string, unknown>` locally. The engine's generic
  `RoundInfo<O>` covers it, but the ergonomics are poor — `createRounds` does not
  thread `O` through from `roundOpts()` to `onRound()`, so games cast.

- **`DEFAULT_RELAYS` has three impaired entries, and a write-restricted relay is
  indistinguishable from a healthy one by any connection check.** Measured during
  the `turntide` build (2026-07-19), two peers on the same machine could not
  discover each other at all: `wss://nostr.wine` accepts connections and answers
  READS but rejects WRITES ("restricted: sign up at https://nostr.wine to write
  events"), `wss://relay.damus.io` was rate-limiting announces ("you are noting
  too much" — plausibly aggravated by concurrent factory sessions sharing one IP),
  and `wss://relay.nostr.band` did not answer within 6s. Peers ANNOUNCE over these,
  so a write-restricted relay is a dead relay that still passes a liveness probe;
  with half the curated list dead the two peers settled on non-overlapping working
  subsets and never met. `turntide` works around it with a game-side `relayUrls`
  override (`src/main.ts`, `RELAYS`) — exactly the fork-per-game outcome the
  package exists to prevent. **Proposed:** (a) refresh the curated list to
  write-open relays (`nos.lol`, `relay.primal.net`, `relay.snort.social`,
  `offchain.pub`, `nostr.mom`, `nostr-pub.wellorder.net` were all write-open at
  time of writing); (b) treat a relay's first write rejection as a demotion and
  re-dial elsewhere, rather than counting it toward redundancy; (c) surface
  per-relay WRITE state (not just socket state) in `netDiag()`/`?netdebug=1`, since
  the overlay currently shows a restricted relay as connected. Then remove the
  turntide override.

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
