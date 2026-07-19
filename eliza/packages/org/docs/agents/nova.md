# Nova — `nova`

> React Native and Expo Architect for the OnlyMen engineering organization.

| | |
|---|---|
| **Username** | `nova-rn` |
| **Role** | `react_native_architect` |
| **Org permissions** | request review, raise blocker |
| **Skills** | [`react-native-dev`](../../skills/react-native-dev/SKILL.md), [`expo-dev`](../../skills/expo-dev/SKILL.md) |
| **Review type** | `code_review` |

- Expert in React Native, Expo SDK, Expo Router, TypeScript, native modules, and state management.
- Opinionated about patterns — advocates for consistency and performance.
- Thinks in components, reasons in data flows, ships in features.

**Expertise:** React Native, Expo, Expo Router, TypeScript, state management, navigation, performance optimization, accessibility, responsive design, native modules, ALF design system, EAS builds, platform-specific code, React Compiler, @atproto/api client, cursor pagination, typed XRPC errors, read-after-write

## Knowledge base

- [React Native Patterns](../../knowledge/nova/react-native-patterns.md)
- [Expo SDK Guide](../../knowledge/nova/expo-sdk-guide.md)
- [Navigation Patterns](../../knowledge/nova/navigation-patterns.md)
- [State Management](../../knowledge/nova/state-management.md)
- [Client-Backend ATProto Integration](../../knowledge/nova/client.md)
- [Coding Standards](../../shared/coding-standards.md)
- [Design Principles](../../shared/design-principles.md)
- [AT Protocol Primer](../../shared/atproto.md)

## Commands

All commands run from `packages/org/` (or put `packages/org/bin` on your
PATH). The server must be running for everything except `start`/`agents`.

### Run Nova

```bash
./bin/org start nova     # boot the agent server as Nova on :2139
./bin/org status            # health + running agent
./bin/org logs 40           # tail the server log
./bin/org stop
```

### Talk to Nova (LLM chat — 1–3 min per turn)

```bash
./bin/org say "Nova, What is the right navigation pattern for the new tab?"
```

### Board commands involving Nova (instant REST, no LLM)

```bash
# Assign work to Nova
./bin/org assign nova "Implement the notifications settings screen" --priority high

# Request a review from Nova
./bin/org review nova --type code_review --task TASK-001

# Progress a task Nova owns
./bin/org task TASK-001 in_progress
./bin/org task TASK-001 done

# Raise a blocker on Nova's behalf
./bin/org escalate "Blocked on upstream API change" --severity high --task TASK-001

# Board state
./bin/org summary
./bin/org board
```

REST equivalents (the CLI is a thin wrapper over these):

```bash
curl -s localhost:2139/api/org/summary
curl -s localhost:2139/api/org/board
curl -s -X POST localhost:2139/api/org/tasks \
  -H 'content-type: application/json' \
  -d '{"assignee":"nova","title":"Implement the notifications settings screen","priority":"high"}'
```

### Chat actions Nova can trigger

When you chat (via `org say` or the dashboard), the planner can route to
these org actions — parameters are extracted from your message:

| Action | Parameters | Example message |
|---|---|---|
| `ASSIGN_WORK` | assignee, title, priority?, description?, deadline? | "Assign forge the search screen, high priority" |
| `REQUEST_REVIEW` | reviewer, type?, taskId? | "Request a code review from sentinel on TASK-001" |
| `ESCALATE` | description, severity?, taskId? | "Escalate: blocked on the SDK upgrade, critical" |
| `REPORT_COMPLETE` | taskId, summary? | "TASK-001 is done — shipped and tested" |
| `SUMMARIZE` | — | "Give me the org status" |
