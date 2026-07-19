# patterns/ is deprecated — the engine moved

**The shared engine is now a versioned package: [`ben-gy/gh-game-engine`](https://github.com/ben-gy/gh-game-engine).**
Current pin: **v1.1.0**.

```jsonc
// package.json
"dependencies": { "@ben-gy/game-engine": "github:ben-gy/gh-game-engine#v1.1.0" }
```

```ts
import { createNet, roomAppId, setTurnConfig } from '@ben-gy/game-engine/net';
import { createRounds } from '@ben-gy/game-engine/rematch';
import { getTurnConfig } from '@ben-gy/game-engine/turn';
```

Games **depend and extend**. They never copy engine source in, and never edit
files under `node_modules`. Game-specific behaviour goes in game code, through
the engine's config, hooks and channels. If the engine cannot express something
you need, write the gap into [`EXPANSION_IDEAS.md`](../EXPANSION_IDEAS.md) under
"Engine", write the cleanest game-side wrapper you can, and move on.

## Why copy-and-adapt was retired

Every game held its own copy of `net.ts`, `rematch.ts` and friends. In practice
the copies were near-identical — the drift was almost entirely reworded comments
and version skew, not deliberate adaptation. What that bought us was 18 places
for the same netcode bug to live, and no way to fix any of them at once.

Three failures were shipping in the field: peers never appearing in rooms (no
TURN, so STUN-only ICE could not connect a phone on carrier CGNAT), a joiner
stealing host from a live incumbent (a 2.5s self-election plus a min-id
tie-break), and players "ejected" when a round started (the host froze the roster
from a half-formed mesh, and Trystero only delivers to channels that are already
open). Fixing those in 18 copies was the argument for the package, and one
engine release now fixes the whole fleet.

## What is still here

`feedback.ts` only — it is a **generated** file distributed from `gh-feedback`
(`scripts/distribute.mjs`), not engine source. Do not edit it here.

Everything else was deleted, not moved: the files live in
`ben-gy/gh-game-engine/src/`, and their full history is in this repo's git log
(`git log --follow -- patterns/net.ts`). **Do not restore them, and do not copy
from an old checkout** — a resurrected copy is exactly how a game would miss the
next engine fix.

## Docs

- Engine README — the netcode model as implemented (epoch incumbency, NOT
  "smallest peer id"), module table, and the wiring recipe.
- Engine `MOBILE_CONTROLS.md` — the cited numeric spec for the floating
  joystick, card drag/swipe thresholds, and thumb ergonomics. Its §6 checklist is
  still the non-negotiable bar.
- Engine `CHANGELOG.md` — what each tag changed and which failure it closes.
