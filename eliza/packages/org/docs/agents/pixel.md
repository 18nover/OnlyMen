# Pixel — `pixel`

> Design System Architect for the OnlyMen engineering organization.

| | |
|---|---|
| **Username** | `pixel-design` |
| **Role** | `design_system_architect` |
| **Org permissions** | request review, raise blocker |
| **Skills** | [`accessibility-review`](../../skills/accessibility-review/SKILL.md) |
| **Review type** | `design_review` |

- Guardian of visual consistency, accessibility, and user experience.
- Thinks in systems, not screens — every component is part of a larger whole.
- Accessibility is not a feature, it's a requirement.

**Expertise:** design systems, ALF design system, component libraries, responsive layouts, color systems, typography, spacing, motion design, accessibility, WCAG, dark mode, tablet layouts, visual consistency, icon systems, @bsky.app/alf package, light/dark/dim themes, icon naming convention

## Knowledge base

- [ALF Design System](../../knowledge/pixel/alf-design-system.md)
- [Color System](../../knowledge/pixel/color-system.md)
- [Typography](../../knowledge/pixel/typography.md)
- [Spacing System](../../knowledge/pixel/spacing.md)
- [Responsive Layouts](../../knowledge/pixel/responsive-layouts.md)
- [Icon System](../../knowledge/pixel/icons.md)
- [Design Principles](../../shared/design-principles.md)
- [AT Protocol Primer](../../shared/atproto.md)

## Commands

All commands run from `packages/org/` (or put `packages/org/bin` on your
PATH). The server must be running for everything except `start`/`agents`.

### Run Pixel

```bash
./bin/org start pixel     # boot the agent server as Pixel on :2139
./bin/org status            # health + running agent
./bin/org logs 40           # tail the server log
./bin/org stop
```

### Talk to Pixel (LLM chat — 1–3 min per turn)

```bash
./bin/org say "Pixel, Which spacing tokens should the settings rows use?"
```

### Board commands involving Pixel (instant REST, no LLM)

```bash
# Assign work to Pixel
./bin/org assign pixel "Define tokens for the new badge component" --priority high

# Request a review from Pixel
./bin/org review pixel --type design_review --task TASK-001

# Progress a task Pixel owns
./bin/org task TASK-001 in_progress
./bin/org task TASK-001 done

# Raise a blocker on Pixel's behalf
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
  -d '{"assignee":"pixel","title":"Define tokens for the new badge component","priority":"high"}'
```

### Chat actions Pixel can trigger

When you chat (via `org say` or the dashboard), the planner can route to
these org actions — parameters are extracted from your message:

| Action | Parameters | Example message |
|---|---|---|
| `ASSIGN_WORK` | assignee, title, priority?, description?, deadline? | "Assign nova the search screen, high priority" |
| `REQUEST_REVIEW` | reviewer, type?, taskId? | "Request a design review from sentinel on TASK-001" |
| `ESCALATE` | description, severity?, taskId? | "Escalate: blocked on the SDK upgrade, critical" |
| `REPORT_COMPLETE` | taskId, summary? | "TASK-001 is done — shipped and tested" |
| `SUMMARIZE` | — | "Give me the org status" |
