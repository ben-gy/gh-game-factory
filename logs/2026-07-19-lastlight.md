# Build Log: Lastlight
**Date:** 2026-07-19
**Status:** deployed

## Idea Source
IDEAS.md, first entry (removed from the queue this run). Quoted in part:

> "Lastlight — a bite-sized frozen-frontier city-builder tuned for one ~5–6 minute match: a lone Generator radiates a ring of warmth across a small hex map and you get a handful of short 'days' to grow a settlement outward before an ever-dropping cold snuffs it, so WHERE things go is the whole game… Multiplayer is a parallel same-seed race, never a shared board… the risk to gate is the DIFFICULTY CURVE, so a builder-bot sims hundreds of seeds to assert P(survive to day N) forms a smooth ramp… and that warmth-first, expand-first and explore-heavy strategies all clear at comparable rates so no single line dominates."

Every one of those gates was implemented, and the strategy-parity gate is the one that did the most work.

## Game Details
- **Name / repo:** Lastlight / ben-gy/lastlight
- **Genre:** strategy
- **Core loop:** Build inside the generator's warmth ring, stoke to hold or push it, gamble a worker on a scout, end the day; the night produces, feeds, freezes, and takes another bite of heat.
- **Multiplayer:** live P2P, 2–6, **parallel same-seed race** — each peer sims only its own settlement and broadcasts a status ping + a final result. The host owns seed, countdown and ladder, and nothing else. Plus async seed-share and a worldwide daily map.
- **Stack / render:** vanilla-ts / canvas map + DOM chrome
- **Engine modules used:** net, rematch, turn, lobby, rng, drag, sound, storage, mobile, feedback

## Juice
Warmth ring that breathes and snaps inward with a shockwave + shake when the cold bites; ember spray and a ring push on stoke; dust puff and floating `+N` yield numbers per hut at nightfall; drifting snow that visibly thins inside the ring; frost crystals creeping over any tile the warmth leaves; dashed scout threads out into the fog; procedural SFX on every action; 3-2-1-GO countdown with audio. All degrade under `prefers-reduced-motion`.

## Test Results
- Tests written / passed / failed: **157 / 157 / 0** (13 files)
- P2P-sync determinism: **pass** — same seed gives a byte-identical map across all three modes
- Balance sim + mechanism invariants: **pass** — 0 rule violations across all 9 mode × strategy cells

## What the sim overruled (the useful part)

**Longnight was a warmth-first monoculture: 78% / 37% / 42%.** My confident diagnosis — a flat cold makes a big ring free, so warmth-first can't lose — was mostly wrong. Adding a ring-size cost to the cold moved it only to 77/36/48.

Instrumenting *actual deaths* rather than reasoning found the real cause: resources were guaranteed within the starting **vision**, but Longnight can only build within radius **1**. The water that was supposed to feed you was on screen, known about, and untouchable, so runs starved on night 4 with no counterplay that had existed on night 1. Anchoring the guarantee to the opening **ring** gave **79/75/65** and removed the night-4 cliff. `ringCost` was kept anyway — it earns its place — but it is documented as a pacing lever, not the fix, so nobody re-derives the original story.

**Two "weak strategy" findings were bot incompetence, not game design.** Fixing the game instead would have been actively wrong: an expand-first bot with a fixed small ring built outward and then let its own huts freeze, and no bot ever hired idle survivors, which made exploration's headline payoff (survivors) a pure liability. Both fixed in `bot.ts`.

**Making the game harsher made the strongest line stronger** (expand 88 → 92%), because scarcer food punishes the line that gains population and leaves untouched the line that never does. Re-tuned against the corrected baseline.

Numbers were replicated across **three independent 200-run seed families**, each line varying only 2–6 points — so unlike an earlier game in this fleet, these are signal rather than ±8 noise. Final: Thaw 85/86/70, Frontier 83/87/72, Longnight 76/82/63.

**The audit had its own bug, and that is the point.** The first run reported 117–313 staffing violations — but only for strategies that scout. The defect was in the *audit*: a scout dispatched during today's day phase leaves the workforce before production runs, and the pre-night snapshot did not account for it. An audit that is assumed correct is worth nothing.

**Contrast measurement proved a design assumption impossible.** A fill-only "frozen" state cannot work: frozen forest measured **1.03:1** against lit forest (literally no change) while frozen snow managed 1.48:1, because no single tint shifts the darkest and lightest terrain by the same visible amount. A dead tile is therefore marked by a **frost overlay**, held to the same 3:1 mark floor — which is also colour-blind-safe in a way a hue shift would not have been.

## Build Status
- npm install / test / build / local play: **pass** each
- Multiplayer smoke: **not run live** (see Not Verified)
- **Every mode verified in-browser at ~375px (principle #20):** Thaw (r3, 9 nights, ring 2), Frontier (r4, 10 nights, ring 2) and Longnight (r4, 12 nights, ring 1) each load, play and end — zero horizontal overflow, canvas top-most at board centre, no stray `[hidden]` layer, tap targets ≥44px, footer hidden mid-round, zero console errors. Verified **locally and again on the live production URL**.
- Contrast pixel probe on the real canvas: generator **3.16:1**, gathering hut **5.89:1**, terrain pairs ~1.3:1 under the warm gradient.

## Errors & Resolutions
1. **Hexagon SDF dropped a term** in `gen-icons.mjs`, so the icon's ring never drew — caught by looking at the generated PNG rather than trusting it. Fixed by subtracting `r` from the y component before taking the length.
2. **The map rendered 188px tall in a 630px stage**, with a dead gap under it. A canvas carries an intrinsic aspect ratio from its backing store, and `height: 100%` against a flex-grown parent silently resolved to `auto`, so it adopted its 750×375 ratio. Fixed with `position: absolute; inset: 0`.
3. **Every mode button rendered in the browser's default grey** (#6b6b6b). `button(label, className)` *replaced* the default class rather than merging, so those buttons carried no `.btn` rule at all — and the contrast test stayed green throughout, because the palette was never what painted them. Fixed by making `btn` unconditional; pinned by `ui-chrome.test.ts` and mutation-verified.
4. **HUD menu button measured 42px**, under the 44px touch floor, from a `min-height: 0` override. Only visible in a real layout.
5. **`curl` could not resolve the production domain** from this machine while `dig` could: macOS had negatively cached the hostname from before the DNS record existed. Not a deploy fault — the browser resolves independently, which is what made the production pass possible. Worth remembering rather than re-diagnosing.
6. An early edit to `IDEAS.md` spliced two idea lines together instead of removing one; caught immediately and the file was rewritten from the known-good content.

## Not Verified
The two-peer P2P smoke test (typed-code join, in-sync standings, host-leave, rematch) was **not** run with two live browser contexts against each other. That contract is covered by automated tests instead — `takeover.test.ts` (9 tests, mutation-verified: disabling promotion turns it red), `host-election.test.ts`, `net-lifecycle.test.ts`, `rematch.test.ts`, `no-deadlock.test.ts`. Stated plainly in the PR and the registry rather than implied to be green.

Worth noting *why* this is a smaller risk here than in a typical fleet game: Lastlight's peers share no mutable state, so a host leaving cannot freeze anyone's settlement — the worst case is a results screen that needs a promoted peer to publish the ladder, which is exactly what the mutation-verified takeover test covers.

## Deployment
- Repo created: **ben-gy/lastlight**
- Pages enabled (Actions build), Cloudflare DNS added, custom domain set **once** and deliberately not cycled (per the emberwake lesson that cycling requeues TLS issuance) — cert went `authorization_pending` → `approved` in under two minutes.
- Deploy workflow: **success**
- PR: https://github.com/ben-gy/lastlight/pull/1
- Live: https://lastlight.benrichardson.dev
