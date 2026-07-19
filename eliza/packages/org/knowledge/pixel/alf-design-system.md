# ALF — Application Layout Framework

ALF is the design system inherited from Bluesky. The base tokens, atoms, and
theme factory live in the npm package **`@bsky.app/alf`** (`^0.1.14` in
`app/package.json`); the app extends and re-exports them from
**`app/src/alf/`**, imported everywhere as **`#/alf`**. There is no
`@alf/core` package — any doc or answer referencing one is wrong.

## The import surface (from `app/src/alf/index.tsx`)

```tsx
import {atoms as a, useTheme, useBreakpoints, tokens, web, native} from '#/alf'

const t = useTheme()
<View style={[a.flex_row, a.gap_md, a.p_lg, t.atoms.bg]} />
```

- `atoms` (aliased `a`) — static, theme-independent styles.
- `useTheme()` (aliased `t`) — the active theme: `t.atoms.*` (theme-aware
  styles) and `t.palette.*` (color values, e.g. `t.palette.primary_500`).
- `useAlf()` — full context: `themeName`, `themes`, font scale/family
  setters.
- `useBreakpoints()` / `useLayoutBreakpoints()` — see Responsive below.
- Platform utils: `web()`, `native()`, `ios()`, `android()`, `platform()`
  return conditional styles inline in a style array.
- Style arrays are ordered: flexbox → spacing → text → theme atoms → raw
  styles.

## Atoms

Base atoms come from `@bsky.app/alf` (`atoms as baseAtoms`); the app layer
(`app/src/alf/atoms.ts`) spreads and extends them with verified additions:

- `util_screen_outer`, `h_full_vh` — screen-outer sizing (web `100dvh`).
- `bg_transparent`, `aspect_square`, `aspect_card`.
- Web transitions: `transition_none/all/color/opacity/transform` +
  `transition_delay_50ms` (100ms, `cubic-bezier(0.17, 0.73, 0.14, 1)`).
- Web animations: `fade_in/out`, `zoom_in/out`, `slide_in_left/out_left`,
  `zoom_fade_in` (exponential curve `cubic-bezier(0.16, 1, 0.3, 1)`).
- `sr_only` — visually hidden, screen-reader accessible (web).
- `scrollbar_offset` — compensates the web scrollbar in the layout shell.

Naming conventions (Tailwind-ish with underscores): spacing t-shirt sizes
`2xs, xs, sm, md, lg, xl, 2xl` (`a.p_md`, `a.px_lg`, `a.gap_sm`); text
`a.text_xs…text_xl`; flex `a.flex_row`, `a.flex_1`, `a.align_center`,
`a.justify_between`; borders `a.border`, `a.border_t`, `a.rounded_md`,
`a.rounded_full`; weight `a.font_bold`.

## Themes and color (`app/src/alf/themes.ts`, `tokens.ts`)

- Three themes: **`light`, `dark`, `dim`**, built by `createThemes({
  defaultPalette: DEFAULT_PALETTE, subduedPalette: DEFAULT_SUBDUED_PALETTE
  })` from `@bsky.app/alf`. Direct `lightPalette`/`darkPalette` exports are
  deprecated — access palette via `useTheme()`.
- Local `tokens.ts` re-exports `@bsky.app/alf` tokens and adds `gradients`
  (`primary` is the Bluesky blue ramp `#054CFF → #1085FE → #59B9FF`, plus
  `sky`, `midnight`, `sunrise`, `sunset`, `summer`, `nordic`, `bonfire`)
  and two temp labeler colors.
- **The palette is deliberately still Bluesky's.** The OnlyMen brand
  palette is an open decision — do not invent hex values or change palette
  tokens without an explicit rebrand decision (docs/HANDOFF.md).
- Base token *values* (spacing/radius scales) live inside the
  `@bsky.app/alf` npm package, not in this repo — verify exact numbers
  from `node_modules/@bsky.app/alf` after install, not from memory.
- Color utilities: `contrastRatio`, `lighten`, `darken`, `rgbToHex` in
  `app/src/alf/util/colorGeneration.ts` (exported on `utils`).

## Typography (`typography.tsx`, `fonts.ts`)

- Components come from `#/components/Typography` (`Text`, `H1`, `H2`, `P`);
  `Text` defaults to `[a.text_sm, a.leading_snug, t.atoms.text]`. Pass
  `emoji` on any `Text` that may contain user-generated strings.
- `normalizeTextStyles` treats `lineHeight <= 2` as a **relative** multiple
  of fontSize (default 1) and multiplies fontSize by the user's font scale.
- Font scale is a user setting stored on device: steps `-1, 0, +1` with a
  6.25% multiplier per step (`fonts.ts`). Font family setting is
  `'theme'` (Inter, weight-mapped on Android) or `'system'` (web stack:
  system-ui/Segoe/Roboto…).
- Design implication: never hardcode absolute line heights; respect the
  scale multiplier in any custom text component.

## Responsive (`breakpoints.ts`)

- `useBreakpoints()` → `{gtPhone, gtMobile, gtTablet, activeBreakpoint}`:
  `gtPhone` ≥ 500px, `gtMobile` ≥ 800px, `gtTablet` ≥ 1300px
  (react-responsive media queries).
- `useLayoutBreakpoints()` → shell-layout flags: `rightNavVisible` ≥
  1100px, `centerColumnOffset` 1100–1300px, `leftNavMinimal` ≤ 1300px.
- Gutters via `useGutters()` (`app/src/alf/util/useGutters.ts`).

## House rules

- All UI styles through atoms + theme atoms; no inline hex colors, no
  bespoke StyleSheets for things atoms cover.
- Reuse `#/components/` primitives (Button, Dialog, Menu, TextField,
  Typography) before creating new ones — see Nova's docs for their APIs.
- Dark/dim support is free if you use `t.atoms.*`; hardcoding colors
  breaks it.
- Accessibility is part of the system: `sr_only`, contrast utilities, font
  scaling — coordinate with Prism on audits.
