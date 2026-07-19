# Icon System

Icons live in `app/src/components/icons/` — one file per glyph, generated
from a strict template. Everything renders through `react-native-svg` on a
24×24 viewBox and inherits color from the style array (so theme atoms work).

## Naming convention

`{Name}_Stroke{width}_Corner{radius}_Rounded` — e.g.
`IconTemplate_Stroke2_Corner0_Rounded`. The suffix encodes the visual
variant (stroke weight, corner radius, rounded caps), so multiple variants
of one glyph can coexist and designers/engineers can tell them apart from
the import alone. Keep the convention exactly when adding icons.

## Implementation (`TEMPLATE.tsx`)

- Icons are `forwardRef` components over `Svg`/`Path`, taking common props
  via `useCommonSVGProps` (`#/components/icons/common`): `fill`, `size`
  (t-shirt sizes), `style`, plus a11y props.
- Factories build them from path data:
  - `createSinglePathSVG({path, viewBox?, strokeWidth?, strokeLinecap?,
    strokeLinejoin?})`
  - `createMultiPathSVG({paths, ...})`
- Each icon exposes `svgPaths`, `svgViewBox`, `svgStrokeWidth` metadata on
  the component (`IconWithSvgMeta`) so tooling can re-render glyphs outside
  React (e.g. for exports).

## Adding an icon

1. Get the 24×24 path data (from the design source; upstream icons trace to
   Bluesky's icon set in Figma).
2. Copy the pattern in `TEMPLATE.tsx`; name per the convention; use the
   factory rather than hand-rolling the component.
3. Fill color comes from the common props — never hardcode a hex; icons
   must work in light/dark/dim via `t.atoms.*` styling at the call site.
4. Add an accessibility label at the usage site (icons themselves are
   decorative by default).

## OnlyMen note

The icon set is upstream Bluesky's. Brand-specific glyphs (logo, wordmark)
are part of the deferred rebrand — the same rule as colors applies: don't
invent brand assets without the rebrand decision.
