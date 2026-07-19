---
name: react-native-dev
description: >
  React Native development skill for Nova. Covers component patterns, hooks,
  state management with TanStack Query, platform-specific code via file
  extensions (.native.tsx/.web.tsx), ALF design system atoms, React Compiler
  compatibility, performance patterns, and debugging.
metadata:
  author: OnlyMen Engineering
  team: Nova
  version: 1.0.0
  tags:
    - react-native
    - mobile
    - hooks
    - tanstack-query
    - alf-design-system
    - react-compiler
---

# React Native Development

Skill for building and maintaining React Native applications within the OnlyMen
engineering organization. Targets Nova's mobile and cross-platform codebase.

---

## Component Patterns

### Functional Components Only

Every component is a plain function. No class components, no exceptions.

```tsx
import { View, Text } from 'react-native'
import { atoms } from '@/alf'

export function StatusBadge({ label, variant = 'neutral' }: StatusBadgeProps) {
  return (
    <View style={[atoms.roundedFull, atoms.px3, atoms.py1, badgeStyles[variant]]}>
      <Text style={[atoms.textSm, atoms.fontMedium, textColors[variant]]}>
        {label}
      </Text>
    </View>
  )
}
```

### Props Interface Convention

Define props as a type alias directly above the component. Do not export prop
types unless they are consumed outside the module.

```tsx
type Props = {
  uri: string
  size?: 'small' | 'medium' | 'large'
  onPress?: () => void
}
```

### Composition Over Configuration

Prefer composable children over monolithic prop APIs.

```tsx
// Good
<Card>
  <Card.Header>Title</Card.Header>
  <Card.Body>Content</Card.Body>
</Card>

// Bad
<Card title="Title" content="Content" footer={null} headerIcon={<Icon />} />
```

### Avoid Inline Styles

Always use ALF atoms or StyleSheet.create. Inline style objects defeat
React Compiler optimizations and cause unnecessary re-renders.

```tsx
// Good
<View style={atoms.flexRow}>

// Bad
<View style={{ flexDirection: 'row' }}>
```

---

## Hooks

### Custom Hook Rules

- Prefix every custom hook with `use`.
- One responsibility per hook. If a hook manages two unrelated concerns, split
  it.
- Return objects, not arrays, unless the consumer always destructures in the
  same order.

```tsx
export function useBookmark(postUri: string) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => toggleBookmark(postUri),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] })
    },
  })

  return {
    toggle: mutation.mutate,
    isPending: mutation.isPending,
  }
}
```

### Built-in Hook Discipline

- `useCallback` and `useMemo` are allowed only when profiling confirms a
  measurable benefit. React Compiler handles most memoization automatically.
- Never suppress the `useMemo`/`useCallback` lint rules globally. Suppress
  per-line with a comment explaining the measurement that justified it.
- Do not nest hooks inside conditionals, loops, or try/catch blocks.

---

## State Management with TanStack Query

### Server State

All server-derived data lives in TanStack Query. Do not mirror server state
into React context or global state managers.

```tsx
export function useProfileQuery(did: string) {
  return useQuery({
    queryKey: profileQueryKey(did),
    queryFn: () => fetchProfile(did),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  })
}
```

### Query Key Convention

Query keys are arrays with a stable, stringified discriminator as the first
element. Derived parameters follow.

```tsx
const profileQueryKey = (did: string) => ['profile', did]
const feedQueryKey = (actor: string, filter: string) => ['feed', actor, filter]
```

### Mutations

- Always invalidate related queries in `onSuccess`.
- Use `onMutate` for optimistic updates with rollback via `onError`.
- Never fire a mutation from a `useEffect`. Attach it to a user action.

### Persistence

Use `@tanstack/query-persist-client` with MMKV storage. The persist client
hydrates on mount so the UI shows cached data immediately.

---

## Platform-Specific Code

### File Extension Convention

Use platform extensions to split platform-specific implementations. The
Metro bundler resolves these at build time.

```
components/
  Avatar.tsx          # Shared logic
  Avatar.native.tsx   # iOS/Android specific
  Avatar.web.tsx      # Web specific
```

### Rules

- The base file (`Avatar.tsx`) must exist and must re-export a default. It
  serves as the fallback if no platform-specific file exists.
- Platform-specific files must implement the same exported interface.
- Do not import platform-specific modules from shared code. The bundler
  resolves the correct file, but cross-imports create hidden dependencies.
- Use `Platform.OS` checks only for minor behavioral differences (haptics,
  keyboard avoidance). For full rendering differences, use file extensions.

---

## ALF Design System Atoms

### Usage

ALF atoms are the atomic design tokens for the OnlyMen UI. Import from
`@/alf`.

```tsx
import { atoms } from '@/alf'
```

### Guidelines

- Use atoms for spacing, typography, color, borders, and layout primitives.
- Combine atoms with `style` array composition. Do not override atom values
  inline.
- For component-level variants, create a lookup object outside the render
  function.

```tsx
const containerStyles = {
  primary: [atoms.bgBlue500, atoms.roundedMd],
  danger: [atoms.bgRed500, atoms.roundedMd],
  neutral: [atoms.bgGray200, atoms.roundedMd],
} as const
```

- Do not create new design tokens. If an atom does not exist, request it
  through the ALF governance process.
- Do not use raw hex values, named colors, or `Platform.select` for colors.
  Always go through ALF tokens.

---

## React Compiler Compatibility

### What the Compiler Handles

React Compiler (React 19+) automatically memoizes components, hooks, and
callbacks. Assume it is active in all Nova builds.

### Implications

- **Remove manual `React.memo` wrappers.** The compiler supersedes them.
- **Remove manual `useMemo`/`useCallback`** unless profiling proves the
  compiler missed a case.
- **Do not mutate props or state.** The compiler relies on immutability for
  correctness.
- **Do not use `useRef` as a side-effect container.** Use `useEffect` for
  side effects.

### Compatibility Checklist

Before adding a new dependency or pattern, verify:

1. No hidden mutations in component bodies.
2. Hooks are called unconditionally at the top level.
3. JSX children are stable references (avoid inline arrow functions in
   render props unless wrapped in `useCallback` that the compiler can
   optimize).

---

## Performance Patterns

### Fast Refresh

- Keep components small (under 150 lines). Smaller components refresh faster
  and are easier to reason about.
- Co-locate styles with their component. Separate style files slow down Fast
  Refresh recovery.

### List Rendering

- Always provide a stable, unique `key`. Do not use array indices.
- Use `FlashList` for lists over 20 items. `FlatList` is acceptable for
  short, static lists.
- Avoid anonymous functions in `renderItem`. Define the render function
  outside the component or memoize it.

### Image Handling

- Use `Image` from `expo-image` for caching and progressive loading.
- Always specify `width` and `height` to prevent layout shifts.
- Use `contentFit="cover"` instead of `resizeMode` for new code.

### Navigation

- Lazy-load screen components. Do not eagerly import heavy screens.
- Use `React.lazy` with a Suspense boundary for screens with large bundles.

---

## Debugging

### Tools

- **React DevTools**: Use the standalone React DevTools to inspect the
  component tree. Filter by component name to locate re-render culprits.
- **Flipper**: Use Flipper for network inspection, layout debugging, and
  database browsing.
- **Hermes Inspector**: For memory and CPU profiling on device.
- **React Compiler Compiler output**: Enable
  `react_compiler_runtimeDetection` in Metro config to log compiler
  violations at build time.

### Common Debugging Patterns

**Unnecessary re-renders**: Wrap the suspect component in
`<React.Profiler id="Name" onRender={logRender}>` temporarily. Remove after
debugging.

**Stale closures**: Add a `console.log` inside the closure to capture the
values at call time. If the values are stale, the callback is not being
recreated — check dependencies.

**State not updating**: Verify the state setter is not being called with the
same value. React skips re-renders for identical state.

---

## Common Gotchas

- **Platform.select is not type-safe** for nested objects. Prefer file
  extensions for whole-component differences.
- **Hermes does not support all ESNext features.** Check the Hermes
  compatibility table before using new syntax (e.g., `using` declarations).
- **`react-native-gesture-handler`** must be imported at the top of the
  entry file. Failing to do so causes silent gesture failures.
- **Keyboard insets** behave differently on iOS and Android. Always test with
  both a physical keyboard and the soft keyboard.
- **SSR/Hydration mismatches** on web: avoid `Date.now()` or
  `Math.random()` in initial render.

---

## Security Considerations

- Never hardcode API keys, tokens, or secrets in React Native source. Use
  environment variables injected at build time via `expo-constants` or a
  `.env` file excluded from version control.
- Sanitize all user-generated content before rendering with
  `dangerouslySetInnerHTML` equivalent patterns. Prefer `Text` nodes which
  do not interpret HTML.
- Do not store sensitive data in AsyncStorage or MMKV without encryption.
  Use `expo-secure-store` for tokens and credentials.
- Validate deep link parameters before using them to navigate or fetch data.
- Use certificate pinning for sensitive API endpoints in production builds.
