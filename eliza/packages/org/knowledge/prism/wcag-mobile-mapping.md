# WCAG Mobile Mapping

## Overview

WCAG 2.1 was written for the web, but every success criterion has a mobile
equivalent. This document maps the criteria OnlyMen treats as release-gating
(Level A and AA) onto concrete iOS and Android behaviors, with the React
Native APIs that satisfy them. Severity for a violation follows Prism's audit
ladder: blocker, major, minor, advisory.

---

## Perceivable

### 1.1.1 Non-text Content (A)
Every image, icon, and chart that conveys information needs a text
alternative; decorative images must be hidden from assistive technology.

- RN: `accessibilityLabel` on meaningful images; `accessibilityElementsHidden`
  (iOS) / `importantForAccessibility="no-hide-descendants"` (Android) on
  decorative ones.
- Violation severity: blocker when the image is the only way to understand
  content (e.g. an avatar-only sender indicator).

### 1.3.1 Info and Relationships (A)
Structure conveyed visually (headings, lists, grouping) must be programmatic.

- RN: `accessibilityRole="header"` on section titles; group label + value in
  one focusable row with a combined label instead of two stops.
- Common OnlyMen failure: settings rows where the label and the value are
  separate focus stops — combine them.

### 1.3.4 Orientation (AA)
Do not lock orientation unless essential. Users with mounted devices
(wheelchair mounts) often rely on landscape.

### 1.4.3 Contrast Minimum (AA)
4.5:1 for body text, 3:1 for large text (≥18pt regular / 14pt bold) and for
essential UI components and state indicators.

- Measure against the token actually rendered, in both themes.
- Pixel owns the token fix; Prism owns catching the violation.

### 1.4.4 Resize Text (AA)
Text must remain readable and functional at 200% scaling. On mobile this is
Dynamic Type (iOS) / font scale (Android).

- RN: never set `allowFontScaling={false}` on user-facing text; test at the
  largest accessibility size (~310%).
- Truncation that hides essential content at large sizes is a major.

### 1.4.10 Reflow (AA)
Content reflows without horizontal scrolling at large text sizes. Fixed-height
containers that clip scaled text are the usual mobile failure.

### 1.4.11 Non-text Contrast (AA)
3:1 for interactive component boundaries and state indicators — toggle
on/off states, focus rings, checkbox borders.

---

## Operable

### 2.1.1 Keyboard (A)
Everything reachable by touch must be reachable by external keyboard (mobile)
and keyboard (web). Focus must move logically with Tab/arrow keys.

### 2.1.2 No Keyboard Trap (A)
Focus (including VoiceOver/TalkBack reading focus) must always be able to
leave a component. Modal media viewers and bottom sheets are the usual traps.

- RN: `accessibilityViewIsModal` scoped correctly, and an always-present,
  focusable close affordance.
- Any trap is a blocker.

### 2.4.3 Focus Order (A)
Reading and focus order follow the visual/logical order. After an action,
focus stays put or moves somewhere predictable — never resets to the top.

### 2.4.7 Focus Visible (AA)
Keyboard focus indicator is visible on web and for external keyboards.

### 2.5.1 Pointer Gestures (A)
Multipoint or path-based gestures (swipe to dismiss, pinch to zoom) need a
single-pointer alternative (a visible button).

### 2.5.5 Target Size (AAA, OnlyMen ships it anyway)
Touch targets ≥ 44×44pt. Advisory severity when missed on dense UI, major on
primary actions.

---

## Understandable

### 3.2.2 On Input (A)
Changing a control's value must not trigger an unexpected context change
(navigation, focus jump) without warning.

### 3.3.1 Error Identification (A) / 3.3.2 Labels or Instructions (A)
Form errors are announced to assistive technology, not just rendered in red.

- RN: move screen reader focus to the first error, or use
  `AccessibilityInfo.announceForAccessibility`.
- Color-only error indication violates 1.4.1 as well — pair with icon + text.

---

## Robust

### 4.1.2 Name, Role, Value (A)
Every interactive element exposes an accessible name, a correct role, and its
current state.

- RN: `accessibilityRole` (`button`, `switch`, `checkbox`, `link`, `header`,
  `tab`), `accessibilityLabel`, `accessibilityState`
  (`checked`/`selected`/`disabled`/`expanded`/`busy`).
- The single most common finding in OnlyMen audits. A toggle announcing as
  an unlabeled "button" is a blocker.

### 4.1.3 Status Messages (AA)
Async status (message sent, upload failed, loading finished) is announced
without moving focus.

- RN: `accessibilityLiveRegion="polite"` (Android),
  `announceForAccessibility` (cross-platform).

---

## Release-gate summary

A release candidate fails accessibility sign-off if any of these are open:

1. Any screen reader trap (2.1.2)
2. Any interactive element with missing/incorrect name, role, or state (4.1.2)
   on a changed screen
3. Essential text below 4.5:1 contrast (1.4.3)
4. Essential content lost at 200% text scale (1.4.4 / 1.4.10)
5. Any information conveyed by color alone (1.4.1)
