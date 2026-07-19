---
name: performance-review
description: >
  Comprehensive performance review skill for OnlyMen React Native applications.
  Provides structured methodologies for profiling, memory leak detection, battery
  optimization, network performance analysis, startup time measurement, frame rate
  monitoring, bundle size analysis, and Hermes engine optimization.
version: 1.0.0
authors:
  - Pulse
tags:
  - performance
  - profiling
  - react-native
  - hermes
  - optimization
  - memory
  - battery
applicable_agents:
  - Pulse
---

# Performance Review Skill

## Overview

This skill provides a structured methodology for identifying, measuring, and
optimizing performance in OnlyMen React Native applications. It covers profiling
tools, common performance anti-patterns, optimization techniques, and monitoring
strategies. Use this skill when conducting performance reviews, investigating
performance regressions, or establishing performance baselines.

## Scope

This skill applies to:
- React Native JavaScript/TypeScript code
- Native bridge interactions (iOS/Android)
- Hermes engine runtime performance
- Network requests and API performance
- Image and media loading
- App startup and navigation performance
- Memory management and battery impact

---

## 1. React Native Profiling Tools

### React Native Performance Monitor

Built-in overlay showing FPS, JS thread, and UI thread performance.

**Enable in Development:**
```bash
# iOS
Cmd+D → Show Perf Monitor

# Android
Cmd+M (or shake gesture) → Show Perf Monitor
```

### React DevTools Profiler

- Open React DevTools → Profiler tab
- Record interactions to capture flamegraphs
- Identify unnecessary re-renders
- Compare commits to find regressions

### Flipper Profiler

- Memory, network, layout, and crash inspection
- Custom plugins for app-specific profiling
- Timeline view for correlating events

### Xcode Instruments (iOS)

- **Time Profiler** — CPU usage over time
- **Allocations** — Memory allocation tracking
- **Leaks** — Memory leak detection
- **Energy Log** — Battery and energy impact
- **Core Animation** — Frame rendering performance

### Android Studio Profiler (Android)

- **CPU Profiler** — Thread and method-level CPU usage
- **Memory Profiler** — Allocation tracking and GC analysis
- **Network Profiler** — Request timing and payload inspection
- **Energy Profiler** — Battery impact analysis

### Profiling Checklist

- [ ] Profile in release mode (not debug) for accurate results
- [ ] Profile on representative devices (low-end and high-end)
- [ ] Profile with realistic data volumes and network conditions
- [ ] Capture baseline metrics before optimization
- [ ] Re-profile after each optimization to verify impact
- [ ] Document performance benchmarks for regression detection

---

## 2. Memory Leak Detection

### Common Memory Leak Sources

| Source | Description | Detection Method |
|---|---|---|
| Event listeners | Not removed on unmount | Flipper memory profiler |
| Timers/intervals | `setInterval` not cleared | Manual code review |
| Subscriptions | Observable subscriptions not unsubscribed | Flipper / Instruments |
| Closures | Large objects captured in closures | Heap snapshots |
| Image caches | Unbounded image cache growth | Memory profiler over time |
| Navigation state | Stale screen references | Navigation debugging |
| Native modules | Unreleased native allocations | Xcode/Android profiler |

### Detection Process

1. **Establish baseline** — Record memory usage at app start and after idle
2. **Stress test** — Navigate through all screens, perform heavy operations
3. **Monitor growth** — Watch for monotonically increasing memory
4. **Heap snapshots** — Take snapshots before and after operations
5. **Diff analysis** — Compare snapshots to identify retained objects

### Code Patterns That Cause Leaks

```tsx
// BAD: Event listener not removed
useEffect(() => {
  const subscription = EventEmitter.addListener('event', handler);
  // Missing: return () => subscription.remove();
}, []);

// GOOD: Proper cleanup
useEffect(() => {
  const subscription = EventEmitter.addListener('event', handler);
  return () => subscription.remove();
}, []);

// BAD: Timer not cleared
useEffect(() => {
  setInterval(() => fetchData(), 5000);
  // Missing: return () => clearInterval(id);
}, []);

// GOOD: Proper cleanup
useEffect(() => {
  const id = setInterval(() => fetchData(), 5000);
  return () => clearInterval(id);
}, []);
```

### Memory Leak Checklist

- [ ] All `useEffect` hooks have cleanup functions where needed
- [ ] Event listeners removed on component unmount
- [ ] Timers and intervals cleared on unmount
- [ ] Navigation subscriptions cleaned up
- [ ] Large object references released when no longer needed
- [ ] Image caches have size limits
- [ ] Native module allocations properly managed

---

## 3. Battery Optimization

### Battery-Draining Operations

| Operation | Impact | Optimization |
|---|---|---|
| Background location | Critical | Use significant location changes only |
| Continuous GPS | Critical | Batch updates, reduce frequency |
| Background fetch | High | Use push notifications instead |
| Bluetooth scanning | High | Scan only when needed |
| Animations (continuous) | Medium | Pause when screen not visible |
| Network polling | Medium | Use push/long-polling |
| Wakelock usage | Medium | Release ASAP |

### Optimization Techniques

**Location Services**
```tsx
// BAD: Continuous high-accuracy location
Geolocation.watchPosition(
  (position) => updatePosition(position),
  (error) => console.error(error),
  { enableHighAccuracy: true, distanceFilter: 0 }
);

// GOOD: Significant location changes
Geolocation.watchPosition(
  (position) => updatePosition(position),
  (error) => console.error(error),
  { enableHighAccuracy: false, distanceFilter: 100 }
);
```

**Background Tasks**
- Use `BackgroundFetch` API sparingly
- Prefer push notifications for timely updates
- Batch background operations into single sessions
- Respect iOS background execution limits

**Animation Optimization**
- Use `useNativeDriver: true` for all animations
- Stop animations when screen is not focused
- Use `InteractionManager.runAfterInteractions` for heavy work
- Prefer `Animated` over `LayoutAnimation` for performance

### Battery Checklist

- [ ] No continuous background operations without user action
- [ ] Location services use lowest accuracy required
- [ ] Animations pause when screen not visible
- [ ] Network requests batched and deduplicated
- [ ] Push notifications used instead of polling
- [ ] Bluetooth/NFC scanning only when needed
- [ ] Wakelocks released immediately after use

---

## 4. Network Performance

### Request Optimization

- [ ] API responses cached with appropriate TTL
- [ ] Pagination implemented for list endpoints
- [ ] GraphQL queries optimized to request only needed fields
- [ ] Image URLs include size/quality parameters
- [ ] Request deduplication for concurrent identical requests
- [ ] Retry logic with exponential backoff
- [ ] Timeout configured for all requests

### Caching Strategy

```
Layer 1: In-memory cache (fastest, volatile)
Layer 2: AsyncStorage/disk cache (persistent, slower)
Layer 3: Network (slowest, most current)
```

**Cache-First Pattern (offline-capable):**
```tsx
const fetchData = async (key: string) => {
  // 1. Check in-memory cache
  if (memoryCache.has(key)) return memoryCache.get(key);
  
  // 2. Check disk cache
  const diskCached = await diskCache.get(key);
  if (diskCached && !isExpired(diskCached)) return diskCached.data;
  
  // 3. Fetch from network
  const data = await api.fetch(key);
  await diskCache.set(key, { data, timestamp: Date.now() });
  memoryCache.set(key, data);
  return data;
};
```

### Network Monitoring

- Track request latency (p50, p95, p99)
- Monitor error rates by endpoint
- Alert on latency regression (>20% increase)
- Log payload sizes for bandwidth analysis

### Common Network Issues

- **Waterfall requests** — Parallelize independent requests
- **Large payloads** — Implement pagination, field selection
- **No caching** — Repeated identical requests
- **Missing timeouts** — Requests hanging indefinitely
- **No retry logic** — Single failure kills the flow
- **DNS resolution** — Consider connection pooling

---

## 5. Startup Time Measurement

### Metrics to Track

| Metric | Target | Description |
|---|---|---|
| Cold start | < 2s | App launch from terminated state |
| Warm start | < 1s | App launch from background |
| Time to Interactive | < 2s | First meaningful interaction possible |
| Time to First Byte | < 200ms | First API response |
| JS Bundle Load | < 500ms | JavaScript bundle parsing time |

### Measurement Tools

**iOS**
```bash
# Instruments: App Launch
xcrun simctl launch --console booted com.app.bundle
# Measure time from process start to first frame
```

**Android**
```bash
# adb shell am start -W com.app/.MainActivity
# TotalTime: time from start to first frame
```

**React Native**
```tsx
// Measure JS initialization time
const startTime = Date.now();
// ... app initialization
console.log(`App init: ${Date.now() - startTime}ms`);
```

### Optimization Techniques

**Bundle Size Reduction**
- Enable Hermes (reduces bundle size ~60%)
- Implement code splitting (React.lazy)
- Remove unused dependencies
- Enable ProGuard/R8 (Android)
- Use inline requires for non-critical modules

**Native Module Optimization**
- Lazy-load native modules (avoid eager registration)
- Reduce bridge crossings on startup
- Use TurboModules for new native code
- Defer non-essential native initialization

**JavaScript Optimization**
- Defer non-critical initialization to after first render
- Use `InteractionManager.runAfterInteractions` for heavy work
- Avoid synchronous operations on startup
- Pre-fetch critical data during splash screen

### Startup Optimization Checklist

- [ ] Hermes engine enabled
- [ ] Bundle size under 500KB (gzipped)
- [ ] No synchronous bridge calls during startup
- [ ] Critical path JavaScript minimized
- [ ] Splash screen used during initialization
- [ ] Non-essential services deferred
- [ ] Image prefetching deferred to after first render
- [ ] Analytics SDK initialized after first frame

---

## 6. Frame Rate Monitoring

### Target Metrics

| Metric | Target | Threshold |
|---|---|---|
| JS Thread FPS | 60 fps | < 50 fps = degraded |
| UI Thread FPS | 60 fps | < 50 fps = degraded |
| Frame drops | 0 per second | > 2 = janky |
| JS thread blocking | < 16ms per frame | > 16ms = dropped frame |

### Common Frame Drop Causes

| Cause | Symptom | Fix |
|---|---|---|
| Heavy JS computation | JS thread below 60fps | Move to native or web worker |
| Excessive re-renders | Component tree too deep | Memoization, virtualization |
| Large lists | Scroll jank | FlatList/FlashList optimization |
| Complex animations | UI thread below 60fps | Use `useNativeDriver` |
| Layout thrashing | Intermittent jank | Batch layout reads/writes |
| Bridge congestion | Cross-thread delays | Minimize bridge calls |

### Optimization Patterns

**List Virtualization**
```tsx
// Use FlashList for best performance
import { FlashList } from '@shopify/flash-list';

<FlashList
  data={items}
  renderItem={({ item }) => <ItemRow item={item} />}
  estimatedItemSize={80}
  keyExtractor={(item) => item.id}
/>
```

**Memoization**
```tsx
// Memoize expensive computations
const filteredItems = useMemo(
  () => items.filter(item => item.matches(filter)),
  [items, filter]
);

// Memoize expensive components
const ItemRow = React.memo(({ item }: { item: Item }) => (
  <View>{/* complex rendering */}</View>
));
```

**Native Driver Animation**
```tsx
// Always use native driver for animations
Animated.timing(opacity, {
  toValue: 1,
  duration: 300,
  useNativeDriver: true,  // Critical for performance
}).start();
```

### Frame Rate Checklist

- [ ] FlashList used for all lists > 20 items
- [ ] `useMemo` and `useCallback` used for expensive computations
- [ ] `React.memo` used for components that receive stable props
- [ ] All animations use `useNativeDriver: true`
- [ ] No heavy computation in render function
- [ ] Image loading optimized (lazy, cached, properly sized)
- [ ] Re-renders minimized (proper key props, state colocation)

---

## 7. Bundle Size Analysis

### Measurement

```bash
# Analyze bundle size
npx react-native-bundle-visualizer

# Check specific module sizes
npx source-map-explorer main.jsbundle --json > bundle-report.json

# Android APK analysis
cd android && ./gradlew assembleRelease && \
  build/app/outputs/apk/release/app-release.apk
```

### Bundle Size Targets

| Platform | Target | Maximum |
|---|---|---|
| iOS (JS bundle) | < 300KB | 500KB |
| Android (APK) | < 15MB | 25MB |
| Android (AAB) | < 10MB | 20MB |

### Reduction Techniques

**Dependencies**
- Audit all dependencies for size impact
- Replace heavy libraries with lighter alternatives
- Use tree-shaking-friendly libraries
- Import specific functions instead of entire packages

```tsx
// BAD: Importing entire library
import _ from 'lodash';
_.debounce(fn, 300);

// GOOD: Import specific function
import debounce from 'lodash/debounce';
debounce(fn, 300);
```

**Code Splitting**
```tsx
// Lazy-load non-critical screens
const SettingsScreen = React.lazy(
  () => import('./screens/SettingsScreen')
);

// Use dynamic imports for features
const loadFeature = () => import('./features/advanced');
```

**Asset Optimization**
- Compress images (use WebP where supported)
- Use vector icons instead of PNG icons
- Remove unused assets
- Use `react-native-svg` for vector graphics

### Bundle Size Checklist

- [ ] Bundle visualizer reviewed regularly
- [ ] No unused dependencies
- [ ] Tree-shaking enabled and effective
- [ ] Heavy libraries lazy-loaded
- [ ] Images compressed and properly sized
- [ ] Vector icons used instead of raster images
- [ ] ProGuard/R8 enabled (Android)

---

## 8. Hermes Profiling

### Enabling Hermes

**iOS** (`ios/Podfile`):
```ruby
:hermes_enabled => true
```

**Android** (`android/gradle.properties`):
```properties
hermesEnabled=true
```

### Hermes Performance Benefits

- **Startup time** — Bytecode precompiled, no JS parsing at runtime
- **Memory** — More efficient garbage collection
- **App size** — Bytecode smaller than JavaScript source
- **Execution** — Optimized for mobile-specific patterns

### Hermes-Specific Profiling

```bash
# Enable Hermes profiling
# Build with profiling enabled (Release mode)
npx react-native run-android --variant=release

# Pull trace file
adb pull /sdcard/hermes-profile.trace

# Open in Chrome DevTools
# chrome://tracing → Load hermes-profile.trace
```

### Common Hermes Issues

| Issue | Cause | Solution |
|---|---|---|
| Slow startup in debug | Metro bundler overhead | Test in release mode only |
| Large bundle despite Hermes | Source maps included | Strip source maps for release |
| Hermes not active | Build misconfiguration | Verify `hermesEnabled=true` |
| Memory issues with Hermes | GC pressure from large allocations | Profile and reduce allocations |

### Hermes Optimization Checklist

- [ ] Hermes enabled in all build configurations
- [ ] Profiled in release mode (not debug)
- [ ] Bytecode size within targets
- [ ] No compatibility issues with native modules
- [ ] JavaScript engine performance validated

---

## 9. Optimization Techniques

### Priority Order (Highest Impact First)

1. **Reduce bundle size** — Directly impacts startup time and memory
2. **Enable Hermes** — Broad performance improvement
3. **Optimize lists** — Most common performance bottleneck
4. **Minimize bridge calls** — Reduce cross-thread communication
5. **Cache aggressively** — Reduce network dependency
6. **Lazy load** — Defer non-critical work
7. **Memoize** — Prevent unnecessary re-renders
8. **Profile regularly** — Catch regressions early

### Performance Budgets

| Metric | Budget | Enforcement |
|---|---|---|
| JS bundle size | < 500KB gzipped | CI check |
| First meaningful paint | < 2s | Automated testing |
| Frame rate | > 55fps | Manual profiling |
| Memory peak | < 150MB | Memory profiler |
| API response time | < 500ms p95 | APM monitoring |

### Performance Review Process

1. **Baseline** — Capture metrics before changes
2. **Profile** — Identify specific bottlenecks
3. **Optimize** — Address highest-impact issues first
4. **Verify** — Re-profile to confirm improvements
5. **Document** — Record benchmarks and optimizations
6. **Monitor** — Set up alerts for regressions

---

## Escalation Paths

| Issue Type | Severity | Response Time | Escalation |
|---|---|---|---|
| App crash / ANR | Critical | Immediate | Pulse + Engineering Lead |
| Major frame drops (>50% drops) | High | 24 hours | Pulse |
| Startup time > 5s | High | 48 hours | Pulse |
| Memory leak (monotonic growth) | Medium | 1 sprint | Pulse |
| Minor performance improvement | Low | Backlog | Pulse |

### Escalation Process

1. Profile the issue on representative devices
2. Capture flamegraphs and memory dumps
3. Document reproduction steps
4. Identify root cause with evidence
5. Propose optimization with expected impact
6. Implement and verify improvement

---

## Common Gotchas

- **Profiling in debug mode** — Debug builds are 10-100x slower. Always profile in release mode.
- **Ignoring JS thread** — UI thread may be fine but JS thread is blocking. Profile both threads.
- **Premature optimization** — Profile first, optimize based on data, not assumptions.
- **Ignoring low-end devices** — What runs fine on iPhone 15 may fail on iPhone SE.
- **FlatList without `getItemLayout`** — Without it, FlatList can't optimize scrolling.
- **Anonymous functions in props** — Creates new reference each render, defeating memoization.
- **Missing `keyExtractor`** — Default key extraction is O(n) per item.
- **Large state objects** — Unnecessary state causes excessive re-renders.
- **Synchronous storage access** — AsyncStorage is async; using it synchronously blocks the thread.
- **Network waterfall** — Sequential API calls that could be parallelized.
- **Image size mismatch** — Loading full-resolution images for thumbnails.
- **Console.log in production** — Console operations are expensive; strip all logging.
