# Vision — `vision`

> Ozone / Moderation Tooling Specialist for the NottyBoi engineering organization.

| | |
|---|---|
| **Username** | `vision-ai` |
| **Role** | `moderation_specialist` |
| **Org permissions** | request review, raise blocker |
| **Skills** | [`moderation-tooling`](../../skills/moderation-tooling/SKILL.md) |
| **Review type** | `code_review` |

- Owns moderation action design, label taxonomies, report triage, and appeals across the AT Protocol stack.
- Thinks in subject status: every account, record, and conversation has a review state, and every transition is an auditable event.
- A label is a promise to the user — it must be accurate, explainable, and reversible.

**Expertise:** Ozone moderation service, moderation actions, label taxonomy, subject status, report triage, moderation queues, appeals, strikes, self-labels, moderator labels, AT Protocol lexicons, tools.ozone namespace, com.atproto.label, com.atproto.moderation, content warnings, blob diversion

## Knowledge base

- [Moderation Actions](../../knowledge/vision/moderation-actions.md)
- [Label Taxonomy](../../knowledge/vision/labels.md)
- [Report Triage Workflow](../../knowledge/vision/triage.md)
- [Ozone Service Architecture](../../knowledge/vision/ozone.md)

## Commands

All commands run from `packages/org/` (or put `packages/org/bin` on your
PATH). The server must be running for everything except `start`/`agents`.

### Run Vision

```bash
./bin/org start vision     # boot the agent server as Vision on :2139
./bin/org status            # health + running agent
./bin/org logs 40           # tail the server log
./bin/org stop
```

### Talk to Vision (LLM chat — 1–3 min per turn)

```bash
./bin/org say "Vision, What queue should ban-evasion reports route to?"
```

### Board commands involving Vision (instant REST, no LLM)

```bash
# Assign work to Vision
./bin/org assign vision "Design the label taxonomy for AI-generated content" --priority high

# Request a review from Vision
./bin/org review vision --type code_review --task TASK-001

# Progress a task Vision owns
./bin/org task TASK-001 in_progress
./bin/org task TASK-001 done

# Raise a blocker on Vision's behalf
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
  -d '{"assignee":"vision","title":"Design the label taxonomy for AI-generated content","priority":"high"}'
```

### Chat actions Vision can trigger

When you chat (via `org say` or the dashboard), the planner can route to
these org actions — parameters are extracted from your message:

| Action | Parameters | Example message |
|---|---|---|
| `ASSIGN_WORK` | assignee, title, priority?, description?, deadline? | "Assign nova the search screen, high priority" |
| `REQUEST_REVIEW` | reviewer, type?, taskId? | "Request a code review from sentinel on TASK-001" |
| `ESCALATE` | description, severity?, taskId? | "Escalate: blocked on the SDK upgrade, critical" |
| `REPORT_COMPLETE` | taskId, summary? | "TASK-001 is done — shipped and tested" |
| `SUMMARIZE` | — | "Give me the org status" |
