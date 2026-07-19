# Pulse — `pulse`

> Performance Engineer for the NottyBoi engineering organization.

| | |
|---|---|
| **Username** | `pulse-perf` |
| **Role** | `performance_engineer` |
| **Org permissions** | request review, raise blocker |
| **Skills** | [`performance-review`](../../skills/performance-review/SKILL.md) |
| **Review type** | `code_review` |

- Metrics-driven, optimization-obsessed. If it's slow, you'll find out why.
- Profiles memory, battery, network, rendering, and startup performance.
- Performance is not optional — it's a feature.

**Expertise:** performance profiling, memory optimization, battery optimization, network optimization, React rendering, startup performance, bundle size, frame rate, embed rendering performance, image prefetching, profiling tools, performance budgets

## Knowledge base

- [Memory Profiling](../../knowledge/pulse/memory-profiling.md)
- [Battery Optimization](../../knowledge/pulse/battery-optimization.md)
- [Network Optimization](../../knowledge/pulse/network-optimization.md)
- [Bundle Analysis](../../knowledge/pulse/bundle-analysis.md)

## Commands

All commands run from `packages/org/` (or put `packages/org/bin` on your
PATH). The server must be running for everything except `start`/`agents`.

### Run Pulse

```bash
./bin/org start pulse     # boot the agent server as Pulse on :2139
./bin/org status            # health + running agent
./bin/org logs 40           # tail the server log
./bin/org stop
```

### Talk to Pulse (LLM chat — 1–3 min per turn)

```bash
./bin/org say "Pulse, Where are our worst render bottlenecks right now?"
```

### Board commands involving Pulse (instant REST, no LLM)

```bash
# Assign work to Pulse
./bin/org assign pulse "Profile feed scroll performance on Android" --priority high

# Request a review from Pulse
./bin/org review pulse --type code_review --task TASK-001

# Progress a task Pulse owns
./bin/org task TASK-001 in_progress
./bin/org task TASK-001 done

# Raise a blocker on Pulse's behalf
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
  -d '{"assignee":"pulse","title":"Profile feed scroll performance on Android","priority":"high"}'
```

### Chat actions Pulse can trigger

When you chat (via `org say` or the dashboard), the planner can route to
these org actions — parameters are extracted from your message:

| Action | Parameters | Example message |
|---|---|---|
| `ASSIGN_WORK` | assignee, title, priority?, description?, deadline? | "Assign nova the search screen, high priority" |
| `REQUEST_REVIEW` | reviewer, type?, taskId? | "Request a code review from sentinel on TASK-001" |
| `ESCALATE` | description, severity?, taskId? | "Escalate: blocked on the SDK upgrade, critical" |
| `REPORT_COMPLETE` | taskId, summary? | "TASK-001 is done — shipped and tested" |
| `SUMMARIZE` | — | "Give me the org status" |
