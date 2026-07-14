# Build Log: Cipher Clash
**Date:** 2026-07-13
**Status:** deployed

## Idea Source
IDEAS.md (first entry, now removed from the queue):
> Cipher Clash — head-to-head word-forming race on a shared shuffled letter grid
> (seeded RNG so both players get the same board); fastest valid words score.

## Game Details
- **Name / repo:** Cipher Clash / ben-gy/cipher-clash
- **Genre:** word
- **Core loop:** Drag across touching letters on a 4×4 grid to spell words (3+ letters); longer words score exponentially more; 90-second round. In versus, everyone shares the same seeded board and a word only scores for whoever claims it first.
- **Multiplayer:** live P2P (host-authoritative star, 2–6 players) + implicit async-seed (board derived from the room seed, shareable link = same board)
- **Stack / render:** vanilla-ts / DOM board + SVG chain trail + Canvas particle overlay
- **Engine modules used:** rng, sound, storage, net, lobby (loop not used — event-driven; a rAF loop drives visuals and a setInterval backs the countdown so it survives a backgrounded tab)

## Juice
- Procedural Web Audio SFX: pitch-rising `select` blip per chained tile, `coin`/`powerup` on a valid word (scaled by length), `hit` on invalid, `steal` on a taken/stolen word, `tick` in the final 10s, `win`/`lose` at round end. Mute toggle persisted.
- Canvas particle bursts (glyphs of the spelled word) + expanding ring on a scored word, colour-keyed to the player.
- Screen shake on 6+ letter words and on invalid/stolen; glowing SVG polyline chain trail; tile scale-pop; tweened score counter; sliding claim feed.
- Colour-blind-safe cyan/amber palette; full `prefers-reduced-motion` degradation (bursts become no-ops, no shake/transitions).

## Test Results
- Tests written / passed / failed: 30 / 30 / 0
- P2P-sync determinism test: pass (same seed → identical board + RNG streams; snapshot encode→decode round-trip)

## Build Status
- npm install: pass
- npm test: pass (30/30)
- npm run build (tsc + vite): pass (JS 1.37 MB / 418 KB gzip — dictionary-dominated)
- local play (Launch preview, Chrome MCP was offline): pass — menu, how-to auto-modal, board, drag + tap + keyboard input, chain trail, word-validity preview, scoring, feed, particles (verified at correct position), countdown (interval-driven, survives hidden tab), game-over → results → play again, zero console errors, mobile 375px layout, lobby UI + clean Trystero init
- multiplayer smoke (two live peers): NOT run — headless sandbox has a single hidden browser tab (no second context; rAF paused when hidden). Netcode is host-authoritative with unit-tested snapshot serialization and deterministic seeded boards; lobby + P2P init verified error-free.

## Deployment
- Repo created: ben-gy/cipher-clash
- Pages enabled (workflow build), Cloudflare DNS CNAME created, custom domain set + cycled for TLS
- PR: https://github.com/ben-gy/cipher-clash/pull/1

## Post-deploy note
- **GitHub platform incident during this run.** The first `cipher-clash` Actions
  deploy failed with "Service Unavailable / Failed to resolve action download
  info" (a GitHub-side hiccup) — re-running the workflow succeeded, and the game
  is live at https://cipher-clash.benrichardson.dev (HTTP 200, `https_enforced=true`).
  The `ben-gy/gh-game-factory` legacy Pages build (which republishes `index/` for
  the directory) was also stuck/erroring in the same window. `index/games.json` on
  `main` is correct (verified via raw.githubusercontent) and a `.nojekyll` was added
  to harden that build; the github.io copy will reflect cipher-clash once GitHub's
  Pages build service recovers. No further action needed on the game itself.

## Errors & Resolutions
- **web2 dictionary lacked plurals/inflections.** Initial dictionary was generated from `/usr/share/dict/words`, which omits most inflected forms — "BARS"/"CATS"/"PLAYED" were wrongly rejected in play-testing. Switched the generator to a SCOWL-derived list (`an-array-of-english-words`, added as a devDependency), regenerated `src/dictionary.txt` (~157k words, 3–9 letters, incl. inflections), committed. Verified coverage.
- **Trystero payload type constraint (build error).** `room.makeAction<T>` in the copied net.ts failed tsc under trystero 0.21 (`T` not assignable to `DataPayload`). Bridged through an untyped cast in the generic `channel()` wrapper.
- **Countdown froze when the tab was hidden.** The rAF-only loop paused in background tabs (also blocked automated verification). Split the loop: rAF for visuals, a 400ms `setInterval` for the countdown / round-end / host snapshots — hardening background behaviour and enabling the verification.
