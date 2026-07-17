# Build Log: Rhythm Relay
**Date:** 2026-07-14
**Status:** deployed

## Idea Source
IDEAS.md (first item): "Rhythm Relay — co-op rhythm game where two players alternate lanes and must keep a shared combo alive." Removed from the queue and built. It's a good P2P fit because timing is judged **locally** on each peer's own lane, so WebRTC latency never affects the timing window — only the shared combo needs syncing, which is latency-tolerant.

## Game Details
- **Name / repo:** Rhythm Relay / ben-gy/rhythm-relay
- **Genre:** arcade
- **Core loop:** notes relay left↔right down two lanes → tap in time → build a shared combo + multiplier; misses drain energy; empty energy ends the run (score-attack).
- **Multiplayer:** live P2P co-op, 2 players, host-authoritative star. Each peer judges its own lane and reports `{step,lane,result}` hits on `hit`; host aggregates shared energy/combo/multiplier/score, authoritatively detects missed notes (with a network grace on the remote lane), and broadcasts a compact snapshot on `snap` at 15Hz.
- **Stack / render:** vanilla-ts / canvas (playfield) + DOM (HUD/menus)
- **Engine modules used:** loop, rng, sound, storage, net, lobby. (Custom full-half-screen tap zones + direct keydown for sample-accurate hit timing instead of input.ts's virtual D-pad.)

## Juice
- Fully procedural Web-Audio music: kick every beat, snare on the backbeat, hats on the offbeats, a bass note per bar, and a pentatonic melody blip fired by each chart note (panned by lane). Scheduled with a lookahead `setInterval` (not rAF) so the beat holds time when the tab is backgrounded.
- Hit-line particle bursts (bigger on Perfect), red shard burst + screen shake on Miss, beat pulse on the field/hit line/background, tweened combo counter that scales-and-settles and colour-shifts up the multiplier tiers, `powerup` flourish on each tier-up. All shake/particles respect `prefers-reduced-motion`.

## Test Results
- Tests written / passed / failed: 31 / 31 / 0
- P2P-sync determinism test: pass (RNG stream + full-chart equality across two identically-seeded peers; snapshot & flash serialization round-trips)
- Also covers: judging windows, scoring × multiplier, energy drain + combo break, game-over on empty energy, authoritative gate (client core never mutates shared score), host applying remote hits, a simulated 60Hz "perfect run" (combo climbs, 0 misses) and a no-input run (ends in game-over).

## Build Status
- npm install: pass
- npm test: pass (31/31)
- npm run build: pass (tsc + vite; ~52KB JS / 21KB gzip)
- local play: pass — menus/how-to/about render; playfield (lanes, hit line, target rings, key hints, HUD, full energy bar) renders error-free; mobile 375px layout fits; zero console errors. (Note: falling-note motion couldn't be filmed in the headless preview pane because it renders far slower than the anti-throttle stall-guard threshold, which correctly freezes the clock rather than mass-missing — a real 60fps player never hits it, and a pre-guard run completed a full solo game at speed. Live scoring-over-time and no-input game-over are both covered deterministically by tests.)
- multiplayer smoke: pass — two tabs joined room TEST, roster synced to 2/2, host elected (min peer id), presence/ready states live over the public nostr relay; zero console errors.

## Deployment
- Repo created: ben-gy/rhythm-relay
- Pages enabled (Actions workflow), Cloudflare DNS CNAME added, GitHub Pages CNAME set + cycled for TLS
- Deploy workflow: success
- PR: https://github.com/ben-gy/rhythm-relay/pull/1

## Robustness notes / decisions
- Added a **stall guard**: any single frame gap > 0.4s (backgrounded/throttled rAF, a GC hitch) is absorbed as paused time so the run never retroactively mass-misses notes. Plus **auto-pause on `visibilitychange`** so tabbing away can't kill a run.
- Co-op capped at 2 players (a duet); solo plays both lanes.

## Errors & Resolutions
- Initial `tsc` failures: Trystero's `makeAction<T>` generic constraint (cast around it in net.ts), unused `STEP_SEC` imports (removed), and `Lane` not re-exported from game.ts (added `export type { Lane }`). All fixed; build green.
