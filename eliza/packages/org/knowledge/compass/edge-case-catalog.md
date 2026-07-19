# Edge Case Catalog

## Overview

Comprehensive catalog of edge cases to consider during testing, organized by category.

## Empty States

### Data Empty States

| Scenario                    | Test Case                                  | Expected Behavior                    |
|-----------------------------|--------------------------------------------|--------------------------------------|
| Empty list                  | Load screen with no data                   | Show empty state illustration + CTA  |
| Empty search results        | Search for non-existent term               | "No results found" message           |
| Empty notifications         | Open notifications tab                     | "No notifications yet"               |
| Empty feed                  | Open feed with no posts                    | Onboarding or empty state            |
| Empty profile               | View profile with no posts                 | "Start posting" CTA                  |
| No followers                | View follower list                         | "No followers yet" message           |
| No saved items              | View saved/bookmarks                       | "Nothing saved yet" CTA              |
| Empty chat                  | Open new conversation                      | Prompt to start conversation         |
| No connected accounts       | View integrations                          | "Connect an account" CTA             |
| Empty calendar              | Open calendar view                         | "No events scheduled"                |

### Empty State Patterns

```javascript
// Consistent empty state component
const EmptyState = ({ icon, title, description, actionLabel, onAction }) => (
  <View style={styles.emptyContainer}>
    <Icon name={icon} size={64} color={colors.gray300} />
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.description}>{description}</Text>
    {actionLabel && (
      <Button onPress={onAction} title={actionLabel} />
    )}
  </View>
);
```

## Null/Undefined Inputs

### Input Validation

| Scenario                    | Test Case                                  | Expected Behavior                    |
|-----------------------------|--------------------------------------------|--------------------------------------|
| null in text field          | Set value to null programmatically          | Show empty field, no crash           |
| undefined name              | Display user with undefined name           | Show "Anonymous" or placeholder      |
| null avatar URL             | Display user with null avatar              | Show default avatar                  |
| undefined timestamp         | Display post with undefined date           | Show "Just now" or hide date         |
| null response body          | Handle API returning null body             | Default to empty object/array        |
| undefined in list item      | Render list with undefined item            | Skip or show placeholder             |
| null in nested object       | Access user.settings.theme                 | Use default theme                    |
| Empty string                | Submit form with empty string fields       | Trigger validation                   |

### Null Safety Patterns

```javascript
// Safe property access
const userName = user?.name ?? 'Anonymous';
const avatarUrl = user?.profile?.avatar ?? defaultAvatar;
const lastActive = user?.lastActive ?? new Date();

// Safe array access
const firstItem = items?.[0] ?? null;
const itemCount = items?.length ?? 0;

// Safe function calls
const result = callback?.() ?? defaultValue;
```

## Boundary Values

### Numeric Boundaries

| Scenario                    | Test Case                                  | Expected Behavior                    |
|-----------------------------|--------------------------------------------|--------------------------------------|
| Min value                   | Enter 0 for quantity                        | Accept or show min error             |
| Max value                   | Enter 999999 for quantity                   | Accept or show max error             |
| Negative value              | Enter -1 for quantity                       | Reject with error                    |
| Decimal value               | Enter 1.5 for integer field                | Reject or truncate                   |
| Zero                        | Enter 0 for price                          | Accept or validate business rules    |
| Very large number           | Enter 2^31 (integer overflow)              | Handle gracefully                    |
| Float precision             | Enter 0.1 + 0.2 = ?                        | Handle floating point issues         |

### String Boundaries

| Scenario                    | Test Case                                  | Expected Behavior                    |
|-----------------------------|--------------------------------------------|--------------------------------------|
| Empty string                | Submit with ""                             | Validation error                     |
| Single character            | Enter "a"                                  | Accept                               |
| Max length                  | Enter exactly max allowed chars            | Accept                               |
| Max length + 1              | Enter max + 1 chars                        | Truncate or reject                   |
| Whitespace only             | Enter "   "                                | Reject or trim                       |
| Very long string            | Enter 10,000 chars                         | Handle gracefully                    |

### Date Boundaries

| Scenario                    | Test Case                                  | Expected Behavior                    |
|-----------------------------|--------------------------------------------|--------------------------------------|
| Unix epoch                  | Date: 1970-01-01                           | Display correctly                    |
| Far future                  | Date: 2099-12-31                           | Accept or validate                   |
| Far past                    | Date: 1900-01-01                           | Accept or validate                   |
| Today                       | Current date                               | Display "Today"                      |
| Tomorrow                    | Next day                                   | Display "Tomorrow"                   |
| Leap year                   | Feb 29 in leap year                        | Accept                               |
| DST transition              | Date during DST change                     | Handle correctly                     |
| Timezone                    | Display time in user's timezone            | Convert correctly                    |

## Concurrent Operations

### Race Conditions

| Scenario                    | Test Case                                  | Expected Behavior                    |
|-----------------------------|--------------------------------------------|--------------------------------------|
| Double submit               | Tap submit twice quickly                   | Single submission                    |
| Concurrent edits            | Two users edit same record                 | Last-write-wins or conflict detect   |
| Rapid navigation            | Tap multiple tabs quickly                  | Final tab displayed                  |
| Refresh during action       | Pull-to-refresh while saving               | Complete save, then refresh          |
| Socket reconnect            | Connection drops and reconnects            | Resume without data loss             |
| Timer conflict              | Two timers fire simultaneously             | Both execute safely                  |

### Concurrency Patterns

```javascript
// Prevent double submit
const [isSubmitting, setIsSubmitting] = useState(false);

const handleSubmit = async () => {
  if (isSubmitting) return;
  setIsSubmitting(true);
  try {
    await submitForm();
  } finally {
    setIsSubmitting(false);
  }
};

// Optimistic updates with rollback
const updateItem = async (id, data) => {
  const previous = getItem(id);
  setItem(id, { ...previous, ...data });  // Optimistic
  try {
    await api.updateItem(id, data);
  } catch (error) {
    setItem(id, previous);  // Rollback
  }
};
```

## Network Failures

### Connection States

| Scenario                    | Test Case                                  | Expected Behavior                    |
|-----------------------------|--------------------------------------------|--------------------------------------|
| No internet                 | Toggle airplane mode, make request         | Show offline message                 |
| Slow connection             | Throttle to 2G speed                       | Show loading, timeout appropriately  |
| Connection drop mid-request | Cut connection during upload               | Show error, allow retry              |
| Intermittent connection     | Flaky network simulation                   | Retry logic, show status             |
| DNS failure                 | Invalid DNS response                       | Show connection error                |
| SSL certificate error       | Expired or invalid cert                    | Show security warning                |
| API timeout                 | Server doesn't respond in time             | Show timeout, retry option           |
| Rate limiting               | Exceed API rate limit                      | Show "try again later"               |

### Network Error Handling

```javascript
class NetworkErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  componentDidCatch(error, errorInfo) {
    if (error.name === 'NetworkError') {
      this.setState({ hasError: true, error });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <NetworkErrorFallback
          error={this.state.error}
          onRetry={() => this.setState({ hasError: false })}
        />
      );
    }
    return this.props.children;
  }
}
```

## Permission Denials

### Permission Scenarios

| Scenario                    | Test Case                                  | Expected Behavior                    |
|-----------------------------|--------------------------------------------|--------------------------------------|
| Camera denied               | Deny camera permission, try to take photo  | Show explanation + settings link     |
| Location denied             | Deny location permission                   | Show fallback or disable feature     |
| Photo library denied        | Deny photo access                          | Show explanation                      |
| Notification denied         | Deny notifications                         | Show in-app notifications only       |
| Microphone denied           | Deny mic access for voice message          | Show explanation                      |
| Settings redirect           | Tap "Open Settings" from denial screen     | Navigate to app settings             |
| Partial permission          | Allow "While Using" but not "Always"       | Use appropriate API                  |
| Permission revoked          | Revoke permission after granting           | Handle gracefully                    |

## Large Inputs

### Large Data Sets

| Scenario                    | Test Case                                  | Expected Behavior                    |
|-----------------------------|--------------------------------------------|--------------------------------------|
| Large list                  | Load 10,000+ items                         | Virtualized list, no jank            |
| Large image                 | Upload 20MB+ image                         | Compress or reject with message      |
| Large text                  | Paste 10,000+ word document                | Handle without crash                 |
| Large file upload           | Upload 100MB+ file                         | Progress indicator, handle timeout   |
| Large JSON response         | API returns 10MB+ response                 | Paginate or stream                   |
| Many notifications          | 1000+ unread notifications                 | Paginate, show summary               |
| Large attachment            | Send 50MB+ attachment in chat              | Upload with progress, compress       |

## Unicode and Special Characters

### Character Encoding

| Scenario                    | Test Case                                  | Expected Behavior                    |
|-----------------------------|--------------------------------------------|--------------------------------------|
| Emoji in text               | Post with "Hello 🎉"                       | Display correctly                    |
| Unicode names               | Name: "José María Ñoño"                   | Store and display correctly          |
| RTL text                    | Arabic/Hebrew text                         | Display RTL correctly                |
| CJK characters              | Chinese/Japanese/Korean text               | Display correctly                    |
| Zalgo text                  | "H̷̢̧e̶̱l̶l̵o̶"                           | Handle without UI breakage           |
| Script injection            | Input: "<script>alert('xss')</script>"     | Escape, don't execute                |
| SQL injection               | Input: "'; DROP TABLE users;--"            | Parameterized query, no injection    |
| Null bytes                  | Input: "test\0value"                       | Handle or reject                     |
| Control characters          | Input with \n, \r, \t                      | Handle appropriately                 |
| Combining characters        | "é" as "e" + accent                        | Normalize or handle                  |

## Time Zones

### Time Zone Handling

| Scenario                    | Test Case                                  | Expected Behavior                    |
|-----------------------------|--------------------------------------------|--------------------------------------|
| UTC display                 | Store all times in UTC                     | Convert for display                  |
| User timezone              | User in EST views PST event                | Show both or convert                 |
| DST transition forward      | Event during spring forward                | Handle hour gap                      |
| DST transition backward     | Event during fall back                     | Handle duplicate hour                |
| International users         | Different timezones viewing same event     | Show relative or timezone-labeled    |
| Midnight crossing           | Event crosses midnight in timezone         | Show correct date                    |
| Date line crossing          | Event crossing international date line     | Handle date correctly                |

### Time Zone Testing

```javascript
// Test time display in different zones
const testTimezones = [
  'America/New_York',
  'America/Los_Angeles',
  'Europe/London',
  'Asia/Tokyo',
  'Australia/Sydney',
  'Pacific/Auckland',
];

// Test DST transitions
const dstTestDates = [
  '2025-03-09T02:30:00',  // Spring forward (US)
  '2025-11-02T01:30:00',  // Fall back (US)
  '2025-03-30T01:30:00',  // Spring forward (EU)
  '2025-10-26T02:30:00',  // Fall back (EU)
];
```

## Quick Reference Checklist

- [ ] Empty states for all screens
- [ ] Null/undefined input handling
- [ ] Numeric boundary values (0, max, negative)
- [ ] String boundary values (empty, max length)
- [ ] Date boundary values (epoch, future, past)
- [ ] Concurrent operation handling
- [ ] Network failure scenarios
- [ ] Permission denial handling
- [ ] Large input handling
- [ ] Unicode and special characters
- [ ] Time zone handling
- [ ] DST transitions
- [ ] Keyboard shortcuts on web
- [ ] Screen reader compatibility
- [ ] Low memory conditions
- [ ] App backgrounding/foregrounding
- [ ] Device rotation
- [ ] Multi-window/split screen

## ATProto-Specific Edge Cases (this stack)

| Scenario | Test Case | Expected Behavior |
|----------|-----------|-------------------|
| Grapheme vs byte limits | Post with emoji/CJK near the limit (`maxGraphemes` 300 vs `maxLength` 3000 bytes on `app.bsky.feed.post`) | Counter matches graphemes; server accepts what the counter allows |
| Handle change | User changes handle mid-session; old handle mentioned in existing posts | DID-keyed data intact; old handle resolves to nothing or new owner, never the wrong profile |
| Handle vs DID identity | Block/mute a user, then they change handle | Block persists (keyed on DID, never handle) |
| Unknown union variant | Feed contains an embed type this client version doesn't know | Graceful degrade (placeholder), no crash — unions are open |
| Unknown knownValues | Label or ageassurance status outside the documented `knownValues` | Treated as unknown state, not an error |
| Firehose lag | Post created, AppView indexing delayed | Author sees own post (read-after-write); others see it eventually; no duplicate on catch-up |
| Cursor expiry | Paginate a feed, wait, request next page with stale cursor | Clean restart or continuation, no crash/dupes |
| Deleted-but-cached | Open a thread where a reply was deleted after caching | Tombstone placeholder, thread structure intact |
| Takedown vs delete | Content taken down by moderation vs deleted by author | Distinct UI treatments; appeal path only for takedowns |
| Age-gate states | Each `status` × `access` combo (`unknown/pending/assured/blocked` × `unknown/none/safe/full`), incl. region change mid-session | UI gates match `useComputeAgeAssuranceRegionAccess`; `blocked` is not bypassable via cached views |
| Contact-match lifecycle | Import → match → dismiss → re-import same contact | Dismissed match never resurfaces; `removeData` then `getSyncStatus` shows never-imported |
| Session refresh race | Access token expires during multi-request screen load | Single refresh, queued retries, no logout loop |
| Account deactivation | View profile/thread of a deactivated account | Designed unavailable state, not spinner or crash |
| Self-labeled content | Author self-labels post as adult content | Blur/warning per label definition and viewer prefs, on every surface (feed, thread, embeds, notifications) |
