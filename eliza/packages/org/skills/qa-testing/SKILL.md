---
name: qa-testing
description: "QA testing skill for Compass. Test plans, edge cases, manual QA, automated testing (Maestro), accessibility, tablet/responsive, offline/network, permission flows, bug reports."
version: 1.0.0
author: OnlyMen Engineering
agent: Compass
category: quality-assurance
tags:
  - qa
  - testing
  - maestro
  - accessibility
  - responsive
  - offline
  - bug-report
---

# QA Testing Skill

This skill covers quality assurance for the OnlyMen app: creating test plans, identifying edge cases, running manual and automated tests, validating accessibility and responsive layouts, testing offline behavior and permission flows, and writing effective bug reports.

---

## 1. Test Plan Creation

### Test Plan Template

```markdown
# Test Plan: [Feature Name]

## Overview
- **Feature**: [Feature name and description]
- **Version**: [App version being tested]
- **Date**: [Test date]
- **Tester**: [Name]
- **Devices**: [List of test devices]

## Scope
### In Scope
- [ ] [Specific functionality 1]
- [ ] [Specific functionality 2]

### Out of Scope
- [Related feature not covered]

## Test Cases

| ID    | Scenario                  | Steps                        | Expected Result               | Priority |
|-------|---------------------------|------------------------------|-------------------------------|----------|
| TC-01 | Fresh install launch      | Install > Open app           | Welcome screen appears        | P0       |
| TC-02 | Login with valid creds    | Enter email > Enter pass > Tap login | Dashboard loads       | P0       |
| TC-03 | Login with invalid creds  | Enter wrong pass > Tap login | Error message, no crash       | P0       |

## Environment
- Network conditions: WiFi, LTE, offline
- OS versions: iOS 16+, Android 12+
- Screen sizes: Phone, Tablet

## Exit Criteria
- All P0 test cases pass
- No critical or high-severity bugs open
- Performance within acceptable thresholds
```

### Test Case Priorities

| Priority | Definition                                    | Failure Impact        |
|----------|-----------------------------------------------|-----------------------|
| P0       | Core functionality, blocking                  | App is unusable       |
| P1       | Important feature, workaround exists          | Degraded experience   |
| P2       | Nice-to-have, minor impact                    | Cosmetic or minor     |
| P3       | Edge case, rare scenario                      | Minimal impact        |

---

## 2. Edge Case Identification

### Edge Case Categories

#### Input Edge Cases
- Empty input fields (submit with nothing)
- Extremely long strings (500+ characters in a text field)
- Special characters (`<script>`, `'; DROP TABLE`, emoji, Unicode)
- Copy-paste with formatting
- Rapid double-tap on buttons
- Back button mid-operation
- Keyboard appearance/disappearance during input

#### Network Edge Cases
- Airplane mode toggle during active request
- WiFi to LTE handoff mid-upload
- Very slow network (3G throttled)
- Connection restored after extended offline
- VPN connected/disconnected during session
- Captive portal (hotel WiFi login)

#### Data Edge Cases
- Zero items in a list
- Maximum items (1000+)
- First item, last item, middle item operations
- Duplicate entries
- Stale data (cached vs. server)
- Concurrent modifications from another device

#### Time Edge Cases
- Device clock set to future or past
- Midnight rollover during active session
- DST transition
- Timer operations near zero

### Edge Case Checklist

Run through this checklist for every feature:

- [ ] Empty state (no data)
- [ ] Loading state (slow network)
- [ ] Error state (network failure)
- [ ] Success state (normal flow)
- [ ] Boundary values (min/max allowed)
- [ ] Concurrent operations (two actions at once)
- [ ] Interruption (phone call, notification, app backgrounded)
- [ ] Configuration change (rotate, split screen, dark mode)

---

## 3. Manual QA Testing

### Daily QA Routine

1. Pull latest build from CI
2. Run smoke test (5-minute critical path check)
3. Test any changed features thoroughly
4. Check regression on adjacent features
5. File bugs with reproduction steps

### Smoke Test Script

```markdown
## Smoke Test (< 5 minutes)

1. [ ] App launches without crash
2. [ ] Login succeeds with test account
3. [ ] Dashboard loads and shows data
4. [ ] Can navigate to all main tabs
5. [ ] Camera permission prompt appears on first access
6. [ ] Can capture or view at least one image
7. [ ] Settings screen loads
8. [ ] Can log out successfully
```

### Exploratory Testing Sessions

Dedicate 30-minute sessions for unstructured exploration:

- **Charter**: Define what area to explore (e.g., "Explore the notification flow under poor network conditions")
- **Timebox**: Stick to 30 minutes
- **Notes**: Record every observation, even if not a bug
- **Debrief**: Share findings with the team

### Manual Testing Best Practices

- Test on real devices, not just simulators
- Clear app data between test runs to test fresh install
- Keep a running list of regression areas to re-check
- Document your test environment (OS version, device model, network)
- Note any inconsistencies in UI (spacing, alignment, color)

---

## 4. Automated Testing (Maestro)

### Maestro Flow Example

```yaml
appId: dev.onlymen.app
---
- launchApp
- waitForAnimationToEnd

# Login flow
- tapOn: "Email"
- inputText: "test@onlymen.dev"
- tapOn: "Password"
- inputText: "testpassword123"
- tapOn: "Log In"
- waitForAnimationToEnd

# Verify dashboard
- assertVisible: "Dashboard"
- assertVisible: "Welcome"

# Navigate to camera
- tapOn: "Camera"
- assertVisible: "Camera feed"
```

### Maestro Test Suite Structure

```
tests/
  smoke/
    login.yaml
    dashboard.yaml
    navigation.yaml
  features/
    package-detection.yaml
    alert-history.yaml
    settings.yaml
  edge-cases/
    offline-login.yaml
    empty-state.yaml
    rapid-taps.yaml
  regression/
    critical-flows.yaml
```

### Maestro Best Practices

- Use `testId` props for reliable element selection (prefer over text-based selectors)
- Add `waitForAnimationToEnd` after navigation actions
- Use `runScript` for conditional logic
- Keep flows under 50 steps each; split longer flows
- Use `output` to log values for debugging failures
- Run with `--include-tags` to target specific test sets

### Running Maestro Tests

```bash
# Run all tests
maestro test tests/

# Run smoke tests only
maestro test --include-tags smoke tests/

# Run on specific device
maestro test --device AndroidEmulator tests/

# Record output
maestro test --format junit --output results.xml tests/

# Validate a single flow
maestro studio
```

---

## 5. Accessibility Testing

### Accessibility Checklist

- [ ] All interactive elements have accessible labels
- [ ] Color contrast meets WCAG 2.1 AA (4.5:1 text, 3:1 large text)
- [ ] Touch targets are at least 44x44 points
- [ ] Screen reader announces all meaningful content
- [ ] Focus order is logical and consistent
- [ ] No information conveyed by color alone
- [ ] Animated content can be paused or reduced
- [ ] Text scales properly with system font size
- [ ] Dark mode maintains contrast and readability
- [ ] Error messages are clearly associated with their fields

### Testing with Screen Readers

#### iOS (VoiceOver)
1. Enable: Settings > Accessibility > VoiceOver
2. Navigate by swiping left/right
3. Double-tap to activate
4. Verify all buttons, inputs, and images have labels
5. Verify dynamic content announces changes

#### Android (TalkBack)
1. Enable: Settings > Accessibility > TalkBack
2. Navigate by swiping right
3. Double-tap to activate
4. Verify all views have content descriptions
5. Verify content changes trigger announcements

### Automated Accessibility Scanning

```bash
# iOS: Use Accessibility Inspector
xcrun accessibilityinspector --app ./Build/Products/Debug-iphonesimulator/OnlyMen.app

# Android: Use Accessibility Scanner (requires device)
adb shell settings put secure enabled_accessibility_services \
  com.google.android.marvin.talkback/com.google.android.marvin.talkback.TalkBackService
```

### Accessibility Quality Standards

- Zero critical accessibility issues (inability to use core features)
- Zero high issues (significant barriers to use)
- All images have meaningful alt text or are marked decorative
- All form fields have visible labels (not just placeholder text)
- Dynamic type / font scaling works at 200%

---

## 6. Tablet / Responsive Testing

### Device Matrix

| Category        | Devices                                  | Priority |
|-----------------|------------------------------------------|----------|
| Phone Small     | iPhone SE, Pixel 4a                     | P1       |
| Phone Standard  | iPhone 15, Pixel 8                      | P0       |
| Phone Large     | iPhone 15 Pro Max, Pixel 8 Pro          | P1       |
| Tablet Small    | iPad Mini                               | P2       |
| Tablet Standard | iPad Air                                | P1       |
| Tablet Large    | iPad Pro 12.9"                          | P1       |

### Responsive Test Points

For each screen:

- [ ] Layout adapts without horizontal scroll
- [ ] Text remains readable (no truncation of important content)
- [ ] Touch targets remain large enough
- [ ] Images scale appropriately
- [ ] Navigation adapts (bottom tabs on phone, sidebar on tablet)
- [ ] Forms remain usable in split-screen mode

### Orientation Testing

- [ ] Portrait mode renders correctly
- [ ] Landscape mode renders correctly
- [ ] Rotation during animation does not crash
- [ ] Rotation during data loading preserves state
- [ ] Camera preview maintains aspect ratio

### Split-Screen / Multi-Window

- [ ] App maintains state when entering split-screen
- [ ] App recovers gracefully when exiting split-screen
- [ ] Camera preview resizes correctly
- [ ] Forms remain usable alongside another app

---

## 7. Offline / Network Failure Testing

### Test Scenarios

| Scenario                         | Expected Behavior                          |
|----------------------------------|--------------------------------------------|
| Start offline, launch app        | Cached data shown, offline indicator visible|
| Go offline during active request | Request queued or fails gracefully         |
| Slow network (3G)                | Loading states shown, no timeout < 10s     |
| Network restored after offline   | Queued requests execute, data syncs        |
| Intermittent connectivity        | Retry logic handles fluctuation            |
| WiFi captive portal              | Redirect detected, user prompted           |
| VPN connection                   | App functions normally through VPN         |

### Network Conditioning

#### iOS (Network Link Conditioner)
Settings > Developer > Network Link Conditioner
- Use 100% Loss for offline testing
- Use Very Bad Network for slow conditions

#### Android (Android Studio)
- Use Network Profiler in Android Studio
- Or use `tc` on emulator:
```bash
# Simulate 500ms latency
adb shell tc qdisc add dev eth0 root netem delay 500ms

# Simulate packet loss
adb shell tc qdisc add dev eth0 root netem loss 30%

# Remove conditioning
adb shell tc qdisc del dev eth0 root
```

### Offline Indicator Requirements

When network is unavailable:
1. Show a visible but non-blocking banner
2. Queue user actions that require network
3. Display cached data with a "last updated" timestamp
4. Retry automatically when network returns
5. Do not show error dialogs for expected offline behavior

---

## 8. Permission Flow Testing

### Permission Matrix

| Permission     | First Access           | Denied Then Retry        | Permanently Denied       | Settings Change        |
|----------------|------------------------|--------------------------|--------------------------|------------------------|
| Camera         | System prompt shown    | Re-prompt or guide       | "Open Settings" link     | Feature re-enables     |
| Notifications  | System prompt shown    | Re-prompt after 24h      | "Open Settings" link     | Feature re-enables     |
| Location       | System prompt shown    | Re-prompt                | "Open Settings" link     | Feature re-enables     |
| Photos         | System prompt shown    | Re-prompt                | "Open Settings" link     | Feature re-enables     |

### Permission Test Script

```markdown
## Camera Permission Flow

1. Fresh install > Navigate to camera feature
2. [PASS] Camera permission prompt appears
3. Tap "Don't Allow"
4. [PASS] Graceful fallback shown (explain why camera is needed)
5. Navigate away and back to camera
6. [PASS] No re-prompt (OS prevents it)
7. Kill app and reopen
8. Navigate to camera
9. [PASS] Custom "Open Settings" screen appears with instructions
10. Open Settings > Toggle camera permission on
11. Return to app
12. [PASS] Camera feature now works without re-install
```

### Permission Testing Best Practices

- Test on fresh install AND after permission is already granted
- Test the "Don't Allow" path for every permission
- Verify graceful degradation when permission is denied
- Test toggling permissions in Settings while app is running
- Test that permission-related crashes are impossible
- Verify no silent failures when permission is denied

---

## 9. Bug Report Format

### Bug Report Template

```markdown
## Bug Report

**Title**: [One-line description of the bug]

**Severity**: Critical / High / Medium / Low

**Environment**:
- Device: [iPhone 15 / Pixel 8 / iPad Air]
- OS: [iOS 17.4 / Android 14]
- App Version: [2.1.0]
- Build: [2024.01.15.001]
- Network: [WiFi / LTE / Offline]

**Steps to Reproduce**:
1. Open the app
2. Navigate to [specific screen]
3. Tap [specific button]
4. [Continue until bug occurs]

**Expected Result**:
[What should happen]

**Actual Result**:
[What actually happens]

**Screenshots / Videos**:
[Attach or link]

**Reproducibility**:
Always / Sometimes (X out of Y attempts) / Once

**Additional Context**:
[Any other relevant information]
```

### Severity Definitions

| Severity | Definition                                                |
|----------|-----------------------------------------------------------|
| Critical | App crash, data loss, security vulnerability, complete block of core feature |
| High     | Major feature broken, no workaround available             |
| Medium   | Feature partially broken, workaround exists               |
| Low      | Cosmetic issue, typo, minor UX annoyance                  |

### Bug Report Quality Standards

- Title must describe the bug, not the symptom (wrong: "Button broken"; right: "Submit button unresponsive after rapid double-tap")
- Steps must be reproducible by someone unfamiliar with the feature
- Include device info and app version in every report
- Attach screenshots or screen recordings for UI bugs
- Mark reproducibility accurately (test at least 3 times)
- One bug per report -- do not bundle multiple issues

---

## 10. Common Gotchas

- **Simulator vs. real device**: Simulators do not replicate camera hardware, GPS, push notifications, or performance accurately. Always verify critical bugs on real devices.
- **Stale test data**: Cached data can mask bugs. Clear app data or use a fresh account for regression testing.
- **Timezone sensitivity**: Date-related bugs often only appear when the device is in a different timezone. Test with UTC offsets.
- **Permission memory**: Once a permission is denied on iOS, the OS won't re-show the prompt. Reset with Settings > Reset Location & Privacy.
- **Background/foreground transitions**: iOS and Android handle app lifecycle differently. Test interruptions (phone call, notification, app switch) thoroughly.
- **Font size accessibility**: Users with large system fonts may see truncated text or broken layouts. Test at 200% dynamic type.
- **Maestro flakiness**: Animations and slow network can cause false failures. Always add `waitForAnimationToEnd` and reasonable timeouts.
- **Orientation bugs**: Camera preview and video players are especially prone to rotation bugs. Test rotation during active camera sessions.

---

## 11. Quality Standards

- Every feature must have a written test plan before QA begins
- All P0 test cases must pass before any release
- Bug reports must follow the template exactly
- Accessibility must be tested on every release (automated + manual)
- At least 2 real devices must be used for final release validation
- Automated Maestro tests must cover all P0 and P1 flows
- Offline behavior must be tested for every feature that uses network
- Permission flows must be tested for every new permission added
