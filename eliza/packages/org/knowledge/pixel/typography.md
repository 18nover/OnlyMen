# Typography System

## Overview

> **Reality check (this codebase):** text renders through
> `#/components/Typography` (`Text`, `H1`, `H2`, `P`; `Text` defaults to
> `[a.text_sm, a.leading_snug, t.atoms.text]`) with size atoms
> `a.text_xs…text_xl`. Line heights ≤ 2 are treated as relative multiples
> (`app/src/alf/typography.tsx`); the user font-scale setting is ±6.25%
> per step and the font family is Inter (`'theme'`) or system
> (`app/src/alf/fonts.ts`). The pixel tables below are generic
> methodology — verify exact scale values in `@bsky.app/alf` after
> install.

The typography system provides a consistent, scalable type scale across all platforms. It supports Dynamic Type (iOS) and font scaling (Android), uses platform-appropriate fonts, and enforces clear visual hierarchy through size, weight, color, and spacing.

---

## Type Scale

The type scale defines standard font sizes, line heights, and letter spacing for each text role.

| Role      | Size   | Line Height | Letter Spacing | Weight   | Usage                          |
|-----------|--------|-------------|----------------|----------|--------------------------------|
| `h1`      | 32px   | 40px        | -0.02em        | Bold     | Page titles                    |
| `h2`      | 24px   | 32px        | -0.01em        | Bold     | Section headings               |
| `h3`      | 20px   | 28px        | -0.005em       | Semibold | Subsection headings            |
| `h4`      | 18px   | 26px        | 0              | Semibold | Card titles, list headers      |
| `h5`      | 16px   | 24px        | 0              | Medium   | Group labels, small headings   |
| `h6`      | 14px   | 20px        | 0.01em         | Medium   | Eyebrow labels, overlines      |
| `body`    | 16px   | 24px        | 0              | Regular  | Default body text              |
| `bodySm`  | 14px   | 20px        | 0.005em        | Regular  | Secondary body text            |
| `caption` | 12px   | 16px        | 0.01em         | Regular  | Captions, helper text          |
| `overline`| 12px   | 16px        | 0.05em         | Medium   | Category labels, eyebrow text |
| `button`  | 14px   | 20px        | 0.02em         | Semibold | Button labels                  |
| `label`   | 14px   | 20px        | 0.01em         | Medium   | Form labels                    |
| `code`    | 14px   | 20px        | 0              | Regular  | Inline code, code blocks       |

---

## Font Weights

| Token        | Weight | CSS Equivalent | Platform        |
|--------------|--------|----------------|-----------------|
| `thin`       | 100    | 100            | Not all fonts   |
| `extralight` | 200    | 200            | Not all fonts   |
| `light`      | 300    | 300            | Variable fonts  |
| `regular`    | 400    | 400            | All fonts       |
| `medium`     | 500    | 500            | All fonts       |
| `semibold`   | 600    | 600            | All fonts       |
| `bold`       | 700    | 700            | All fonts       |
| `extrabold`  | 800    | 800            | Variable fonts  |
| `black`      | 900    | 900            | Variable fonts  |

### Font Weight Tokens

```ts
import { t } from '@alf/core';

const weight = t.font.weight.regular;   // 400
const weight = t.font.weight.medium;    // 500
const weight = t.font.weight.semibold;  // 600
const weight = t.font.weight.bold;      // 700
```

---

## Line Heights

Line height (leading) is critical for readability. The system uses a ratio-based approach:

| Role      | Line Height | Ratio  | Computed (16px base) |
|-----------|-------------|--------|----------------------|
| Tight     | 1.25        | 125%   | 20px                 |
| Snug      | 1.375       | 137.5% | 22px                 |
| Normal    | 1.5         | 150%   | 24px                 |
| Relaxed   | 1.625       | 162.5% | 26px                 |
| Loose     | 1.75        | 175%   | 28px                 |

### Line Height Tokens

```ts
import { t } from '@alf/core';

t.font.lineHeight.tight;   // 1.25
t.font.lineHeight.snug;    // 1.375
t.font.lineHeight.normal;  // 1.5
t.font.lineHeight.relaxed; // 1.625
t.font.lineHeight.loose;   // 1.75
```

---

## Letter Spacing

Letter spacing (tracking) affects readability at different sizes:

| Token      | Value   | Usage                                |
|------------|---------|--------------------------------------|
| `tighter`  | -0.05em | Large headings (H1, H2)              |
| `tight`    | -0.02em | Subheadings                          |
| `normal`   | 0       | Body text                            |
| `wide`     | 0.02em  | Buttons, labels, captions            |
| `wider`    | 0.05em  | Overlines, eyebrow text              |
| `widest`   | 0.1em   | Small caps, ALL CAPS labels          |

```ts
import { t } from '@alf/core';

t.font.letterSpacing.tighter; // -0.05em
t.font.letterSpacing.normal;  // 0
t.font.letterSpacing.wider;   // 0.05em
```

---

## Dynamic Type Support

Dynamic Type allows users to adjust text size system-wide for accessibility.

### iOS (UIFontMetrics)

```ts
import { DynamicType } from '@alf/core';

// iOS uses UIFontMetrics to scale text
const scaledSize = DynamicType.scale(16, {
  minimum: 11,  // Smallest accessible size
  maximum: 32,  // Largest allowed size
});
```

### Android (FontScale)

```ts
import { useFontScale } from '@alf/core';

function MyComponent() {
  const fontScale = useFontScale(); // 0.85, 1.0, 1.15, 1.3, etc.

  // fontScale is clamped to prevent extreme sizes
  const adjustedSize = Math.min(16 * fontScale, 24);

  return <Text style={{ fontSize: adjustedSize }}>Hello</Text>;
}
```

### Expo Configuration

```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "UIAppFonts": ["Inter-Regular", "Inter-Medium", "Inter-SemiBold", "Inter-Bold"]
      }
    },
    "android": {
      "adaptiveIcon": {},
      "fonts": [
        {
          "fontFamily": "Inter",
          "fonts": [
            { "asset": "fonts/Inter-Regular.ttf", "weight": "400" },
            { "asset": "fonts/Inter-Medium.ttf", "weight": "500" },
            { "asset": "fonts/Inter-SemiBold.ttf", "weight": "600" },
            { "asset": "fonts/Inter-Bold.ttf", "weight": "700" }
          ]
        }
      ]
    }
  }
}
```

### Clamping

Always clamp scaled sizes to prevent unreadable or absurdly large text:

```ts
const clampedSize = (base: number, scale: number) => {
  const scaled = base * scale;
  return Math.max(10, Math.min(scaled, base * 1.5));
};
```

---

## Platform Fonts

### Default Font Stack

| Platform | Primary Font    | Fallback Stack                                    |
|----------|-----------------|---------------------------------------------------|
| iOS      | Inter           | SF Pro, Helvetica Neue, Helvetica, Arial          |
| Android  | Inter           | Roboto, Noto Sans, Helvetica Neue, Arial          |
| Web      | Inter           | system-ui, -apple-system, Segoe UI, Roboto, sans-serif |

### Font Configuration

```ts
// theme.fonts.ts
export const fonts = {
  sans: {
    ios: 'Inter',
    android: 'Inter',
    web: 'Inter, system-ui, -apple-system, sans-serif',
  },
  serif: {
    ios: 'Georgia',
    android: 'Noto Serif',
    web: 'Georgia, Cambria, serif',
  },
  mono: {
    ios: 'JetBrains Mono',
    android: 'JetBrains Mono',
    web: '"JetBrains Mono", "Fira Code", monospace',
  },
};
```

### Loading Custom Fonts

```ts
import * as Font from 'expo-font';

async function loadFonts() {
  await Font.loadAsync({
    'Inter-Regular': require('../fonts/Inter-Regular.ttf'),
    'Inter-Medium': require('../fonts/Inter-Medium.ttf'),
    'Inter-SemiBold': require('../fonts/Inter-SemiBold.ttf'),
    'Inter-Bold': require('../fonts/Inter-Bold.ttf'),
    'JetBrainsMono-Regular': require('../fonts/JetBrainsMono-Regular.ttf'),
  });
}
```

---

## Text Component

The base `Text` component applies typography tokens automatically:

```tsx
import { Text } from '@alf/core';

// Semantic variants
<Text variant="h1">Page Title</Text>
<Text variant="h2">Section Heading</Text>
<Text variant="body">Body text content</Text>
<Text variant="caption">Helper text</Text>
<Text variant="overline">CATEGORY</Text>

// Inline weight override
<Text variant="body" weight="bold">Bold body</Text>

// Color override
<Text variant="body" color="muted">Secondary text</Text>

// Line clamping
<Text variant="body" numberOfLines={2}>
  This text will be truncated after two lines with an ellipsis
</Text>

// Accessibility
<Text
  variant="h1"
  accessibilityRole="header"
  accessibilityLevel={1}
>
  Page Title
</Text>
```

---

## Text Styles

### Predefined Text Styles

```ts
import { textStyles } from '@alf/core';

textStyles.heading1;      // H1 preset
textStyles.heading2;      // H2 preset
textStyles.body;          // Body preset
textStyles.bodySmall;     // Small body preset
textStyles.caption;       // Caption preset
textStyles.overline;      // Overline preset
textStyles.button;        // Button text preset
textStyles.label;         // Form label preset
textStyles.code;          // Code text preset
```

### Custom Text Composition

```ts
import { merge, textStyles } from '@alf/core';

const heroTitle = merge(
  textStyles.heading1,
  {
    color: t.colors.foreground,
    letterSpacing: t.font.letterSpacing.tighter,
  },
);
```

---

## Responsive Typography

Text sizes adapt to screen size and breakpoint:

```ts
import { responsive, useBreakpoint } from '@alf/core';

const headingStyle = responsive({
  phone: {
    fontSize: 24,     // h2 on phone
    lineHeight: 32,
  },
  tablet: {
    fontSize: 32,     // h1 on tablet
    lineHeight: 40,
  },
});
```

### Fluid Typography (Web)

```css
/* On web, use clamp() for fluid scaling */
h1 { font-size: clamp(1.5rem, 4vw, 2rem); }
h2 { font-size: clamp(1.25rem, 3vw, 1.5rem); }
h3 { font-size: clamp(1.125rem, 2.5vw, 1.25rem); }
```

---

## Typography Best Practices

1. **Maximum 3 font sizes per screen** — reuse the type scale consistently
2. **Visual hierarchy**: H1 → H2 → H3 → Body → Caption, never skip levels
3. **Line length**: Keep body text between 50–75 characters per line for readability
4. **Contrast**: Use semantic color tokens — never raw colors for text
5. **Dynamic Type**: Always test at accessibility text sizes (200% on iOS)
6. **Minimum text size**: Never go below 12px / 10sp for readable text
7. **Font weight hierarchy**: Use weight differences sparingly — don't bold everything
8. **Letter spacing**: Negative for headings, positive for overlines and ALL CAPS
9. **Platform fonts**: Use `fontFamily` with platform fallbacks — never rely on a single font
10. **Accessibility**: Add `accessibilityRole="header"` to heading elements
