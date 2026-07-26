# Game Ideas Queue

One idea per line, starting with `-`. The factory takes the **first** idea each run, removes it, and builds it. Add your own ideas here anytime — they take priority over researched/invented ones.

Format: `- Name or concept — one line of what it is and (if multiplayer) how peers interact.`

> **Motorsport ideas: no real-world series, team, driver, sponsor or circuit names.** "F1" and
> "Formula One" are registered trademarks of Formula One Licensing BV, as are the team and circuit
> names. Generic open-wheel racing with original naming and liveries only — the mechanics are free,
> the branding is not.

> **Ideas "like <published board game>": take the MECHANIC, never the identity.** Game mechanics are
> not copyrightable and reimplementing one is completely legitimate. The title, the box art, the
> character names, the illustrations, the card text and the component design all are protected. So:
> original name, original procedural art, original flavour text, and no visual quotation of the
> physical product. Naming the source game in this file is fine — it is shorthand for the mechanic —
> but the shipped game must never reference it, and the registry/README must describe the mechanic on
> its own terms rather than as "a clone of X".

> **GEOGRAPHY GAMES — the data MUST be self-contained (this is the make-or-break).** Principle #7 is
> absolute: no CDN assets, no third-party map tiles, no Street View, no Maps/geocoding API, no runtime
> fetch of map data. So a geography game NEVER embeds Google/Mapbox/Leaflet tiles or a Street View
> pano — those are external, keyed, often paid, and break the offline/no-tracking promise. Instead
> BUNDLE public-domain data at build time and render from it:
> • **Natural Earth** (public domain, CC0-equivalent) — country + admin-1 borders as vector polygons
>   (ship TopoJSON at 1:110m ≈ ~100KB gzip; render the world map yourself on canvas/SVG, no tiles).
> • **Factual country data** (facts are not copyrightable) — capitals, borders/adjacency graph, area,
>   population, continent, currency, ISO codes, calling codes, lat/lon of capitals & major cities.
> • **Flags** — national flags are free to depict; use a **CC0 flag set** or render the simple ones
>   procedurally (attribute the set in THIRD-PARTY-NOTICES if it carries a licence).
> • **Photos (for a GeoGuessr-like)** — curate a set of **CC0 / public-domain** geotagged landmark
>   photos (Wikimedia Commons PD/CC0 only), optimise to WebP (~30KB each), bundle with per-photo
>   attribution in an About/credits panel. NEVER hotlink, never scrape non-free images.
> A committed generator script (`scripts/gen-geodata.mjs`) that fetches the public-domain sources once
> and emits the bundled `.json`/`.topojson` is the right pattern (like the word-game dictionary gen).
> Rendering a world map from vectors also makes distance/adjacency scoring trivial and deterministic,
> which is exactly what the balance sim and P2P determinism want.

- **GeoChess** — a faithful REBUILD of https://geochess.org (a turn-based "geography strategy game"),
  crediting the original author (site © 2026 GeoChess; contact `creative.spider.hand@gmail.com` — link
  the site and the author prominently in the About panel and README as the inspiration/original).
  **IMPORTANT — the exact mechanic still needs pinning down before building:** the live site gates its
  rules behind sign-up/an SPA, so the precise turn-by-turn rules could not be read (observed only:
  Play-vs-AI with Easy/Medium/Hard, Play-with-Friends via a 6-digit room key, a Random-Match queue,
  and a chess-on-a-world-map theme). At build time, FIRST determine the real rules — from the site's
  own "How to play", its GitHub if public, or the user — then reimplement the MECHANIC (mechanics are
  not copyrightable) with **original code, original procedural art, and no copied assets/text**. Two
  IP notes to honour: (a) reusing the exact name "GeoChess" and its branding is the author's identity,
  so prefer an original name that CREDITS geochess.org as the inspiration (a verbatim-name rebuild
  should only ship with the author's permission — flag this in the PR); (b) do not copy the site's
  imagery or copy. Whatever the mechanic turns out to be, it fits this factory only if it is
  self-contained (bundled Natural Earth borders + country adjacency, per the geo-data note above),
  turn-based/low-state so the netcode is P2P (host-authoritative if there is hidden info, lockstep if
  not — mirror the site's vs-AI difficulty tiers with a bot, and its friend-room + random-match with
  the engine lobby + noticeboard/presence for drop-in public play), mobile-first, and instantly
  playable solo. **Best-guess fallback if the mechanic can't be confirmed:** a turn-based territory /
  conquest game on the world map where the border-adjacency graph IS the board — claim countries to
  grow one connected empire, with a chess-like movement or capture rule and a clear win condition —
  but DO NOT ship a guessed mechanic without confirming it first; a wrong rebuild is not a rebuild.
  Three modes with real spread and a mandatory balance sim (seat fairness on the turn order, no
  dominant opening, no snowball — principle #18) as for any competitive game.
- **Photo-drop location guesser** (the "like GeoGuessr" ask — the classic mechanic, reworked to be
  fully self-contained since Street View is impossible here). You are shown a **bundled CC0/public-
  domain landmark photo**; you drop a pin on a **vector world map rendered from Natural Earth** (pan +
  pinch-zoom, tap to place, tap Guess); you score by great-circle distance to the true spot on a
  smooth curve (≈ `5000·exp(-d_km/2000)`), and the reveal animates a line from your pin to the answer.
  A round is 5 photos; a running score and a best-distance streak. **Self-contained** per the geo-data
  note: ~150 curated PD/CC0 photos (WebP, attributed in About), the world map drawn from bundled
  vectors — no tiles, no API. **Single-player first** (a fresh random set, plus a **UTC daily** five
  everyone gets, and async seed-share to challenge a friend on the identical five). **Live P2P versus
  2–6** as a **parallel same-seed** race: every peer gets the same photos from the frozen seed, guesses
  independently under a per-photo timer, and the host gossips only each peer's pin + distance; the
  round reveal shows **everyone's pin on the map and everyone's distance** (principle #9), so there is
  nothing to desync and host transfer is a display concern. Controls are tap-to-place + drag/pinch the
  map (no D-pad); the map must be legible and the pin tappable at 375px. Modes (principle #14): World
  (anywhere), a **region lock** (e.g. one continent — a different photo pool + tighter scoring), and a
  **no-zoom "snap" blitz** (short timer, coarse scoring — read the photo fast). Balance/quality flags:
  the scoring curve must reward genuine knowledge without being all-or-nothing; the photo pool must be
  globally spread (not 60% Europe) or it rewards guessing the same continent every time — measure the
  answer-location distribution and cap per-country; and every photo needs a verifiable PD/CC0 source
  recorded in the generator.
- **Mystery-country proximity guesser** (in the shape of a Worldle/Globle-style daily deduction game
  — take the mechanic, original name/art). Each round hides one **mystery country**; you name a
  country as a guess and it turns into a clue: the great-circle **distance** to the mystery country, a
  **compass-arrow direction** toward it, and a **proximity %** (100% = solved), with the mystery
  country's **silhouette** shown from the start in one mode. Solve in as few guesses as possible. Pure
  factual + Natural Earth outlines, fully bundled — no photos, tiny payload. **Single-player first**
  with a **UTC daily** everyone shares (spoiler-free emoji-grid result to copy, like the Wordle share)
  and endless random rounds; **async seed-share**; and **live P2P race 2–6** — every peer works the
  same mystery country from the frozen seed and the host gossips only guess-count/solved, so first-to-
  solve (or fewest guesses when the timer ends) wins, the results screen showing **everyone's guess
  count and the answer** (principle #9). Three modes with spread: Silhouette (outline shown — a shape
  puzzle), Blind (no outline, distance+direction only — a pure geography-mental-map puzzle), and a
  hard **Territories** variant including dependencies/small states. Controls: type-to-search a country
  with an autocomplete list, tap to guess; works one-handed at 375px. Quality flags: the distance/
  direction maths must be exact and deterministic (unit-tested — it is the whole game and the P2P
  sync); the answer set must be curated so obscure micro-states are opt-in (the word-game "curated
  list" lesson applied to countries); and a daily must be identical for every player worldwide (seed
  from the UTC date only).
- **Border-hop routing puzzle** (in the shape of a Travle-style connection game — take the mechanic,
  original name/art). Given a **start** country and a **destination** country, build a chain of
  countries where each is a **land-border neighbour** of the last, from start to destination — and try
  to do it in as **few countries as possible** (the game knows the true shortest path via BFS on the
  bundled adjacency graph and scores you against it: perfect / +1 / +2…). Wrong hops (not actually
  bordering, or a dead-end that can't reach the destination) cost a life. It is a pure graph puzzle on
  the **world border-adjacency graph** — trivially bundled, tiny, and deterministic, so it is a
  perfect factory fit. A vector map highlights your growing chain so it reads spatially. **Single-
  player first**: a **UTC daily** pair everyone gets (with the spoiler-free "solved in N, best M"
  share), endless random pairs with a difficulty knob (continents apart = longer minimum path), and an
  **endless "border chain" mode** (name any country bordering the last, don't repeat, how long a chain
  before you're stuck — a solitaire streak). **Live P2P race 2–6**, parallel same-seed: everyone gets
  the same start/destination and races to connect it, host gossips path-length/solved, results show
  **everyone's route and the optimal one** (principle #9, "what everyone missed"). Controls: type-to-
  search + tap to add a country; undo the last hop; one-handed at 375px. Quality flags: the adjacency
  data must be correct (unit-test known borders and known NON-borders — the "curated data" lesson),
  island nations with no land borders must be handled (excluded as endpoints, or given a "ferry"
  rule), and every generated pair must be provably solvable (BFS reachable) before it is served.
- **Geography higher-or-lower** (the endlessly-addictive "which is bigger?" format applied to country
  stats — an original take, no source to credit). Two countries are shown; you pick which has the
  greater **population** (or area / GDP-per-capita / coastline / highest peak, one stat per mode);
  right, and one card slides away and a new challenger slides in — how long a **streak** can you keep?
  Pure factual public-domain stats + flags/outlines, tiny bundle, snackable in the first 3 seconds.
  **Single-player first**: endless streak with a persisted best (`storage.ts`), and a **UTC daily
  gauntlet** (the same 15-pair sequence for everyone, one life, share your score). **Live P2P versus
  2–6**, parallel same-seed: everyone plays the **identical sequence** from the frozen seed
  simultaneously; you're out when you miss; last standing (or highest streak when a timer ends) wins,
  results show **everyone's streak** (principle #9). Three modes = three stats with genuinely different
  feel (Population — intuition-heavy; Area — often counter-intuitive vs population; a "Mixed" gauntlet
  that switches stat each round and tells you which). Controls: two big tap targets (left/right or
  higher/lower), swipe optional; trivially one-handed at 375px. Quality flags: the stat data must be
  sourced from a public-domain dataset and dated in the About (stats drift); pairs must avoid
  near-ties that are effectively coin-flips (enforce a minimum ratio between the two values so a
  "correct" answer is knowable); and the daily sequence must be identical worldwide (UTC-date seed).

- Face-to-face bluffing game in the shape of **Cockroach Poker** (Jacques Zeimet) — take the mechanic, not the identity (see the note above: original name, original creature/critter art, original flavour, no reference to the source). **The signature act, and the whole reason it is multiplayer: you slide a face-down card to another player and DECLARE what it is ("this is a spider") — and the declaration is free to be a lie.** The receiver must resolve it three ways, which is the entire game: call **"true"** or **"bluff"**, or — the twist that makes it social rather than a coin-flip — PEEK at the card and pass it on to a third player with a claim of their own (truthful or not). Whoever guesses wrong when a card is finally challenged takes it face-up in front of them; **you LOSE the moment you collect four of any one creature type** (an alternative loss: you must pass but have no legal target left). So the pressure is read-the-person, not read-the-board: the same card can travel the whole table, and the danger is targeted — everyone piles claims on the player already sitting on three spiders. Suited to this factory but genuinely hidden-information, so netcode is **host-authoritative** (the host holds the deck and each card's true identity; only the host learns a peek, and it gossips just the public trail — who passed to whom, the spoken claim, and the final challenge outcome — never the hidden face until reveal); the whole board is a handful of face-up "menagerie" rows plus the one card in flight, which renders cleanly on a phone. Needs 3+ players to work (with two it collapses to a straight lie-detector), so gate the lobby at 3 and make **solo-vs-bots** carry the single-player mode — which means the bot needs a real bluffing model (a tunable lie frequency, a memory of who has been caught, and a tell it sometimes leaks) or the game is dead solo. **Balance flags for the sim (principle #18):** (a) seat fairness — the player to the passer's left / the start-seat should not eat disproportionately many cards; (b) that no single creature type is statistically a death sentence (deck composition even across types); (c) that "always call bluff" or "always peek-and-pass" is not a dominant script — if one rote strategy wins, the bluff is fake, so measure win-rate spread across bot policies. Content warning to design around: the theme is unpleasant-critters-you-dodge; keep the art stylised and charming (cute-grotesque, not photoreal insects) so it reads as playful, and offer a friendlier reskin (mischievous woodland critters, say) as a mode.

