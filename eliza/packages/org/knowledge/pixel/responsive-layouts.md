# Responsive Layouts

## Overview

> **Reality check (this codebase):** the real breakpoints come from
> `useBreakpoints()` in `app/src/alf/breakpoints.ts` — `gtPhone` ≥ 500px,
> `gtMobile` ≥ 800px, `gtTablet` ≥ 1300px — plus `useLayoutBreakpoints()`
> for the web shell (right nav ≥ 1100px). There is no 768px breakpoint and
> no `@alf/core` package; the material below is generic responsive-design
> methodology.

Responsive layouts adapt to screen size and orientation using breakpoints, layout patterns, and adaptive components.

---

## Breakpoints

| Breakpoint | Width Range  | Target Device                      |
|------------|--------------|-------------------------------------|
| `phone`    | < 768px      | iPhone SE → iPhone 15 Pro Max       |
| `tablet`   | >= 768px     | iPad Mini → iPad Pro 12.9"          |

### Breakpoint Tokens

```ts
import { breakpoints } from '@alf/core';

breakpoints.phone;  // 0
breakpoints.tablet; // 768
```

### Orientation Considerations

| Orientation | Phone Behavior     | Tablet Behavior       |
|-------------|--------------------|-----------------------|
| Portrait    | Single column      | 1-2 column layout     |
| Landscape   | Consider tablet    | 2-3 column layout     |

> Note: Phone landscape is treated as `phone` unless the device reports tablet-class width.

---

## Layout Patterns

### Stack Layout

Single-column vertical stacking. The default layout for phone.

```tsx
import { Stack, useBreakpoint } from '@alf/core';

function StackLayout() {
  const breakpoint = useBreakpoint();

  return (
    <Stack
      direction="vertical"
      gap={breakpoint === 'tablet' ? 'xl' : 'lg'}
    >
      <Header />
      <Content />
      <Footer />
    </Stack>
  );
}
```

```ts
const stackLayout = responsive({
  phone: {
    flexDirection: 'column',
    gap: a.space.lg,
    paddingHorizontal: a.space.lg,
  },
  tablet: {
    flexDirection: 'column',
    gap: a.space.xl,
    paddingHorizontal: a.space['3xl'],
    maxWidth: 768,
    alignSelf: 'center',
  },
});
```

### Split Layout

Two side-by-side panels. Used for master-detail patterns on tablet.

```tsx
function SplitLayout() {
  const breakpoint = useBreakpoint();

  if (breakpoint === 'tablet') {
    return (
      <View style={splitStyles.container}>
        <View style={splitStyles.master}>
          <ListPanel />
        </View>
        <View style={splitStyles.detail}>
          <DetailPanel />
        </View>
      </View>
    );
  }

  // Phone: navigate between panels
  return <StackLayout />;
}
```

```ts
const splitStyles = {
  container: {
    flexDirection: 'row',
    flex: 1,
  },
  master: {
    width: 320,
    borderRightWidth: 1,
    borderRightColor: t.colors.border,
    backgroundColor: t.colors.card,
  },
  detail: {
    flex: 1,
    backgroundColor: t.colors.background,
  },
};
```

### Sidebar Layout

Persistent navigation sidebar on tablet, bottom tab bar on phone.

```tsx
function SidebarLayout() {
  const breakpoint = useBreakpoint();

  if (breakpoint === 'tablet') {
    return (
      <View style={{ flexDirection: 'row', flex: 1 }}>
        <Sidebar navigation={navigation} />
        <View style={{ flex: 1, padding: a.space.xl }}>
          <Stack.Screen />
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen />
      <BottomTabBar />
    </View>
  );
}
```

```ts
const sidebarLayout = {
  container: {
    flexDirection: 'row',
    flex: 1,
  },
  sidebar: {
    width: 240,
    backgroundColor: t.colors.card,
    borderRightWidth: 1,
    borderRightColor: t.colors.border,
    paddingTop: a.space.xl,
  },
  content: {
    flex: 1,
    padding: a.space.xl,
  },
};
```

### Card Grid Layout

Responsive grid of cards that reflows based on screen width.

```tsx
function CardGrid({ items }) {
  const breakpoint = useBreakpoint();
  const columns = breakpoint === 'tablet' ? 3 : 2;

  return (
    <View style={gridStyles.container}>
      {items.map((item) => (
        <View key={item.id} style={[gridStyles.card, { width: `${100/columns}%` }]}>
          <Card data={item} />
        </View>
      ))}
    </View>
  );
}
```

```ts
const gridStyles = {
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: a.space.md,
    paddingHorizontal: a.space.lg,
  },
  card: {
    // Width set dynamically based on columns
    marginBottom: a.space.sm,
  },
};
```

---

## `useBreakpoint` Hook

```tsx
import { useBreakpoint, useMediaQuery } from '@alf/core';

function AdaptiveComponent() {
  const breakpoint = useBreakpoint();  // 'phone' | 'tablet'
  const isLargeTablet = useMediaQuery('(min-width: 1024px)');
  const isLandscape = useMediaQuery('(orientation: landscape)');

  return (
    <View>
      {breakpoint === 'phone' && <PhoneLayout />}
      {breakpoint === 'tablet' && <TabletLayout isLarge={isLargeTablet} />}
    </View>
  );
}
```

### Breakpoint-Aware Components

```tsx
function AdaptiveContainer({ children }) {
  const breakpoint = useBreakpoint();

  const containerStyle = responsive({
    phone: {
      paddingHorizontal: a.space.lg,
      paddingVertical: a.space.md,
    },
    tablet: {
      paddingHorizontal: a.space['3xl'],
      paddingVertical: a.space.xl,
      maxWidth: 960,
      alignSelf: 'center',
      width: '100%',
    },
  });

  return <View style={containerStyle}>{children}</View>;
}
```

---

## Adaptive Navigation

### Phone → Tablet Transition

```ts
const navigationConfig = {
  phone: {
    type: 'bottom-tabs',
    options: {
      tabBarStyle: {
        backgroundColor: t.colors.card,
        borderTopColor: t.colors.border,
        height: 80,
        paddingBottom: a.space.xs,
      },
    },
  },
  tablet: {
    type: 'sidebar',
    options: {
      sidebarWidth: 240,
      backgroundColor: t.colors.card,
      borderColor: t.colors.border,
    },
  },
};
```

### Responsive Header

```tsx
function ResponsiveHeader({ title, actions }) {
  const breakpoint = useBreakpoint();

  return (
    <View style={headerStyles.container}>
      {breakpoint === 'tablet' && <Logo />}
      <Text variant={breakpoint === 'tablet' ? 'h2' : 'h5'}>
        {title}
      </Text>
      <View style={headerStyles.actions}>
        {actions}
      </View>
    </View>
  );
}
```

```ts
const headerStyles = {
  container: responsive({
    phone: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: a.space.md,
      gap: a.space.sm,
    },
    tablet: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: a.space.lg,
      paddingHorizontal: a.space.xl,
      gap: a.space.md,
    },
  }),
  actions: {
    flexDirection: 'row',
    gap: a.space.sm,
    marginLeft: 'auto',
  },
};
```

---

## Tablet-Specific Considerations

### Touch Targets

Tablets have larger screens but fingers don't scale proportionally.

```ts
const touchTargets = responsive({
  phone: {
    minWidth: 44,
    minHeight: 44,
  },
  tablet: {
    minWidth: 48,
    minHeight: 48,
  },
});
```

### Content Density

Tablets can show more content but shouldn't feel cramped.

```ts
const contentDensity = {
  phone: {
    gap: a.space.sm,
    fontSize: t.font.size.sm,
  },
  tablet: {
    gap: a.space.md,
    fontSize: t.font.size.base,
    lineHeight: t.font.lineHeight.relaxed,
  },
};
```

### Multi-Pane Layouts

```tsx
function ThreePaneLayout() {
  const breakpoint = useBreakpoint();

  if (breakpoint === 'phone') {
    return <StackNavigator />;
  }

  return (
    <View style={{ flexDirection: 'row', flex: 1 }}>
      <NavigationSidebar width={240} />
      <ListPanel width={320} />
      <DetailPanel flex={1} />
    </View>
  );
}
```

### Keyboard Handling (iPad)

```ts
import { useKeyboard } from '@alf/core';

function FormScreen() {
  const { isVisible, height } = useKeyboard();

  return (
    <ScrollView
      contentContainerStyle={{
        paddingBottom: isVisible ? height + a.space.lg : a.space.xl,
      }}
    >
      <FormField label="Name" />
      <FormField label="Email" />
      <SubmitButton />
    </ScrollView>
  );
}
```

---

## Responsive Utility Reference

### `responsive()`

```ts
import { responsive } from '@alf/core';

const styles = responsive({
  phone: { /* phone styles */ },
  tablet: { /* tablet styles */ },
});
```

### `useMediaQuery()`

```ts
import { useMediaQuery } from '@alf/core';

const isCompact = useMediaQuery('(max-width: 375px)');
const isWide = useMediaQuery('(min-width: 1024px)');
```

### `matchBreakpoint()`

```ts
import { matchBreakpoint } from '@alf/core';

const columns = matchBreakpoint({
  phone: 2,
  tablet: 3,
});
```

---

## Common Responsive Patterns

### Hidden on One Platform

```ts
import { web, native } from '@alf/core';

// Only visible on web
const desktopOnly = responsive({
  phone: { display: 'none' },
  tablet: { display: 'flex' },
});

// Only visible on phone
const phoneOnly = responsive({
  phone: { display: 'flex' },
  tablet: { display: 'none' },
});
```

### Responsive Typography

```ts
const heading = responsive({
  phone: {
    fontSize: t.font.size.lg,
    lineHeight: t.font.lineHeight.snug,
  },
  tablet: {
    fontSize: t.font.size.xl,
    lineHeight: t.font.lineHeight.normal,
  },
});
```

### Responsive Card Layout

```tsx
function ResponsiveCard({ children }) {
  const breakpoint = useBreakpoint();

  return (
    <View
      style={responsive({
        phone: {
          padding: a.space.md,
          borderRadius: a.radius.md,
        },
        tablet: {
          padding: a.space.xl,
          borderRadius: a.radius.lg,
          flexDirection: 'row',
          gap: a.space.lg,
        },
      })}
    >
      {children}
    </View>
  );
}
```

---

## Best Practices

1. **Mobile-first**: Design for phone, then enhance for tablet
2. **Test both breakpoints**: Every screen must look correct on phone and tablet
3. **Don't shrink desktop UIs**: Tablet layouts should feel native, not like shrunken web pages
4. **Preserve touch targets**: Minimum 44px tap targets on all platforms
5. **Use layout patterns consistently**: Don't invent new patterns per screen — reuse stack/split/sidebar
6. **Progressive disclosure**: Show less on phone, reveal more on tablet
7. **Navigation adaptation**: Bottom tabs on phone, sidebar on tablet
8. **Content reflow**: Cards should reflow, not scale — use column counts, not fixed widths
9. **Safe areas**: Account for notch, home indicator, and tablet bezel insets
10. **Performance**: Lazy-load content that's only visible at certain breakpoints
