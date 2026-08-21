# Game Ideas Queue

One idea per line, starting with `-`. The factory takes the **first** idea each run, removes it, and builds it. Add your own ideas here anytime — they take priority over researched/invented ones.

Format: `- Name or concept — one line of what it is and (if multiplayer) how peers interact.`

> **Motorsport ideas: no real-world series, team, driver, sponsor or circuit names.** "F1" and
> "Formula One" are registered trademarks of Formula One Licensing BV, as are the team and circuit
> names. Generic open-wheel racing with original naming and liveries only — the mechanics are free,
> the branding is not.

> **Ideas "like <published game>": take the MECHANIC, never the identity.** Game mechanics are not
> copyrightable and reimplementing one is completely legitimate. The title, the box art, the character
> names, the illustrations, the sprites, the level designs, the card text and the component design all
> are protected. So: original name, original procedural art, original flavour text, and no visual
> quotation of the product. Naming the source game in this file is fine — it is shorthand for the
> mechanic — but the shipped game must never reference it, and the registry/README must describe the
> mechanic on its own terms rather than as "a clone of X".

> **BIG-GAME INITIATIVE (priority — work through these first). THE BOARD-GAME INITIATIVE IS OVER.**
> Player verdict on the catalogue as it stands: the games are *too basic* and *too abstract* — a long
> shelf of card and board games, all roughly the same size. The new bar is **a game somebody would
> have bought on a PC, rebuilt for a phone browser**: the named references are DOOM, SimTower and
> Frozen Synapse. The entries below are that, and each one names the **netcode shape** that makes it
> possible with no backend:
> • **Simultaneous-turn and turn-based** (tactics, strategy, async raiding) are the BEST P2P shapes
>   this factory has — orders are a few bytes and latency is free. Reach for them first when a genre
>   could go either way.
> • **Host-authoritative with client prediction** at 15–30Hz is the shape for real-time action. Keep
>   the authoritative state small. If it cannot be made to feel good, change the GAME (round-based
>   arenas, simultaneous turns, asymmetric roles) rather than shipping a laggy shooter.
> • **Solo-deep with async sharing** (a seed, a ghost, a replay, a raid snapshot) is a first-class
>   answer for sims and roguelikes. A sim does not need live multiplayer to be a great entry.
> Non-negotiable for every one: **ambition is spent on SYSTEMS, not surface** — a genre label with one
> room and three enemies underneath is the failure mode, and depth means systems that interact to
> produce situations nobody enumerated, never more menus or more screens. Plus every standing gate:
> **the mandatory interactive tutorial**, three modes with real spread, the balance / mechanism /
> contrast sims, every-mode phone+desktop verification, a **measured frame budget** for anything
> real-time, and the full P2P contract. Take the MECHANIC, never the identity.

- **Nightshift** (systemic stealth) — one building, guards with vision cones and hearing, distractions,
  and an alarm state that escalates rather than instantly failing you. Every system readable at a
  glance on a grid. Solo; async "beat my route" ghosts, or an asymmetric 2P mode where one player is
  the building's security.
- **Grist** (automation/factory-shaped) — place extractors, belts and assemblers; the game is the
  bottleneck you did not see coming. Systems-dense, entirely solo-viable, and a natural fit for a
  phone because it is placement rather than reflexes. Async factory-snapshot sharing; a throughput par
  per seed. The balance gate is the production curve.
- **Overpressure** (crew co-op, FTL/Barotrauma-shaped) — 2-4 players keep one failing vessel alive:
  power routing, hull breaches, fires, and a reactor that will not tolerate everyone doing the obvious
  thing at once. Host-authoritative on a shared clock; roles that see different information, so
  talking is the game. Solo plays as a single operator with the same failures.
- **Apex Line** (racing, handling-first) — grip, weight transfer and a racing line worth learning, on
  procedural circuits from a seed. Not a runner: braking points are the skill. One-thumb steering that
  respects principle #19. Ghost-replay versus over a link (async), live 2-4 host-authoritative if the
  feel survives it.
- **Salvage Run** (roguelike, combining items) — the point is not more items, it is items whose
  interactions produce builds nobody wrote down: a magnet plus a shock coil is a different game from
  either. Turn-based on a grid so it is exact and phone-friendly. Solo + daily seed; async run
  comparison. The mechanism audit belongs on the item-interaction rules.
- **Siegeworks** (base-vs-base, async) — build a compound, then raid a snapshot of somebody else's;
  they replay your attack later and rebuild. Entirely asynchronous, so no live connection is ever
  needed and a shared link is the whole multiplayer story. The design risk is the attack/defence
  balance curve — simulate it before shipping it.
- **Fault Line** (physics sandbox with a goal) — destructible structures, soft joints, and a par:
  bring the tower down with the least charge. Deterministic fixed-step physics from a seed so a
  solution is a shareable replay. Solo + async; the fun is the emergent collapse, so the sim gate is
  "do different seeds actually collapse differently?".
- **Cinder** (twin-stick survivor) — one stick, auto-fire, and a build that assembles itself out of
  interacting upgrades over fifteen minutes. Real-time and dense, so the frame budget is a hard gate
  and the entity cap is a design constraint. Solo-first; host-authoritative 2P co-op with prediction.
- **Signal Lost** (immersive-sim-ish) — one station, several ways through every obstacle (power, vents,
  credentials, force), and systems that do not care which one you pick. Small in area, deep in
  interaction — the opposite of a big empty map. Solo; async route sharing.

## PARKED — board-game initiative

These are the remaining entries from the previous initiative, kept verbatim so nothing is lost. **Do
not take one while the big-game queue above has anything in it**, and if the queue ever empties and
you take one anyway, say why in the build log. Most would now be better as an *expansion* to a shipped
game than as a new one.

- **Expedition** (Lost Cities-shaped) — a two-player push-your-luck of commitment: lay cards in
  ascending value onto expedition columns you can never take back, and every expedition you open owes
  a −20 you must climb out of. vs 2, host deck + bot.
- **Shove** (Abalone-shaped) — push connected lines of your marbles into the opponent's, and force six
  of theirs off the rim to win; you can only shove a shorter line than your own. vs 2, lockstep + bot.
- **Heist Clock** (Magic Maze-shaped) — REAL-TIME silent CO-OP: nobody owns a pawn — each player may
  only ever slide ALL the shared pawns in ONE compass direction (or use one special) — so you grab the
  loot and escape before the sand runs out, communicating only by a nudge token. co-op 2-4,
  host-authoritative real-time.
- **Frontlines** (Battle Line / Schotten-Totten-shaped) — a two-player line duel: build three-card
  poker-like formations at nine flags and claim a run of adjacent flags (or a lone breakthrough) to
  win; tactic cards bend the rules. vs 2, host deck + bot.
- **Meeplemarch** (Carcassonne-shaped) — draw and place a landscape tile each turn, optionally
  garrisoning a follower to score completed roads, cities, cloisters and end-game fields. vs 2-5, host
  tile bag; expansion tiles = modes.
- **Locksix** (Qwixx-shaped) — everyone uses the shared dice: cross numbers strictly left-to-right in
  four coloured rows (two ascend, two descend), skipped numbers are lost forever, and four penalties
  ends the round. parallel same-seed 2-6.
- **Roadstones** (Tak-shaped) — build a road of flat stones bridging two opposite edges; standing
  walls block a road, capstones flatten walls, and stacks are carried and dropped along a line. vs 2,
  lockstep + bot; board size = modes.
- **Bluffcourt** (Coup-shaped) — a bluff-and-challenge elimination duel of hidden roles: claim ANY
  role's action whether you hold it or not and dare the table to call you; a failed bluff (or a bad
  challenge) costs an influence, two costs the game. vs 2-6, host-authoritative + bots.
- **Passing Plates** (Sushi Go-shaped) — simultaneous card drafting: keep one card, pass the rest, and
  collect sets across rounds (tempura pairs, sashimi triples, a wasabi that multiplies the next nigiri,
  puddings scored at the very end). vs 2-5, host deals.
- **Wildreach** (Cascadia-shaped) — draft a paired habitat tile + wildlife token, grow contiguous
  terrain corridors and place animals to match each species' secret scoring pattern; open, calm,
  solo-lovely. vs 1-4, host bag; scoring-card sets = modes.
- **Terrace** (Welcome To…-shaped) — flip three number+action combos each turn; write a house number
  in strictly ascending order onto one of three streets and take that combo's bonus (pools, parks,
  estates, permits). parallel same-seed 2-6.
- **Quartz** (Pentago-shaped) — place a marble, then twist any one of the four board quadrants a
  quarter-turn; the first to line up five-in-a-row *after* the twist wins. vs 2, lockstep + bot.
- **Tidewreck** (Forbidden Island/Desert-shaped) — CO-OP: the island's tiles flood and sink each turn;
  the team shores up ground, shares cards to capture four relics, and helicopters off the last safe
  tile before it goes under. co-op 2-4, host seeds; fully solo-playable.
- **Three Fronts** (Air, Land & Sea-shaped) — a tiny two-player card war: play cards face-up or
  face-down into three theatres for majorities, or fold a battle early to bank a portion; first to the
  point line over several skirmishes wins. vs 2, host deck + bot.
- **Cornerfit** (Blokus-shaped) — place polyomino pieces that may touch your own colour only at their
  corners; when nobody can fit another piece, most squares placed wins. vs 2-4, lockstep + bot.
- **Floe** (Hey, That's My Fish!-shaped) — penguins hop across a melting hex floe eating fish, and the
  tile you leave is removed — so you fence rivals onto shrinking islands while banking the richest
  path. vs 2-4, lockstep + bot.
- **Herd Off** (6 Nimmt! / Take 5-shaped) — everyone reveals a card at once and slots it into one of
  four ascending rows; whoever plays the sixth card in a row scoops up that row's penalty cattle.
  vs 2-10, host-authoritative simultaneous reveal + bots.
- **Thicket** (The Fox in the Forest-shaped) — a two-player trick-taking duel where the odd-numbered
  cards each bend a rule (swap the lead, become trump, force a draw); win tricks — but win too many
  and you're greedy and score nothing. vs 2, host deck + bot.
- **The Ascent** (The Game / "The Game: quick & easy"-shaped) — CO-OP: play cards onto four piles (two
  climbing, two descending), you may talk but never name a number, and the team tries to empty the
  whole deck using the exact-ten "back-step" reset. co-op 1-5, host seeds. (Distinct from deepwatch:
  four piles, table-talk, the back-ten trick — not silent single-line ascending.)
- **Bustline** (Can't Stop-shaped) — press-your-luck dice: split each roll to advance up to three
  number columns, but bank before you bust and lose the run's climb; claim three columns to win. vs
  2-4, host rolls (or parallel same-seed); solo score-attack.
- **Chromastep** (Kamisado-shaped) — the square your opponent just landed on dictates which colour of
  your pieces you must move next, chaining the whole game together; drive a piece to the far row to
  score. vs 2, lockstep + bot.
- **Rosewindow** (Sagrada-shaped) — draft coloured dice from a shared pool and set them into your
  stained-glass window under strict colour/shade adjacency rules and secret objective cards — a
  luminous placement puzzle. parallel-ish 2-4, host rolls the pool; window patterns = modes.
- **Voidfleet** (Star Realms / Hero Realms-shaped) — a two-player deckbuilder brawl: buy ships and
  bases from a shared trade row into your deck and grind the opponent's authority from 50 to 0, chaining
  faction combos. vs 2, host trade row + bot.
- **Latticework** (Calico / Reef-shaped) — place patterned tiles onto your own grid to complete
  colour/shape adjacency goals and lure scoring tokens; a cosy pattern-optimisation race. parallel
  same-seed or drafted, 2-4; goal sets = modes.
- **Onegroup** (Lines of Action-shaped) — a piece moves exactly as many squares along a line as there
  are pieces (yours and theirs) on that line; the first to gather ALL their pieces into one connected
  group wins. vs 2, lockstep + bot.
- **Cairnbid** (Skull-shaped) — bluff bidding: everyone secretly stacks a "flower" or a "skull", then
  players bid how many of their own-then-others' discs they can flip face-up without hitting a skull;
  pull off two successful bids to win. vs 3-6, host-authoritative + bots.
- **Trailtile** (Tsuro-shaped) — lay a path tile ahead of your marker and ride the drawn line wherever
  it leads; the last marker still on the board (as everyone's paths braid and collide) wins. vs 2-8,
  host tile deck + bots.
- **Backdraft** (Flash Point: Fire Rescue-shaped) — CO-OP grid firefighting: spend action points to
  move, chop walls and haul victims out while the fire advances and flashes over each turn; save
  enough souls before the building collapses. co-op 2-6, host seeds; solo playable.
- **Teahouse** (Hanamikoji-shaped) — a two-player game of tension: across four rounds allocate your
  seven action cards (play two, discard two, hide one, offer a choice) to sway seven guests, then win
  the majority of favour in enough of them. vs 2, host deck + bot.
- **Millwright** (Nine Men's Morris-shaped) — place then slide pieces to form mills (three in a line);
  each new mill lets you pluck an enemy piece; grind the opponent below three men. vs 2, lockstep +
  bot; Three/Six/Twelve Men's variants = modes.
- **Same Tile** (Take It Easy!-shaped) — a caller announces a hex tile and EVERYONE places that same
  tile onto their own board; only fully-completed colour lines score, so every placement is a shared
  gamble. parallel same-seed 2-6 (the purest form of the shape).
- **Contagion** (Pandemic-lite-shaped) — CO-OP: four diseases spread across a route map; the team
  shares distinct roles and a shared action budget to treat, research and cure all four before the
  outbreak chain runs away. co-op 2-4, host-authoritative; solo drives the roles. Cut to one legible
  loop, not the full campaign.
- **Flank** (Reversi / Othello-shaped) — placing a disc so it brackets a line of enemy discs flips
  them all to your colour; hold the majority when the grid fills. vs 2, lockstep + bot; board size +
  an "anti"/scoring twist = modes.
- **Ridgeline** (Trek 12 / "Trek 12: Amazon"-shaped) — combine two rolled dice (add, subtract or take
  the higher) and write the value onto an adjacent node of your mountain map, chaining ascending runs
  and same-number clusters for points. parallel same-seed 2-6.
- **Capstack** (Dvonn / GIPF-shaped) — stack your pieces onto neighbours; at any moment a stack not
  connected (through the chain) to a red anchor piece is swept off the board — own the tallest
  survivors. vs 2, lockstep + bot.
- **Duelpolis** (7 Wonders Duel-shaped) — a two-player draft of a face-up/face-down pyramid of era
  cards; race one of three win paths — a military track that pushes toward the enemy capital, a set of
  science symbols, or plain civic points. vs 2, host layout + bot.
- **Dig Site** (Karuba-shaped) — a caller names a tile coordinate and everyone places the SAME tile to
  carve jungle paths, racing their four explorers to the temples for gold and gems. parallel same-seed
  2-6.
- **Quiltwork** (Patchwork-shaped) — a two-player polyomino economy on a shared time track: buy and
  stitch fabric patches, trading buttons (income) against time spent, and be the tidiest 9×9 quilt
  when the track ends. vs 2, host market ring + bot.
- **Sandglass** (Kites-shaped) — REAL-TIME CO-OP: keep a fistful of coloured sand-timers all flipping
  before ANY of them empties, as cards force new timers into the juggle — a frantic shared clock.
  co-op 2-6, host-authoritative real-time.
- **No Thanks** (No Thanks!-shaped) — push-your-luck avoidance: each face-up card is a penalty you can
  pay a chip to dodge or take (with its accrued chips); lowest score wins, and a run of consecutive
  cards only counts its lowest — so the "bad" card you take can be a bargain. vs 3-7, host deck + bots.
- **Roadtrip** (On Tour-shaped) — flip/roll two numbers and write them into your route grid to build
  the single longest legal increasing road across the map, sharing the same numbers as everyone else.
  parallel same-seed 2-6.
- **Codebreak** (Turing Machine-shaped) — pure logical deduction: query a bank of criteria machines to
  narrow down the one secret three-digit code nobody is told, racing to prove it with the fewest
  questions. vs/solo 1-4, host holds the solution; a daily puzzle mode.
- **Kingsflight** (Hnefatafl / Tafl-shaped) — an ASYMMETRIC siege: the king's small guard tries to
  break out to a corner while a larger surrounding army boxes him in; the two sides play by different
  rules. vs 2, lockstep + bot; board sizes = modes.
- **Sightline** (Tumbleweed-shaped) — a line-of-sight territory game: you may place a stack on a hex
  only if that many of your OTHER stacks can "see" it (unobstructed lines), and higher stacks defend;
  own the most board at the end. vs 2, lockstep + bot.

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
