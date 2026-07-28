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

