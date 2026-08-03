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

> **BOARD-GAME INITIATIVE (priority — work through these first).** The 60 ideas below are our own
> take on popular multiplayer online board games (the kind that dominate Board Game Arena and
> similar), both **co-op** and **versus** — deliberately deeper and more replayable than a
> single-mechanic arcade toy. All are chosen to fit this factory's hard constraints (static site,
> **no backend**, P2P over WebRTC) and each names the **netcode shape** that makes it tractable:
> • **Perfect-information 2-player abstracts** (Santorini, Onitama, …) are the easiest and deepest
>   fit — deterministic, so run them **lockstep** (both peers step the same seeded state from
>   exchanged moves), ship a **minimax/MCTS bot** for instant solo play, and the art is procedural
>   geometry. These are the crown jewels; front-loaded here.
> • **Roll-/flip-and-write** (That's Pretty Clever, Qwixx, Cartographers, …) natively ARE the
>   factory's most-proven multiplayer shape — a **parallel same-seed race** for 2-6 where the host
>   deals the shared dice/cards from the seed and everyone marks their own sheet; nothing but a tiny
>   status crosses the wire. Solo is a score-attack against the same daily seed.
> • **Hidden-information card games and most co-ops** (The Crew, Hanabi, Jaipur, …) are
>   **host-authoritative** (the host owns the shuffled deck/hands and adjudicates), with a bot for
>   solo. **Real-time co-ops** (Magic Maze, Kites) are host-authoritative on a shared clock.
> Still non-negotiable for every one: **take the MECHANIC, never the identity** (original name,
> procedural/CC0 art, original copy — the source in parentheses is shorthand only, never shipped);
> **instantly playable solo first** (a competent bot, or a same-seed score-attack, is mandatory —
> a dead lobby is never a dead page); three modes with real spread; the balance/mechanism/contrast
> gates; every-mode phone+desktop verification; and the full P2P contract (host transfer, rematch,
> no-deadlock). A game whose depth needs a whole rulebook (Ark Nova, Terraforming Mars, full Catan)
> is **out of scope** — cut it down to its one legible core loop or pick another. Order is roughly
> best-fit-and-deepest first; the factory still applies the Step-2 criteria and may reorder.

- **Cosmoscrew** (The Crew-shaped) — CO-OP trick-taking in space: each mission assigns hidden "win
  this exact card / win it in this order" tasks and you must fulfil them together with almost no
  talking (one limited signal token); a 30-mission escalating campaign is the mode ladder. co-op 2-5,
  host-authoritative (hidden hands) + bots for solo; the fleet's first trick-taker.
- **Shunt** (Inglenook/Timesaver-shaped — the classic model-railway shunting puzzle, a mechanic in the
  public domain; original name, original yard layouts, no real railway's livery or branding) — a
  train yard seen from above: a locomotive, a headshunt and a handful of short sidings, and an order
  slip telling you which wagons to make up into a train and IN WHAT ORDER. The loco can only push and
  pull from one end, sidings hold only so many wagons, and every wagon you want is behind two you
  don't — so the whole game is the shunting itself, decoupling and re-coupling and running round,
  and a clean solve is a route you found rather than a wall you brute-forced. Score is MOVES (a
  direction change is the expensive one, which is what makes it feel like real yard work). Generate
  by working a solved yard BACKWARDS so every puzzle is guaranteed solvable and its optimal move
  count is known — meaning the results screen can say exactly how far off par everyone was. parallel
  same-seed race 2-6 (everyone shunts an identical yard, fewest moves wins) + a daily yard; solo is a
  par-chasing score attack. Modes = yard shape, not just size: a plain three-siding Inglenook, a
  run-round loop that lets you turn the loco, and a hump/kickback yard where one siding can only be
  entered by reversing into it.
- **Hedge & Sprint** (Quoridor-shaped) — race your pawn to the opposite edge while spending a limited
  supply of fences to lengthen the enemy's path (you may never fully wall them off). vs 2-4, lockstep
  + BFS/minimax bot; board size + fence budget = modes.
- **Swarm** (Hive-shaped) — no board: a growing cluster of tiles, each creature with its own movement
  (the ant runs the rim, the beetle climbs on top, the grasshopper leaps, the spider takes three),
  and you win by fully surrounding the enemy queen. vs 2, lockstep + bot; expansion bugs = modes.
  (Distinct from rootbound: two fixed armies, capture-by-surround, not colony growth.)
- **Kiln** (Azul-shaped) — draft all tiles of one colour from a factory display (the rest tumble to
  the centre), lay them in your staging rows, then score wall placements by adjacency; leftovers are
  penalties. vs 2-4, host seeds the bag, turn-based; wall-pattern variants = modes.
- **Sparklight** (Hanabi-shaped) — CO-OP: you can see everyone's cards but your own, and spend a
  shrinking pool of clue tokens to hint colour or number so teammates play the fireworks up 1→5 in
  each suit without a misfire. co-op 2-5, host-authoritative; solo drives all hands.
- **Bazaari** (Jaipur-shaped) — a two-player market duel: take goods or a camel herd, sell matched
  sets for bonuses that shrink as they're claimed, and race to two of three seals of excellence. vs 2,
  host-authoritative deck + bot.
- **Mapwright** (Cartographers-shaped) — each season, draw the revealed terrain shape anywhere on your
  map to satisfy that season's two scoring edicts; ambush cards force everyone to carve a monster in.
  parallel same-seed 2-6; edict decks = modes.
- **Huntress** (Amazons / Game of the Amazons-shaped) — each turn a queen slides any distance then
  fires an arrow that permanently blocks a square; the board keeps shrinking until a player can't
  move and loses. vs 2, lockstep + bot; board size = modes.
- **Junction** (Railroad Ink-shaped) — everyone draws the SAME four rolled route symbols onto their
  own grid, splicing roads and rails to connect the twelve board-edge exits into one sprawling
  network. parallel same-seed 2-6; special-die expansions = modes.
- **Lustre** (Splendor-shaped) — flip gem-mine cards into an engine of permanent discounts and race to
  a prestige threshold; nobles pay out for owning the right sets. vs 2-4, turn-based, tiny shared
  state, host seeds decks.
- **Courtier** (Love Letter-shaped) — a micro round of bluff and deduction: hold one card, draw one,
  play its power to knock rivals out or force reveals, and be the last standing or holding the highest
  card. vs 2-6, host-authoritative + bots.
- **Ringlord** (Yinsh / GIPF-shaped) — move one of your rings and it flips every marker it jumps;
  complete a five-in-a-row of your markers to remove a ring; claim three rings to win. vs 2, lockstep
  + bot.
- **Realmfold** (Kingdomino-shaped) — draft numbered dominoes in a turn order set by the tiles
  themselves (grab a strong tile, pick later next round), connecting matching terrain into a tidy 5×5
  kingdom with crown multipliers. vs 2-4, host shuffles; grid size = modes.
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

