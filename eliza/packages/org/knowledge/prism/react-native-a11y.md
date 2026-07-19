# React Native Accessibility

## Overview

The React Native accessibility API surface OnlyMen relies on, with the
patterns Prism expects to see in reviewed code and the anti-patterns that
generate findings. Nova implements; Prism reviews against this reference.

---

## Core props

| Prop | Purpose | Notes |
|---|---|---|
| `accessible` | Groups children into one focusable element | Parent `true` swallows children on iOS — group deliberately |
| `accessibilityLabel` | The name announced | Overrides text content; keep it short, no role words ("button") in the label |
| `accessibilityRole` | The role announced | `button`, `switch`, `checkbox`, `radio`, `link`, `header`, `image`, `tab`, `adjustable`, `alert`, `search` |
| `accessibilityState` | Current state | `{ disabled, selected, checked, busy, expanded }` — must update with the real state |
| `accessibilityValue` | Value for ranged controls | `{ min, max, now, text }` on sliders/progress |
| `accessibilityHint` | What happens on activate | Use sparingly; verbose hints slow power users |
| `accessibilityActions` + `onAccessibilityAction` | Custom actions (delete, reply) | Pair with visible alternatives (2.5.1) |
| `accessibilityElementsHidden` (iOS) / `importantForAccessibility` (Android) | Hide decorative/duplicate elements | Always set both or use a shared helper |
| `accessibilityViewIsModal` (iOS) | Scope reader focus to a modal | Mis-scoping causes traps (2.1.2 blockers) |
| `accessibilityLiveRegion` (Android) | Announce async changes | `"polite"` almost always; `"assertive"` only for errors |
| `allowFontScaling` | Dynamic Type opt-out | Never `false` on user-facing text |

APIs: `AccessibilityInfo.announceForAccessibility(msg)` for cross-platform
announcements; `AccessibilityInfo.isScreenReaderEnabled()` /
`isReduceMotionEnabled()` for behavioral adaptation;
`setAccessibilityFocus(reactTag)` for deliberate focus moves.

---

## Required patterns

### Toggle row (settings)
One focusable row; role switch; combined label; state driven by real value.

```tsx
<Pressable
  accessible
  accessibilityRole="switch"
  accessibilityLabel="Push notifications"
  accessibilityState={{ checked: enabled }}
  onPress={onToggle}>
  <Text allowFontScaling>Push notifications</Text>
  <Switch value={enabled} onValueChange={onToggle}
    importantForAccessibility="no" accessibilityElementsHidden />
</Pressable>
```

### Async status
Announce without moving focus:

```tsx
AccessibilityInfo.announceForAccessibility('Message sent')
```

### Modal / bottom sheet
`accessibilityViewIsModal` on the sheet root (iOS), initial focus on the
title, and a focusable close button as the last element. Verify escape with
the scrub/back gesture in the smoke pass.

### Error surfacing
Error text rendered adjacent to the field, `accessibilityLiveRegion="polite"`
on Android, focus moved to the first invalid field on submit.

### Reduced motion
Gate decorative animation on `isReduceMotionEnabled()`; keep essential motion
(progress) but drop parallax/spring flourishes.

---

## Anti-patterns (instant findings)

- `accessibilityLabel="button"` or role words inside labels — the role prop
  already announces it. (Minor)
- `TouchableOpacity` around text with no role — announces as plain text.
  (Major on actionable elements)
- Toggling visual state without updating `accessibilityState` — reader users
  get no feedback. (Blocker on primary controls)
- `allowFontScaling={false}` to "protect the layout" — fix the layout.
  (Major)
- Color-only distinction for error/success text. (Major, 1.4.1)
- Focus reset to screen top after in-place actions. (Major, 2.4.3)
- Separate focus stops for a label and its value in the same logical row.
  (Minor, 1.3.1)
- `accessible={true}` on a container with multiple interactive children —
  children become unreachable on iOS. (Blocker when it hides actions)

---

## Testing hooks

- Every screen's E2E suite includes an a11y assertion lane: labels, roles,
  and states asserted on the changed components (Compass owns the harness;
  Prism owns the assertions).
- `testID` and `accessibilityLabel` serve different masters — never reuse
  test IDs as labels.
- CI runs the automated checks (axe where applicable); automated checks catch
  ~40% of issues — the screen reader pass is still mandatory for sign-off.
