---
name: accessibility-review
description: >
  Comprehensive accessibility review skill for OnlyMen iOS/Android applications.
  Provides structured methodologies for WCAG 2.1 AA compliance, screen reader
  testing, keyboard navigation, Dynamic Type support, color contrast verification,
  and inclusive design practices.
version: 1.0.0
authors:
  - Pixel
  - Compass
tags:
  - accessibility
  - a11y
  - wcag
  - inclusive-design
  - screen-reader
  - ios
  - android
applicable_agents:
  - Pixel
  - Compass
---

# Accessibility Review Skill

## Overview

This skill provides a structured methodology for reviewing and ensuring
accessibility compliance in OnlyMen iOS and Android applications. It covers
WCAG 2.1 AA requirements, platform-specific accessibility APIs, testing
procedures, and inclusive design best practices. Use this skill when conducting
accessibility audits, onboarding new components, or verifying compliance before
release.

## Scope

This skill applies to:
- React Native components and screens
- Native iOS (Swift/UIKit/SwiftUI) and Android (Kotlin/XML) bridge code
- Navigation flows and user journeys
- Custom gestures and interactive elements
- Media content (images, video, audio)
- Error states and edge cases

---

## 1. WCAG 2.1 AA Requirements

### Perceivable

**1.1 Text Alternatives**
- [ ] All meaningful images have descriptive `accessibleLabel` / `contentDescription`
- [ ] Decorative images are marked as decorative (excluded from accessibility tree)
- [ ] Complex images (charts, diagrams) have extended descriptions
- [ ] Icons with text labels do not repeat the label in the alt text

**1.2 Time-Based Media**
- [ ] Video content has captions
- [ ] Audio-only content has transcripts
- [ ] Media players support pause, stop, and volume controls
- [ ] No content flashes more than 3 times per second

**1.3 Adaptable**
- [ ] Content reflows without horizontal scrolling at 320px width (mobile)
- [ ] Reading order matches visual order in accessibility tree
- [ ] Instructions do not rely solely on sensory characteristics
- [ ] Form labels are programmatically associated with inputs
- [ ] Data tables have proper headers and scope attributes

**1.4 Distinguishable**
- [ ] Color is not the only means of conveying information
- [ ] Text contrast ratio ≥ 4.5:1 (normal text) / ≥ 3:1 (large text)
- [ ] UI component contrast ratio ≥ 3:1 against adjacent colors
- [ ] Text resizable up to 200% without loss of content
- [ ] Content is readable in high contrast mode

### Operable

**2.1 Keyboard Accessible**
- [ ] All functionality available via keyboard
- [ ] No keyboard traps
- [ ] Custom keyboard shortcuts documented and discoverable
- [ ] Modal dialogs trap focus appropriately

**2.2 Enough Time**
- [ ] Session timeouts provide warning and extension option
- [ ] Auto-updating content can be paused
- [ ] Time limits can be extended or removed

**2.3 Seizures and Physical Reactions**
- [ ] No content flashes more than 3 times per second
- [ ] Motion can be disabled via system settings

**2.4 Navigable**
- [ ] Skip navigation links provided where appropriate
- [ ] Page titles are descriptive and unique
- [ ] Focus order is logical and intuitive
- [ ] Link purpose is clear from text alone
- [ ] Multiple navigation mechanisms available

**2.5 Input Modalities**
- [ ] Touch targets are at least 44x44 points
- [ ] Gestures have single-touch alternatives
- [ ] Motion-triggered actions have alternatives

### Understandable

**3.1 Readable**
- [ ] Language of content is identified (`accessibilityLanguage`)
- [ ] Language changes are marked programmatically

**3.2 Predictable**
- [ ] Focus does not trigger unexpected context changes
- [ ] Input does not trigger unexpected context changes
- [ ] Navigation is consistent across screens
- [ ] Components with same function have same label

**3.3 Input Assistance**
- [ ] Error messages are descriptive and suggest corrections
- [ ] Form labels and instructions provided before input
- [ ] Error prevention for legal/financial transactions

### Robust

**4.1 Compatible**
- [ ] Custom components have proper roles, states, and properties
- [ ] Name, role, value exposed for all UI components
- [ ] Status messages announced via accessibility API
- [ ] Content works with current and future assistive technologies

---

## 2. Screen Reader Testing

### VoiceOver (iOS)

**Test Procedure**
1. Enable VoiceOver: Settings → Accessibility → VoiceOver
2. Navigate entire app using swipe gestures and rotor
3. Verify all interactive elements are announced correctly
4. Verify heading structure with rotor (Headings)
5. Test in portrait and landscape orientations

**Checklist**
- [ ] All buttons announce their purpose
- [ ] Images have meaningful alt text
- [ ] Form fields announce labels and current value
- [ ] Error states are announced when they appear
- [ ] Dynamic content changes are announced
- [ ] Heading levels follow logical hierarchy (no skipped levels)
- [ ] Tables announce row/column context
- [ ] Modal focus is trapped and announced
- [ ] Dismiss actions (close, cancel) are discoverable

**Common VoiceOver Issues in React Native**
- Missing `accessible={true}` on touchable containers
- Nested touchables conflicting with accessibility actions
- `accessibilityLabel` not matching visual label
- `accessibilityRole` not set for custom components
- Dynamic content updates not triggering announcements

### TalkBack (Android)

**Test Procedure**
1. Enable TalkBack: Settings → Accessibility → TalkBack
2. Navigate using swipe gestures and explore by touch
3. Verify all interactive elements are announced correctly
4. Verify heading structure with reading controls
5. Test with different TalkBack verbosity settings

**Checklist**
- [ ] All buttons announce their purpose and state
- [ ] Images have meaningful `contentDescription`
- [ ] Form fields announce labels, values, and states
- [ ] Error messages announced when they appear
- [ ] Focus order follows logical reading sequence
- [ ] Custom actions available via local context menu (swipe up)
- [ ] Live regions announce dynamic content changes
- [ ] Heading structure is logical and navigable

**Common TalkBack Issues in React Native**
- Missing `importantForAccessibility` on Android
- `accessibilityElementsHidden` not used for decorative content
- Overlapping accessibility nodes from absolute positioning
- Missing accessibility delegate for custom native modules

### Platform-Specific Testing Matrix

| Test Case | iOS (VoiceOver) | Android (TalkBack) | Priority |
|---|---|---|---|
| Login flow | Required | Required | P0 |
| Main navigation | Required | Required | P0 |
| Form submission | Required | Required | P0 |
| Error handling | Required | Required | P0 |
| Media playback | Required | Required | P1 |
| Settings screens | Required | Required | P1 |
| Onboarding | Recommended | Recommended | P2 |

---

## 3. Keyboard Navigation

### Requirements

- [ ] All interactive elements focusable and operable via keyboard
- [ ] Tab order follows logical visual flow
- [ ] Focus visible on all focusable elements
- [ ] No keyboard traps anywhere in the app
- [ ] Escape key dismisses modals and popovers
- [ ] Enter/Space activates buttons and links
- [ ] Arrow keys navigate within composite widgets
- [ ] Home/End navigate to first/last items in lists

### React Native Keyboard Considerations

```tsx
// Good: Explicit keyboard handling
<TouchableOpacity
  accessible={true}
  accessibilityRole="button"
  accessibilityLabel="Submit form"
  accessibilityActions={[
    { name: 'activate', label: 'Submit' }
  ]}
  onAccessibilityAction={(event) => {
    if (event.nativeEvent.actionName === 'activate') {
      handleSubmit();
    }
  }}
>
  <Text>Submit</Text>
</TouchableOpacity>
```

### Keyboard Navigation Checklist

- [ ] `Tab` moves focus forward through interactive elements
- [ ] `Shift+Tab` moves focus backward
- [ ] `Enter` or `Space` activates focused element
- [ ] `Escape` closes modals/popovers and returns focus to trigger
- [ ] Focus is managed when navigating between screens
- [ ] Custom keyboard shortcuts documented in help/FAQ

---

## 4. Dynamic Type & Font Scaling

### iOS (Dynamic Type)

- [ ] All text uses scaled fonts (`UIFontMetrics` or React Native defaults)
- [ ] Text scales up to AX5 (accessibility extra-extra-extra-large)
- [ ] Layouts do not break or overlap at largest text sizes
- [ ] Minimum touch target maintained at all text sizes
- [ ] Truncation is not the only option — reflow preferred

### Android (Font Scaling)

- [ ] Text respects system font size setting (up to 200%)
- [ ] `sp` units used for all text (not `dp`)
- [ ] Layouts accommodate text at 200% scale
- [ ] Custom font size pickers provided in app settings where appropriate

### React Native Approach

```tsx
// Use platform-appropriate scaling
import { PixelRatio, Platform } from 'react-native';

const scaleFont = (size: number) => {
  // React Native handles Dynamic Type via Text allowingFontScaling
  // Ensure allowingFontScaling={true} (default) on all Text components
  return size;
};

// Layouts should use flexible dimensions
<View style={{ flex: 1, padding: 16 }}>
  <Text 
    numberOfLines={0}  // Allow wrapping instead of truncation
    adjustsFontSizeToFit={true}  // Shrink text to fit if needed
  >
    {content}
  </Text>
</View>
```

### Testing Procedure

1. Set system text size to largest available
2. Navigate all screens and verify readability
3. Verify no text overlap or clipping
4. Verify all interactive elements remain tappable
5. Verify modals and alerts display correctly
6. Take screenshots at multiple text sizes for comparison

---

## 5. Color Contrast Verification

### Requirements

| Element | Minimum Ratio | Standard |
|---|---|---|
| Normal text (< 18pt) | 4.5:1 | WCAG AA |
| Large text (≥ 18pt or ≥ 14pt bold) | 3:1 | WCAG AA |
| UI components | 3:1 | WCAG AA |
| Focus indicators | 3:1 | WCAG AA |
| Graphical objects | 3:1 | WCAG AA |

### Verification Process

1. **Identify color pairs** — List all foreground/background combinations
2. **Measure ratios** — Use contrast analyzer tools
3. **Test states** — Verify contrast in all states (default, hover, active, disabled, error)
4. **Test themes** — Verify contrast in light mode, dark mode, and high contrast mode
5. **Test context** — Verify contrast over images, gradients, and dynamic backgrounds

### Tools

- **iOS Accessibility Inspector** — Built-in contrast checking
- **Colour Contrast Analyser (CCA)** — Desktop tool for spot-checking
- **Stark** — Figma/Sketch plugin for design review
- **React Native Accessibility Info** — Programmatic contrast checks

### Common Contrast Issues

- Placeholder text in input fields
- Disabled state text and icons
- Text over image backgrounds
- Link text that differs from body text only by color
- Error/warning states using only red color
- Border/ring indicators on focused elements

---

## 6. Focus Indicators

### Requirements

- [ ] Focus indicator visible on all interactive elements
- [ ] Focus indicator has ≥ 3:1 contrast ratio
- [ ] Focus indicator is at least 2px thick
- [ ] Focus order is logical and predictable
- [ ] Focus is managed when content changes dynamically

### Implementation Patterns

**iOS**
```swift
// SwiftUI
.buttonStyle(.borderedProminent)
.accessibilityFocus()
// Focus ring automatically provided by system
```

**Android**
```xml
<!-- Focus indicator via ripple or state list drawable -->
<selector>
    <item android:state_focused="true">
        <shape android:shape="rectangle">
            <stroke android:width="2dp" android:color="@color/focus_ring" />
        </shape>
    </item>
</selector>
```

**React Native**
```tsx
// Custom focus indicator
const FocusableButton = () => {
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <TouchableOpacity
      accessible={true}
      accessibilityRole="button"
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      style={{
        borderWidth: isFocused ? 3 : 0,
        borderColor: isFocused ? '#005FCC' : 'transparent',
        outline: isFocused ? 'none' : undefined,
      }}
    >
      <Text>Action</Text>
    </TouchableOpacity>
  );
};
```

---

## 7. ARIA Roles & Properties

### Required Roles for Custom Components

| Component | Role | Key Properties |
|---|---|---|
| Button | `button` | `accessibilityLabel`, `accessibilityState` |
| Link | `link` | `accessibilityLabel` |
| Text Input | `none` (default) | `accessibilityLabel`, `accessibilityHint` |
| Switch | `switch` | `accessibilityLabel`, `accessibilityState={{ checked }}` |
| Slider | `adjustable` | `accessibilityLabel`, `accessibilityValue` |
| Tab Bar | `tablist` | Individual tabs: `role="tab"` |
| Modal | `dialog` | `accessibilityLabel`, `accessibilityViewIsModal` |
| Image | `image` | `accessibilityLabel` (meaningful) or hidden |
| Header | `header` | Implicit in heading elements |
| List | `list` | Items: `role="listitem"` |

### State Communication

```tsx
// Communicate component states to accessibility tree
<TouchableOpacity
  accessible={true}
  accessibilityRole="checkbox"
  accessibilityState={{
    checked: isChecked,
    disabled: isDisabled,
    selected: isSelected,
    expanded: isExpanded,
  }}
  accessibilityValue={{
    min: 0,
    max: 100,
    now: currentValue,
    text: `${currentValue} percent`,
  }}
>
  <Text>Progress: {currentValue}%</Text>
</TouchableOpacity>
```

### Common ARIA Mistakes

- Using `accessibilityRole="button"` on non-interactive containers
- Not updating `accessibilityState` when state changes
- Missing `accessibilityActions` for complex interactions
- Using `accessibilityElementsHidden` when content should be hidden
- Not setting `accessibilityViewIsModal` on modal overlays

---

## 8. Responsive Layouts

### Mobile-Specific Considerations

- [ ] Content reflows without horizontal scrolling at 320px width
- [ ] Touch targets ≥ 44x44 points in all orientations
- [ ] Content accessible in both portrait and landscape
- [ ] Safe area insets respected (notch, home indicator, status bar)
- [ ] Keyboard does not obscure important content

### Layout Testing Matrix

| Condition | Portrait | Landscape | Split View (iPad) |
|---|---|---|---|
| Standard text | Required | Required | Recommended |
| Large text (200%) | Required | Required | Recommended |
| VoiceOver | Required | Recommended | Recommended |
| Switch Control | Required | Recommended | N/A |

### Responsive Patterns

- Use `flex` layouts over fixed dimensions
- Test with `UIVisualEffectView` / blur backgrounds
- Verify modals adapt to smaller screens (iPhone SE)
- Test content density on larger screens (iPad, Android tablets)

---

## 9. Testing Tools & Automation

### Automated Tools

- **Accessibility Inspector** (Xcode) — Built-in iOS auditing
- **Accessibility Scanner** (Google) — Android automated checks
- **axe-core** — JavaScript accessibility engine
- **jest-axe** — Jest integration for component testing
- **@testing-library/react-native** — Accessibility-first testing

### Automated Test Example

```tsx
import { render } from '@testing-library/react-native';
import { axe } from 'jest-axe';

describe('LoginForm Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<LoginForm />);
    const results = await axe(container);
    expect(results.violations).toHaveLength(0);
  });

  it('should announce errors to screen readers', () => {
    const { getByRole, getByText } = render(<LoginForm />);
    // Submit empty form
    fireEvent.press(getByRole('button', { name: 'Sign In' }));
    // Error should be announced
    expect(getByText('Email is required')).toBeTruthy();
  });
});
```

### Manual Testing Checklist

- [ ] VoiceOver full app walkthrough (iOS)
- [ ] TalkBack full app walkthrough (Android)
- [ ] Switch Control navigation test (iOS)
- [ ] Switch Access navigation test (Android)
- [ ] Keyboard-only navigation test
- [ ] Dynamic Type / font scaling test
- [ ] High contrast mode test
- [ ] Reduce Motion test
- [ ] Multiple device size test

---

## Escalation Paths

| Issue Type | Severity | Response Time | Escalation |
|---|---|---|---|
| Blocker (app unusable with AT) | Critical | Immediate | Pixel + Compass + Engineering Lead |
| Major AT issue | High | 48 hours | Pixel + Compass |
| Contrast failure | Medium | 1 sprint | Pixel |
| Minor A11y improvement | Low | Backlog | Compass |

### Bug Severity Definitions

- **Critical** — App completely unusable with assistive technology
- **High** — Key user journey blocked with assistive technology
- **Medium** — Non-critical feature inaccessible or difficult to use
- **Low** — Minor improvement possible, workaround exists

---

## Common Gotchas

- **Nested touchables** — Touchable components inside touchables cause unpredictable screen reader behavior. Use `accessible={false}` on parent containers.
- **Dynamic content not announced** — State changes not triggering `AccessibilityInfo.announceForAccessibility()` or live regions.
- **Absolute positioning** — Breaks reading order. Ensure `accessibilityElementsHidden` and proper ordering.
- **Image-only buttons** — Without `accessibilityLabel`, screen readers announce "button" with no context.
- **Missing error association** — Error messages not programmatically linked to inputs via `accessibilityDescribedBy`.
- **FlatList virtualization** — Off-screen items not accessible. Verify virtualized lists work with screen readers.
- **Gesture conflicts** — Custom gestures overriding system accessibility gestures (e.g., swipe gestures conflicting with VoiceOver navigation).
- **Modal focus management** — Focus not moving to modal on open or back to trigger on close.
- **Animated transitions** — `Reduce Motion` system setting not respected by custom animations.
- **WebView content** — Inaccessible to native screen readers. Consider native alternatives for critical content.
