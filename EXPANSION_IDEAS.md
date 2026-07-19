# Expansion Ideas

Enhancements to **existing** games (new modes, more players, better juice, a fresh mechanic) go here for manual review — NOT built as new games. The daily factory logs them here when an idea is too close to something already shipped.

Format: `- **existing-repo-name**: Description of the enhancement or new mode. Include any library/spec URLs.`

_(no game enhancements yet)_

## Engine

Gaps in `@ben-gy/game-engine` that forced a game to keep a local fork. Closing one
means the fork can be deleted and that game rejoins the shared engine.

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
