# Spacing System

## Overview

> **Reality check (this codebase):** spacing is applied via ALF atoms
> (`a.p_md`, `a.px_lg`, `a.gap_sm`, sizes `2xs…2xl`) from `#/alf`; screen
> gutters via `useGutters()`. Exact pixel values live in the
> `@bsky.app/alf` package tokens — verify there after install rather than
> quoting the mapping below as authoritative.

The spacing system is built on a consistent 4px base grid. All spacing values are multiples of 4, creating visual rhythm and alignment across the interface. Spacing tokens are used for padding, margin, gaps, and layout dimensions.

---

## 4px Grid

Every spacing value in the system is a multiple of 4px. This ensures consistent alignment and proportion across all components.

```
4  → xs
8  → sm
12 → md
16 → lg
24 → xl
32 → 2xl
48 → 3xl
64 → 4xl (web only)
96 → 5xl (web only)
```

### Why 4px?

- Divisible by 2 — supports half-step values (2px, 6px, 10px)
- Small enough for fine control, large enough for meaningful steps
- Aligns with common icon sizes (16, 20, 24, 32)
- Matches baseline grid for typography alignment
- Works well on both standard and Retina displays

---

## Spacing Tokens

| Token      | Value | Usage                                          |
|------------|-------|-------------------------------------------------|
| `xxs`      | 2px   | Tight micro-spacing, icon gaps                   |
| `xs`       | 4px   | Minimal gaps, inline element spacing             |
| `sm`       | 8px   | Small gaps, compact component padding            |
| `md`       | 12px  | Default padding, form field gaps                 |
| `lg`       | 16px  | Standard padding, card content, list gaps        |
| `xl`       | 24px  | Section padding, screen margins                  |
| `2xl`      | 32px  | Large section padding, screen-level spacing      |
| `3xl`      | 48px  | Major section separators, hero spacing           |
| `4xl`      | 64px  | Page-level spacing (web/tablet)                  |
| `5xl`      | 96px  | Hero section spacing (web only)                  |

### Token Access

```ts
import { a } from '@alf/core';

a.space.xxs;  // 2
a.space.xs;   // 4
a.space.sm;   // 8
a.space.md;   // 12
a.space.lg;   // 16
a.space.xl;   // 24
a.space['2xl']; // 32
a.space['3xl']; // 48
a.space['4xl']; // 64
a.space['5xl']; // 96
```

---

## Padding Patterns

### Screen-Level Padding

```ts
import { responsive } from '@alf/core';

const screenPadding = responsive({
  phone: {
    paddingHorizontal: a.space.lg,  // 16px
  },
  tablet: {
    paddingHorizontal: a.space['2xl'], // 32px
    maxWidth: 768,
    alignSelf: 'center',
  },
});
```

### Card Padding

```ts
const cardPadding = responsive({
  phone: {
    padding: a.space.md,  // 12px
  },
  tablet: {
    padding: a.space.lg,  // 16px
  },
});
```

### Component Internal Padding

```ts
// Button
const buttonPadding = {
  sm: {
    paddingVertical: a.space.xs,    // 4px
    paddingHorizontal: a.space.sm,  // 8px
  },
  md: {
    paddingVertical: a.space.sm,    // 8px
    paddingHorizontal: a.space.md,  // 12px
  },
  lg: {
    paddingVertical: a.space.md,    // 12px
    paddingHorizontal: a.space.lg,  // 16px
  },
};

// Input
const inputPadding = {
  paddingVertical: a.space.sm,    // 8px
  paddingHorizontal: a.space.md,  // 12px
};

// ListItem
const listItemPadding = {
  paddingVertical: a.space.md,    // 12px
  paddingHorizontal: a.space.lg,  // 16px
};
```

---

## Margin Patterns

### Vertical Rhythm

Maintain consistent vertical spacing between elements:

```ts
const verticalRhythm = {
  section: {
    marginBottom: a.space['2xl'],  // 32px between sections
  },
  group: {
    marginBottom: a.space.lg,      // 16px between groups
  },
  item: {
    marginBottom: a.space.sm,      // 8px between items
  },
  compact: {
    marginBottom: a.space.xs,      // 4px between tight items
  },
};
```

### Screen Margins

```ts
const screenMargins = responsive({
  phone: {
    margin: a.space.lg,  // 16px
  },
  tablet: {
    margin: a.space.xl,  // 24px
  },
});
```

### Auto Margins

```ts
// Centering horizontally
const centered = {
  alignSelf: 'center',
  maxWidth: 480,
  marginHorizontal: 'auto', // web
};

// Push to bottom
const pushBottom = {
  marginTop: 'auto', // flex layout
};
```

---

## Gap Spacing

Gaps define spacing between flex/grid children without affecting outer margins.

### Flex Gaps

```ts
// Vertical stack
const stack = {
  flexDirection: 'column',
  gap: a.space.sm,  // 8px between children
};

// Horizontal row
const row = {
  flexDirection: 'row',
  gap: a.space.md,  // 12px between children
};

// Wrap layout
const wrapRow = {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: a.space.sm,  // 8px grid gap
};
```

### Gap Token Usage

| Context               | Gap Token  | Value |
|-----------------------|------------|-------|
| Icon + text inline    | `xs`       | 4px   |
| Button group          | `sm`       | 8px   |
| Form field stack      | `md`       | 12px  |
| Card grid             | `lg`       | 16px  |
| Section stack         | `xl`       | 24px  |
| Major sections        | `2xl`      | 32px  |

### Grid Gaps

```ts
const grid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: a.space.lg, // 16px between grid cells
};

const gridTablet = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: a.space.xl, // 24px between grid cells
};
```

---

## Responsive Spacing

Spacing scales with screen size using the `responsive()` utility.

### Pattern: Mobile-First Spacing

```ts
import { responsive } from '@alf/core';

const styles = responsive({
  phone: {
    padding: a.space.md,         // 12px
    gap: a.space.sm,             // 8px
  },
  tablet: {
    padding: a.space.xl,         // 24px
    gap: a.space.lg,             // 16px
  },
});
```

### Pattern: Adaptive Container

```ts
const adaptiveContainer = responsive({
  phone: {
    paddingHorizontal: a.space.lg,   // 16px
    paddingVertical: a.space.md,      // 12px
  },
  tablet: {
    paddingHorizontal: a.space['3xl'], // 48px
    paddingVertical: a.space.xl,       // 24px
    maxWidth: 768,
    alignSelf: 'center',
  },
});
```

---

## Layout Grids

### 4-Column Grid (Phone)

```ts
const phoneGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: a.space.md, // 12px
  paddingHorizontal: a.space.lg, // 16px screen margin
};

// Column spans
const col2 = { gridColumn: 'span 2' };
const col3 = { gridColumn: 'span 3' };
const col4 = { gridColumn: 'span 4' }; // full width
```

### 8-Column Grid (Tablet)

```ts
const tabletGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(8, 1fr)',
  gap: a.space.lg, // 16px
  paddingHorizontal: a.space.xl, // 24px screen margin
  maxWidth: 1024,
  alignSelf: 'center',
};

// Common tablet layouts
const halfWidth = { gridColumn: 'span 4' };
const thirdWidth = { gridColumn: 'span 2' }; // approximate
const twoThirds = { gridColumn: 'span 5' };
const full = { gridColumn: 'span 8' };
```

### Native Flex Grid

```tsx
// React Native doesn't have CSS Grid — use Flexbox
function Grid({ columns = 4, gap = 'md', children }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: a.space[gap],
        paddingHorizontal: a.space.lg,
      }}
    >
      {Children.map(children, (child) => (
        <View style={{ width: `${100 / columns}%` }}>
          {child}
        </View>
      ))}
    </View>
  );
}
```

---

## Spacing Scale Reference

### Visual Grid

```
2px  ▏
4px  ▎  xs
8px  ▍  sm
12px ▌  md
16px ▋  lg
24px ▊  xl
32px ▉  2xl
48px █  3xl
64px █  4xl
96px █  5xl
```

### Spacing Combinations

```ts
// Common spacing patterns
const patterns = {
  // Tight: icon + label
  tight: a.space.xs,  // 4px

  // Compact: form fields
  compact: a.space.sm,  // 8px

  // Default: component gaps
  default: a.space.md,  // 12px

  // Comfortable: card padding
  comfortable: a.space.lg,  // 16px

  // Relaxed: section padding
  relaxed: a.space.xl,  // 24px

  // Spacious: major sections
  spacious: a.space['2xl'],  // 32px
};
```

---

## Best Practices

1. **Always use spacing tokens** — never hardcode pixel values
2. **Maintain vertical rhythm** — consistent vertical spacing between similar elements
3. **Use the 4px grid** — all values should be multiples of 4
4. **Responsive scaling** — use `responsive()` to adjust spacing for tablet
5. **Gap over margin** — prefer `gap` for consistent spacing between siblings
6. **Padding > Margin** — prefer padding for component internal spacing
7. **Don't over-space** — more whitespace isn't always better; maintain visual density
8. **Test at multiple sizes** — spacing should work on small phones and tablets
9. **Align to baseline** — when possible, align spacing to typography baseline grid
10. **Consistent component spacing** — define spacing patterns per component type and reuse them
