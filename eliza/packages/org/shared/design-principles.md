# Design Principles

## ALF Design System

OnlyMen uses the ALF (Atomic Layout Framework) design system inherited from Bluesky. All UI must use ALF atoms and theme tokens.

### Core Concepts

- **Static atoms (`a.*`)** — Layout primitives: `a.flex_row`, `a.p_md`, `a.rounded_md`
- **Theme atoms (`t.atoms.*`)** — Dynamic colors: `t.atoms.bg`, `t.atoms.text`, `t.atoms.border`
- **Platform utilities** — `web()` and `native()` for platform-specific rendering

### Color System

- **Primary** — OnlyMen brand color (TBD during rebrand)
- **Semantic** — Success (green), warning (amber), error (red), info (blue)
- **Neutral** — Gray scale for backgrounds, borders, text
- **Theme-aware** — All colors via `t.atoms.*` for light/dark mode

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

- **Phone (< 768px)** — Single column, bottom navigation
- **Tablet (≥ 768px)** — Side-by-side panels, sidebar navigation
- Use `useBreakpoint()` hook for responsive decisions
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
