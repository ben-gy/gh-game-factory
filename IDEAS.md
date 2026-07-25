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

- Face-to-face bluffing game in the shape of **Cockroach Poker** (Jacques Zeimet) — take the mechanic, not the identity (see the note above: original name, original creature/critter art, original flavour, no reference to the source). **The signature act, and the whole reason it is multiplayer: you slide a face-down card to another player and DECLARE what it is ("this is a spider") — and the declaration is free to be a lie.** The receiver must resolve it three ways, which is the entire game: call **"true"** or **"bluff"**, or — the twist that makes it social rather than a coin-flip — PEEK at the card and pass it on to a third player with a claim of their own (truthful or not). Whoever guesses wrong when a card is finally challenged takes it face-up in front of them; **you LOSE the moment you collect four of any one creature type** (an alternative loss: you must pass but have no legal target left). So the pressure is read-the-person, not read-the-board: the same card can travel the whole table, and the danger is targeted — everyone piles claims on the player already sitting on three spiders. Suited to this factory but genuinely hidden-information, so netcode is **host-authoritative** (the host holds the deck and each card's true identity; only the host learns a peek, and it gossips just the public trail — who passed to whom, the spoken claim, and the final challenge outcome — never the hidden face until reveal); the whole board is a handful of face-up "menagerie" rows plus the one card in flight, which renders cleanly on a phone. Needs 3+ players to work (with two it collapses to a straight lie-detector), so gate the lobby at 3 and make **solo-vs-bots** carry the single-player mode — which means the bot needs a real bluffing model (a tunable lie frequency, a memory of who has been caught, and a tell it sometimes leaks) or the game is dead solo. **Balance flags for the sim (principle #18):** (a) seat fairness — the player to the passer's left / the start-seat should not eat disproportionately many cards; (b) that no single creature type is statistically a death sentence (deck composition even across types); (c) that "always call bluff" or "always peek-and-pass" is not a dominant script — if one rote strategy wins, the bluff is fake, so measure win-rate spread across bot policies. Content warning to design around: the theme is unpleasant-critters-you-dodge; keep the art stylised and charming (cute-grotesque, not photoreal insects) so it reads as playful, and offer a friendlier reskin (mischievous woodland critters, say) as a mode.

