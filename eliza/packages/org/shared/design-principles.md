# Design Principles

## ALF Design System

OnlyMen uses ALF (Application Layout Framework), the design system inherited from Bluesky. All UI must use ALF atoms and theme tokens. The base tokens/atoms/themes live in the npm package `@bsky.app/alf`; the app extends them in `app/src/alf/` (`atoms.ts`, `tokens.ts`, `themes.ts`, `typography.tsx`, `breakpoints.ts`), imported as `#/alf`.

### Core Concepts

- **Static atoms (`import {atoms as a} from '#/alf'`)** — theme-independent primitives: `a.flex_row`, `a.p_md`, `a.rounded_md`, `a.text_lg`
- **Theme atoms / palette (`const t = useTheme()`)** — `t.atoms.bg`, `t.atoms.text`, `t.atoms.border_contrast_low`, `t.palette.primary_500`
- **Platform utilities** — `web()`, `native()`, `ios()`, `android()`, `platform()` from `#/alf` return conditional styles inline in a style array
- **Style arrays** — order atoms by flexbox, spacing, text, theme, then raw styles: `style={[a.flex_row, a.gap_md, a.p_lg, t.atoms.bg]}`

### Color System

- **Three themes** — `light`, `dark`, and `dim`, built by `createThemes()` from `@bsky.app/alf` with `DEFAULT_PALETTE` / `DEFAULT_SUBDUED_PALETTE` (`app/src/alf/themes.ts`)
- **Palette is deliberately still Bluesky's blue** (e.g. the `gradients.primary` blues in `app/src/alf/tokens.ts`) — the OnlyMen rebrand palette is TBD; do not invent brand colors or change palette values without an explicit decision
- **Semantic** — positive/negative palette ranges for success/error states
- **Theme-aware** — all colors via `t.atoms.*` / `t.palette.*`; never hardcode hex values in components

### Typography

- Use platform defaults (SF Pro on iOS, Roboto on Android)
- Dynamic Type support for accessibility
- No custom fonts unless absolutely necessary
- Hierarchy: H1 → H2 → H3 → Body → Caption → Overline

### Spacing

- 4px grid system: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64
- Consistent padding and margins via ALF atoms
- Responsive spacing for tablet layouts

### Motion

- Subtle animations for state transitions
- 200-300ms duration for most transitions
- Use `react-native-reanimated` for performance
- Respect "Reduce Motion" accessibility setting

### Responsive Layout

- Breakpoints from `useBreakpoints()` (`app/src/alf/breakpoints.ts`): `gtPhone` ≥ 500px, `gtMobile` ≥ 800px, `gtTablet` ≥ 1300px
- Shell-specific breakpoints via `useLayoutBreakpoints()` (right nav ≥ 1100px)
- Phone: single column, bottom navigation; wider: side panels, sidebar navigation
- Test all layouts on both phone and tablet

## Accessibility

### Requirements

- WCAG 2.1 AA compliance minimum
- All interactive elements must have accessibility labels
- Support VoiceOver (iOS) and TalkBack (Android)
- Support Dynamic Type / font scaling
- Support high contrast mode
- Keyboard navigation for web

### Guidelines

- Use semantic React Native components (`<TouchableOpacity>` not `<View>` with onClick)
- Provide `accessibilityLabel` and `accessibilityHint` for custom components
- Group related elements with `accessibilityRole` and `accessibilityState`
- Test with screen reader enabled regularly

## Component Design

### Single Responsibility
Each component does one thing well. Split complex components into composable pieces.

### Props Interface
```typescript
interface ComponentProps {
  // Required props first
  title: string
  onPress: () => void
  // Optional props grouped by purpose
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
}
```

### State Colocation
Keep state as close to where it's used as possible. Lift state only when multiple components need it.

### Error Boundaries
Wrap feature modules in error boundaries. Degrade gracefully with designed error states.
