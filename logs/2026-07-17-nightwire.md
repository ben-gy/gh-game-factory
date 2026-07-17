# Build Log: Nightwire
**Date:** 2026-07-17
**Status:** deployed

## Idea Source
IDEAS.md (first entry, now removed):
> *"Deduction Table — social hidden-role deduction game (Werewolf/Mafia-style) for 4–10 players in a P2P room with a rotating narrator."*

**Two deliberate deviations from the brief:**
1. **The narrator is automated, not rotating.** A human narrator would gate solo play (violating principle #1: fun for one person in the first 5 seconds) and is a role with nothing to do.
2. **Deduction is structured, not free-form chat.** Chat-based Mafia is only playable with a full table of humans; it can't be played solo, can't be played by bots, and can't be tested. Replacing "argue about vibes" with a *legible information mechanic* keeps the hidden-role core (lying, voting, betrayal) while making the game solo-complete, genuinely deducible, and testable.

Expansion check: no social-deduction game existed in registry.json (arcade/board/word only), and `gh repo list ben-gy` had no `nightwire`. Genuinely new genre + a distinct multiplayer interaction → built, not logged as an expansion.

## Game Details
- **Name / repo:** Nightwire / ben-gy/nightwire
- **Genre:** party
- **Core loop:** Probe a seat → learn how many Ghosts sit in that 3-seat window → **Crew readings publish automatically and truthfully, Ghosts choose what number to publish** → vote to eject. A Minesweeper board where some of the numbers are lying.
- **Multiplayer:** live P2P, host-authoritative star, 4–10 humans. Solo = 4–10 seats vs solver bots.
- **Stack / render:** vanilla-ts / DOM (canvas behind the ring for particles only)
- **Engine modules used:** net, lobby, rng, sound, storage (copied from the evolved hexbloom copies, which carry `createRoomEntry`/`normalizeRoomCode` and the trystero `makeAction` cast). Not input.ts (no d-pad — turn-based DOM) and not loop.ts (no fixed-timestep sim).

## Design decisions worth knowing
- **Nobody is eliminated at night.** Ghosts darken a console instead (that seat gets no reading), so a 4-player table never collapses into two people watching, and the blackout clock — one cut every night, always — bounds game length instead.
- **No bots in P2P rooms**, so the minimum really is 4 humans. Bot roles live only in the host's memory and a promoted host can't recover them (a peer can only attest for *itself*); deriving them from the shared seed would let every player compute which bots are Ghosts. Bots stayed solo-only rather than break the host-transfer contract or the secrecy model.
- **Host transfer with hidden roles.** No peer is ever sent another peer's role, so a promoted host has no role table. It broadcasts `rq` and every survivor replies `rl` with its own role. The round's *secret* state (probes, readings) dies with the old host, so a night/dawn in flight rewinds to the top of that same round and **un-ticks the cut** so the blackout clock stays honest; a vote in flight survives intact because the ledger and votes are already public. Silent seats are revealed and dropped, and any unaccounted-for Ghosts are **inferred onto them** — defaulting them to Crew would erase a Ghost and hand the Crew a win they never earned.
- **A peer leaving reveals and removes their seat** (like an ejection, but no vote spent and no clock tick). A secret role nobody can attest to would both corrupt the win condition and block a future takeover.
- **Secrecy is disclosed, not faked.** The host's browser deals the roles; stated plainly in the lobby and About. Host-proof secrecy needs mental poker — an explicit non-goal.
- **Bots are real.** They enumerate every ghost-assignment consistent with the ledger (≤ C(10,3)=120 worlds) under "Crew claims are true", and suspicion = fraction of surviving worlds containing a seat. Ghost bots run the same solver from the *observer's* point of view and pick the lie maximising worlds where they look Crew.

## Juice
Procedural SFX (sonar probe ping, wire-snap cut, airlock eject, dissonant Ghost sting vs falling Crew tone, win/lose), ember burst from an ejected seat, a spark travelling from the table centre to each cut console, screen shake on cuts and ejections, tweened seat/meter transitions, big Minesweeper-style numbers on the seats. All motion respects `prefers-reduced-motion` (the lobby spinner keeps turning, slowly, since it's the "page is alive" signal). Palette is teal/amber/violet/rose, distinguishable under deuteranopia and protanopia, and **every role is always labelled with text, never colour alone**.

## Test Results
- Tests written / passed / failed: **93 / 93 / 0**
- P2P-sync determinism test: **pass** (identical seating AND roles from the same seed; exact ghost count for every table size 4–10 over 40 seeds)
- Host-transfer takeover test: **pass** (client holds no authoritative state → promoted → rebuilds via attests → drives to `over === true` with nobody acting)
- Room-code normalisation test: **pass** (`k7qp`, ` K7QP `, `k7-qp` → `K7QP`)
- Turn-0 fairness test: **pass** (every player and every seat position equally likely to be a Ghost within 15% over 4000 seeds)

**Bugs the tests caught during the build:**
- Four solver tests initially failed because I'd fabricated ledgers where a *Crew* claim was false — impossible under the rules. The real invariant is that **the ledger is never unsatisfiable in real play**: the true world always fits, since Crew claims are truthful by construction and a Ghost's own row is exempt. Rewrote those scenarios to be reachable.
- That surfaced a real gap: nothing stopped a claim larger than the total Ghost count — a number no honest reading could produce. Added `maxClaim = min(windowSize, ghostCount)` at the rules level, so the UI only offers legal numbers.
- The takeover initially defaulted unattested seats to Crew, which could erase a Ghost and hand the Crew a bogus win. Now inferred (see above), with a regression test.
- A client promoted after the host left would have waited the full 4s role timeout for the departed host to attest. Clients now track `goneIds` too, so promotion is instant.

## Build Status
- npm install: pass
- npm test: pass (93/93)
- npm run build: pass (tsc + vite, 65.7 kB JS / 24.9 kB gzip)
- Local play: pass — full solo playthroughs to real endings as **both Crew and Ghost**; `[hidden]` visibility gate verified (modal computes `display:none`, `elementFromPoint` at the table centre returns the ring, not an overlay); zero console errors
- **Multiplayer smoke test (4 real peers, all four gates): pass**
  1. **Typed-code join:** tab A created room `AN6U`; tab B typed `an-6u` → normalised to `AN6U` → same room. Not the invite link.
  2. **In-sync play:** a client's probe round-tripped to the host and echoed back in the snapshot; the host showed that peer as acted.
  3. **Host leave:** closed the host tab mid-game → `Player 30` revealed as CREW and dropped, `Player 19` promoted with "The host left — you're the host now. You hold the deal", and **the game ran on to a real game-over** (Ghosts won on parity at 2-of-3 wires cut). No freeze.
  4. **Non-host leave:** in a second room, closed a non-host peer → revealed, dropped, host stayed at Night round 1 and kept playing. No stall.

## Deployment
- Repo created: ben-gy/nightwire · Pages enabled (workflow) · Cloudflare DNS OK · deploy run `completed/success`
- **Production verified for real:** loaded https://nightwire.benrichardson.dev in-browser, started a solo game, probed a seat and got a reading, ledger populated to Vote phase; zero console errors; visibility gate re-run against production (play surface topmost); desktop screenshot crisp — not blurry, dimmed or covered.
- PR: https://github.com/ben-gy/nightwire/pull/1

## Errors & Resolutions
- **Test browser wouldn't go mobile.** `resize_window` couldn't drop Chrome's viewport below ~606px (`innerWidth` stayed 960, then 606), so a true 375px viewport screenshot wasn't achievable. Rather than claim it, I reproduced the phone layout exactly — constrained the page box to 375px and applied the same rules the `max-width: 420px` query holds — and verified geometrically: table 347px, seats 66×66 (above the 44px tap minimum), **zero seat overlaps even on the worst-case 10-seat table** (18px minimum gap), everything inside the ring, no horizontal overflow. Screenshotted and eyeballed. The only untested part is whether the media query itself fires, which is a pure function of viewport width.
- **Win-reason copy lied.** The four-peer test ended with "The wires ran out" at 2-of-3 wires cut — the Ghosts had actually won on *parity*. The game logic was right; the copy conflated the two Ghost win conditions. Fixed to distinguish blackout ("The last wire parted") from parity ("The Ghosts outnumber the Crew"), with the mid-table label reading BLACKOUT vs GHOSTS WIN.
- **Dawn flashed past in ~250ms**, so the player never saw the reading they'd spent the night getting. Added a 2.6s minimum dawn dwell.
- **Seats rendered as ellipses** (border-radius 50% on a non-square box). Fixed with `aspect-ratio: 1`.
- **In-app Browser pane blocked both localhost and the production domain by policy**; used Claude-in-Chrome throughout instead.
- Initial `ui.ts` had `setContext` unreachable after `return`, so `selfId` was never set — replaced with config-passed identity, and moved the Ghost's cut-lock into `PrivateView.cutTarget` where it belongs.
