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

- Loudness escalation — one phone passed around a group in public: each player in turn must say the word slightly LOUDER than the last, the phone measures it with an AnalyserNode, and the first to bottle it (or to fail to beat the rising threshold) loses. Nothing is recorded, nothing is understood, nothing is uploaded — it is one number against a moving bar. Needs a keyboard/touch fallback (a nerve-holding bar you have to release at the right moment) for anyone without a mic or who denies permission. See principle #23.

- Unhurried travel game on a one-way road, in the shape of **Tokaido** (Antoine Bauza) — take the mechanic, not the identity (see the note above: original name, original procedural art, no reference to the source). **The signature rule, and the whole reason to build it: the traveller who is FURTHEST BEHIND takes the next turn.** You may advance as far along the road as you like, but every stop you skip past is a turn you hand your rivals — so the tension is entirely "how much do I give up to reach that one spot before someone else takes it", with no combat, no dice and no attacking anyone. Stops are single-occupancy, which is what makes a peaceful game genuinely competitive: taking the spring means nobody else can. Set collection supplies the scoring — a panorama built up in strict sequence over many visits (abandon it halfway and it is worth little), souvenirs that score in sets rather than singly, springs, meals, and a few "most of X" end bonuses so several routes to a win exist. Punctuate the road with mandatory gather points where every traveller regroups and the menu is limited and first-come, which resets the field and gives the game a rhythm of chapters. Deeply suited to this factory: turn-based with tiny state and zero hidden information, so the netcode is LOCKSTEP (peers exchange only "I advanced to stop N"); a linear track renders beautifully as a VERTICAL scroll on a phone; and solo-vs-bots works without modification. Three modes are easy and real: a short road, a long road with a richer stop mix, and a variant where the panoramas are shuffled so the optimal route changes per seed. **Balance flags for the sim (principle #18):** "furthest back moves next" is an unusually strong self-balancing catch-up device, so measure (a) whether rushing ahead is ever correct or is strictly dominated — if a greedy sprinter always loses, the road's whole decision is fake; (b) seat fairness given somebody must start at the front of the queue; (c) that the panorama sets do not create one dominant collection every seed. Art direction: flat layered colour planes and lots of negative space in the spirit of Edo-period woodblock landscape prints — composition only, generated procedurally, no images fetched or embedded.

