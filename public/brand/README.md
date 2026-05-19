# Awesome AI Cheatsheets — Brand Assets

## Concept

A stack of three cards with a folded corner on the front card: the metaphor for
a cheatsheet is layered, ready-to-grab knowledge — flip a card, scan the lines,
move on. The fold (coral) is the "open and use it now" cue. Warm amber on deep
ink reads like highlighter on a notebook page — distinctive enough to avoid the
sea of generic dev-tool blues, and warm enough to feel human rather than
corporate.

## Variants

| File | Use case |
|------|----------|
| `mark.svg` | The symbol alone (256x256). Social avatars, OG corner badges. |
| `full.svg` | Mark + wordmark, horizontal lockup. Site header, README banner. |
| `wordmark.svg` | Text-only lockup. Footers, byline strips. |
| `icon.svg` | 32x32 simplified mark. App icons, dock tiles. |
| `favicon.svg` | 32x32 minimal mark. Browser tab; wired into the Astro head. |
| `white.svg` | Full lockup in white. Dark backgrounds, photo overlays. |
| `black.svg` | Full lockup in black. Print, embossing, single-color use. |

## Color tokens

| Token | Hex | Role |
|-------|-----|------|
| Ink | `#1B1F3A` | Text on light, card shadow, content lines |
| Amber | `#F2B705` | Primary brand color — the front card |
| Coral | `#FF6B5C` | Accent — the folded corner |
| Paper | `#FAF7F2` | Optional warm background |

## Showcase

Open `public/brand/showcase.html` (or `/brand/showcase.html` once the site is
served) for a side-by-side view of every variant on light and dark backgrounds,
with usage notes.

## Favicon wiring

`favicon.svg` is referenced from both Astro layouts
(`src/layouts/Layout.astro` and `src/layouts/CheatsheetLayout.astro`) via
`<link rel="icon" type="image/svg+xml" href="/awesome-cheatsheets/brand/favicon.svg" />`,
honoring the site's base path.
