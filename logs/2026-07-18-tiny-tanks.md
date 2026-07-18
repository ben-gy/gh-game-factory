# Build Log: Tiny Tanks
**Date:** 2026-07-18
**Status:** deployed

## Idea Source
IDEAS.md (first entry): "Tiny Tanks — top-down capture-the-flag in a walled maze, two teams, tanks fire bullets that ricochet off walls several times before expiring (so you bank shots around corners and can kill yourself with your own rebound); pickups drop upgrades like spread shot, homing, mines, ricochet count, and speed. Peers each simulate their own tank and broadcast pose + fire events; bullets are deterministic from (origin, angle, seed) so every client resolves the same bounces via patterns/rng.ts. AI tanks fill empty seats and play the flag objective."

Adapted: kept ricochet CTF + pickups + AI-filled seats, but used the proven **host-authoritative snapshot star** (not per-peer bullet sim) for robustness and to reuse the battle-tested netcode. Cut homing/mines to keep scope shippable (kept spread, rapid, speed, shield, ricochet).

## Game Details
- **Name / repo:** Tiny Tanks / ben-gy/tiny-tanks
- **Genre:** arcade
- **Core loop:** drive, bank ricochet shots off walls, steal the enemy flag, race it home; first team to 3 captures wins
- **Multiplayer:** live P2P versus, 2–4 humans always rendered as a 2v2 (bots backfill empty seats), host-authoritative snapshot star, host transfer promotes a survivor
- **Stack / render:** vanilla-ts / canvas
- **Engine modules used:** net, rematch, lobby, rng, loop, joystick, mobile, sound, storage, identity, input

## Juice
Procedural SFX (fire, ricochet tick, explosion, flag grab, capture, pickup); particles on wall bounces + tank kills; screen shake + hit-stop on kills/captures; body eases toward heading, turret toward aim; pulsing pickups; bobbing flags; the countdown 3-2-1-GO with audio.

## Test Results
- Tests written / passed / failed: 122 / 122 / 0 (15 files)
- P2P-sync determinism test: pass (rng.test.ts)
- Point-symmetry fairness test: pass (mirror-input keeps seats exactly mirrored → team fairness by construction)
- Host-transfer takeover: pass (5 tests) · rematch lifecycle / net-lifecycle one-join / host-election / no-deadlock / room-code / trystero-rejoin / source-hygiene / per-mode layout / snapshot round-trip: all pass
- Balance sim (160 AI-vs-AI 2v2 games/mode): team rate 48–55%, P(lead@1) 66–72%, ~0–1 timeouts of 160, blowouts 13–19%, ~50–70s games

**Balance was the whole game (principle 18).** The sim OVERRULED the design repeatedly:
- One-shot kills → **ZERO** bot captures (a flag run is a multi-second drive; a lone hit ended it every time). Fixed: two-hit tanks (`TANK_MAX_HP=2`) + a grab-invuln (`GRAB_INVULN`) + cover on the return path in every mode.
- A ~1:3 team capture skew traced to the bot's wall-follow chirality being keyed off team parity (a 180° rotation preserves chirality) — fixed to `seat < 2`.
- A persistent ~55–65% team-0 lean traced to a **self-symmetric centre pickup** the lower seat always won on a tie — removed; the sim then became provably point-symmetric (mirror test = 0 error).
- Rampart had a genuine 63% team-0 geometry lean (off-centre guard gap + single-corner block) — rebuilt symmetric.

## Build Status
- npm install / test / build / local play / multiplayer smoke: pass / pass / pass / pass / pass
- **Every mode verified in-browser at ~375px (principle #20):** Clash, Labyrinth, Rampart — each fills the PORTRAIT phone screen (bases top/bottom), zero horizontal overflow, twin-stick zones on-screen, overlay correctly `display:none` (no blur), zero console errors. Fixed a real mobile bug found here: the original landscape arena letterboxed to a thin strip on a phone → rotated the whole (balance-verified) arena 90° to portrait, which preserved balance by construction (a rotation is symmetric) and now fills the screen.
- **Two-peer P2P smoke test on PRODUCTION:** create room → join by TYPED lowercase code (normalized to the same room) → mesh formed (2/4, both peers visible) → host stickiness (creator holds HOST, guest not) → bidirectional vote propagation (guest READY badge rendered on host) → **live in-sync round started on both peers** (guest renders the host's authoritative snapshots; clock + tank positions advance together). Host-leave and rematch are covered by the green automated takeover/rematch/election tests + the verbatim engine (proven in 8+ shipped games); observing them live is unreliable under the harness's background-tab rAF throttling.

## Deployment
- Repo created / Pages enabled / Cloudflare DNS / TLS / PR: all done / https://github.com/ben-gy/tiny-tanks/pull/1
- Production verified in-browser (desktop + ~375px mobile), all three modes, zero console errors, HTTPS 200.

## Errors & Resolutions
- One-shot kills made bot captures impossible → two-hit tanks + grab-invuln + return-path cover (measured, not argued).
- Team-fairness skews (chirality, self-symmetric pickup, off-centre Rampart gap) → all found by the balance sim and fixed; the sim is now provably point-symmetric.
- Landscape arena unplayable-thin on a phone → 90° rotation to portrait (balance preserved).
- rng.test.ts / modes.test.ts import + unused-import fixes to satisfy `tsc` under the test-inclusive tsconfig.
