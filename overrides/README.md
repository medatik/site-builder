# Client overrides

Most customization happens through a site's **config** (`/configs/<slug>.config.ts`) —
colours, fonts, style preset, which sections appear, their order, and all copy.

Reach for an **override** only when one site needs a section whose _structure/markup_
differs from the shared component in a way props cannot express. VoltEdge's hero is the
one example in this repository.

## How it works

1. Create the bespoke component under the site's slug:

   ```
   /overrides/voltedge-electric/Hero.tsx
   ```

   It receives the same props as the section it replaces (see `HeroProps` in
   `/lib/types.ts`), so no config changes.

2. Register it in [`active.ts`](./active.ts) — **not** `registry.ts`:

   ```ts
   import type { OverrideMap } from "./registry";
   import { VoltEdgeHero } from "./voltedge-electric/Hero";

   export const overrides: OverrideMap = {
     "voltedge-electric": { hero: VoltEdgeHero },
   };
   ```

3. `/components/SectionRenderer.tsx` checks the override map first and falls back to the
   shared default automatically.

## Why two files

| File | Contents |
| --- | --- |
| `registry.ts` | engine plumbing — the `OverrideMap` type and `getOverride()` |
| `active.ts` | the registrations themselves |

Keeping registrations out of the plumbing means the lookup mechanism can change without
anyone having to re-declare which components are overridden, and the list of bespoke work
on a project stays readable in one short file.

## Why a registry instead of file-path resolution

Explicit registration is type-safe and behaves identically in development and production
builds. Resolving `overrides/<slug>/<Section>.tsx` dynamically at runtime would need a
dynamic `import()` with a computed path, which bundlers cannot analyse statically — so a
missing override would surface as a runtime error in production rather than a type error
at compile time.
